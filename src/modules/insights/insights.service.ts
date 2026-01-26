import { prisma } from '../../database/prisma.js'
import { TransactionType } from '@prisma/client'

interface Insight {
  id: string
  type: 'alert' | 'tip' | 'achievement' | 'trend'
  title: string
  description: string
  icon: string
}

interface InsightsData {
  generatedAt: string
  insights: Insight[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    topCategory: string
    topCategoryAmount: number
    savingsRate: number
  }
}

// Cache for insights (24 hours)
interface CacheEntry {
  data: InsightsData
  timestamp: number
}

const insightsCache: Map<string, CacheEntry> = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export class InsightsService {
  async getInsights(userId: string, forceRefresh = false): Promise<InsightsData> {
    const cacheKey = `insights:${userId}`

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = insightsCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
      }
    }

    // Get user's transaction data for analysis
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch current month transactions
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
      include: { category: true },
    })

    // Fetch last month transactions
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      include: { category: true },
    })

    // Calculate summary data
    const summary = this.calculateSummary(currentMonthTransactions)

    // Generate insights
    let insights: Insight[]

    if (GEMINI_API_KEY) {
      insights = await this.generateAIInsights(
        currentMonthTransactions,
        lastMonthTransactions,
        summary
      )
    } else {
      insights = this.generateRuleBasedInsights(
        currentMonthTransactions,
        lastMonthTransactions,
        summary
      )
    }

    const result: InsightsData = {
      generatedAt: new Date().toISOString(),
      insights,
      summary,
    }

    // Cache the result
    insightsCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return result
  }

  private calculateSummary(transactions: { type: TransactionType; amount: unknown; category: { name: string } }[]) {
    let totalIncome = 0
    let totalExpense = 0
    const categoryTotals: Record<string, number> = {}

    for (const tx of transactions) {
      const amount = Number(tx.amount)
      if (tx.type === 'INCOME') {
        totalIncome += amount
      } else {
        totalExpense += amount
        categoryTotals[tx.category.name] = (categoryTotals[tx.category.name] || 0) + amount
      }
    }

    // Find top spending category
    let topCategory = 'Nenhuma'
    let topCategoryAmount = 0
    for (const [cat, amount] of Object.entries(categoryTotals)) {
      if (amount > topCategoryAmount) {
        topCategory = cat
        topCategoryAmount = amount
      }
    }

    const balance = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

    return {
      totalIncome,
      totalExpense,
      balance,
      topCategory,
      topCategoryAmount,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
    }
  }

  private async generateAIInsights(
    currentTransactions: { type: TransactionType; amount: unknown; category: { name: string }; description: string | null }[],
    lastMonthTransactions: { type: TransactionType; amount: unknown; category: { name: string } }[],
    summary: { totalIncome: number; totalExpense: number; balance: number; topCategory: string; topCategoryAmount: number; savingsRate: number }
  ): Promise<Insight[]> {
    try {
      // Prepare data summary for AI
      const currentByCategory: Record<string, number> = {}
      const lastByCategory: Record<string, number> = {}

      for (const tx of currentTransactions) {
        if (tx.type === 'EXPENSE') {
          currentByCategory[tx.category.name] = (currentByCategory[tx.category.name] || 0) + Number(tx.amount)
        }
      }

      for (const tx of lastMonthTransactions) {
        if (tx.type === 'EXPENSE') {
          lastByCategory[tx.category.name] = (lastByCategory[tx.category.name] || 0) + Number(tx.amount)
        }
      }

      const prompt = `Você é um assistente financeiro pessoal brasileiro. Analise os dados financeiros abaixo e gere exatamente 3 insights práticos em português brasileiro.

Dados do mês atual:
- Receita total: R$ ${summary.totalIncome.toFixed(2)}
- Despesa total: R$ ${summary.totalExpense.toFixed(2)}
- Saldo: R$ ${summary.balance.toFixed(2)}
- Taxa de economia: ${summary.savingsRate}%
- Categoria com maior gasto: ${summary.topCategory} (R$ ${summary.topCategoryAmount.toFixed(2)})
- Gastos por categoria: ${JSON.stringify(currentByCategory)}

Dados do mês passado (para comparação):
- Gastos por categoria: ${JSON.stringify(lastByCategory)}

Retorne APENAS um JSON válido com exatamente 3 insights, sem markdown ou explicações. Formato:
{
  "insights": [
    {
      "type": "alert" | "tip" | "achievement" | "trend",
      "title": "Título curto (max 50 chars)",
      "description": "Descrição com dica prática (max 150 chars)",
      "icon": "alert-circle" | "lightbulb" | "trophy" | "trending-up"
    }
  ]
}

Use "alert" para avisos, "tip" para dicas, "achievement" para conquistas, "trend" para tendências.`

      const response = await fetch(`${GEMINI_API}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      })

      if (!response.ok) {
        console.error('Gemini API error:', await response.text())
        return this.generateRuleBasedInsights(currentTransactions, lastMonthTransactions, summary)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        return this.generateRuleBasedInsights(currentTransactions, lastMonthTransactions, summary)
      }

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.generateRuleBasedInsights(currentTransactions, lastMonthTransactions, summary)
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.insights.map((insight: Insight, index: number) => ({
        ...insight,
        id: `ai-${Date.now()}-${index}`,
      }))
    } catch (error) {
      console.error('Error generating AI insights:', error)
      return this.generateRuleBasedInsights(currentTransactions, lastMonthTransactions, summary)
    }
  }

  private generateRuleBasedInsights(
    currentTransactions: { type: TransactionType; amount: unknown; category: { name: string } }[],
    lastMonthTransactions: { type: TransactionType; amount: unknown; category: { name: string } }[],
    summary: { totalIncome: number; totalExpense: number; balance: number; topCategory: string; topCategoryAmount: number; savingsRate: number }
  ): Insight[] {
    const insights: Insight[] = []

    // Calculate category comparisons
    const currentByCategory: Record<string, number> = {}
    const lastByCategory: Record<string, number> = {}

    for (const tx of currentTransactions) {
      if (tx.type === 'EXPENSE') {
        currentByCategory[tx.category.name] = (currentByCategory[tx.category.name] || 0) + Number(tx.amount)
      }
    }

    for (const tx of lastMonthTransactions) {
      if (tx.type === 'EXPENSE') {
        lastByCategory[tx.category.name] = (lastByCategory[tx.category.name] || 0) + Number(tx.amount)
      }
    }

    // Insight 1: Savings rate
    if (summary.savingsRate >= 20) {
      insights.push({
        id: 'rule-savings-good',
        type: 'achievement',
        title: 'Excelente taxa de economia!',
        description: `Você está economizando ${summary.savingsRate}% da sua renda. Continue assim para alcançar seus objetivos financeiros.`,
        icon: 'trophy',
      })
    } else if (summary.savingsRate >= 0) {
      insights.push({
        id: 'rule-savings-ok',
        type: 'tip',
        title: 'Oportunidade de economizar mais',
        description: `Sua taxa de economia é ${summary.savingsRate}%. Tente reduzir gastos com ${summary.topCategory} para aumentar suas reservas.`,
        icon: 'lightbulb',
      })
    } else {
      insights.push({
        id: 'rule-savings-alert',
        type: 'alert',
        title: 'Atenção com os gastos!',
        description: `Você gastou mais do que ganhou este mês. Revise seus gastos em ${summary.topCategory} para equilibrar as contas.`,
        icon: 'alert-circle',
      })
    }

    // Insight 2: Category comparison with last month
    for (const [category, currentAmount] of Object.entries(currentByCategory)) {
      const lastAmount = lastByCategory[category] || 0
      if (lastAmount > 0) {
        const change = ((currentAmount - lastAmount) / lastAmount) * 100

        if (change > 30) {
          insights.push({
            id: `rule-category-increase-${category}`,
            type: 'alert',
            title: `Aumento em ${category}`,
            description: `Seus gastos com ${category} aumentaram ${change.toFixed(0)}% em relação ao mês passado. Fique atento!`,
            icon: 'trending-up',
          })
          break
        } else if (change < -20) {
          insights.push({
            id: `rule-category-decrease-${category}`,
            type: 'achievement',
            title: `Economia em ${category}`,
            description: `Você reduziu ${Math.abs(change).toFixed(0)}% nos gastos com ${category}. Ótimo trabalho!`,
            icon: 'trophy',
          })
          break
        }
      }
    }

    // Insight 3: Top category tip
    if (summary.topCategory !== 'Nenhuma' && summary.topCategoryAmount > 0) {
      const percentage = (summary.topCategoryAmount / summary.totalExpense) * 100
      insights.push({
        id: 'rule-top-category',
        type: 'trend',
        title: `${summary.topCategory} é seu maior gasto`,
        description: `${percentage.toFixed(0)}% do seu orçamento vai para ${summary.topCategory}. Considere definir um limite mensal.`,
        icon: 'trending-up',
      })
    }

    // Ensure at least 3 insights
    while (insights.length < 3) {
      insights.push({
        id: `rule-general-${insights.length}`,
        type: 'tip',
        title: 'Dica de economia',
        description: 'Mantenha um registro de todos os seus gastos para ter maior controle financeiro.',
        icon: 'lightbulb',
      })
    }

    return insights.slice(0, 3)
  }
}

export const insightsService = new InsightsService()

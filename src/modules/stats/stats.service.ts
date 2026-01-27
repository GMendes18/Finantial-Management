import { prisma } from '../../database/prisma.js'

interface PublicStats {
  totalUsers: number
  totalTransactions: number
  totalSaved: number
  avgSavingsRate: number
  topCategories: string[]
}

// Cache for public stats (refresh every hour)
let cachedStats: PublicStats | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export class StatsService {
  async getPublicStats(): Promise<PublicStats> {
    // Return cached stats if still valid
    if (cachedStats && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedStats
    }

    // Count total users
    const totalUsers = await prisma.user.count()

    // Count total transactions
    const totalTransactions = await prisma.transaction.count()

    // Calculate total saved (sum of all positive balances)
    const balances = await prisma.transaction.groupBy({
      by: ['userId'],
      _sum: {
        amount: true,
      },
    })

    // Get income and expense totals per user to calculate savings
    const userStats = await prisma.transaction.groupBy({
      by: ['userId', 'type'],
      _sum: {
        amount: true,
      },
    })

    // Calculate aggregated stats
    let totalIncome = 0
    let totalExpense = 0
    const userIncomes: Record<string, number> = {}
    const userExpenses: Record<string, number> = {}

    for (const stat of userStats) {
      const amount = Number(stat._sum.amount) || 0
      if (stat.type === 'INCOME') {
        totalIncome += amount
        userIncomes[stat.userId] = amount
      } else {
        totalExpense += amount
        userExpenses[stat.userId] = amount
      }
    }

    // Calculate average savings rate
    let totalSavingsRate = 0
    let usersWithIncome = 0

    for (const userId of Object.keys(userIncomes)) {
      const income = userIncomes[userId] || 0
      const expense = userExpenses[userId] || 0
      if (income > 0) {
        const savingsRate = ((income - expense) / income) * 100
        totalSavingsRate += Math.max(0, savingsRate) // Only count positive rates
        usersWithIncome++
      }
    }

    const avgSavingsRate = usersWithIncome > 0
      ? Math.round(totalSavingsRate / usersWithIncome)
      : 0

    // Get top categories by usage
    const topCategoriesResult = await prisma.transaction.groupBy({
      by: ['categoryId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    })

    const categoryIds = topCategoriesResult.map(c => c.categoryId)
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { name: true },
    })

    const topCategories = categories.map(c => c.name)

    // Calculate total saved (income - expense, only positive)
    const totalSaved = Math.max(0, totalIncome - totalExpense)

    // Cache the results
    cachedStats = {
      totalUsers,
      totalTransactions,
      totalSaved,
      avgSavingsRate,
      topCategories,
    }
    cacheTimestamp = Date.now()

    return cachedStats
  }
}

export const statsService = new StatsService()

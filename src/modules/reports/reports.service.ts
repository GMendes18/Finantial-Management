import { TransactionType, Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import { ReportQuery } from './reports.schema.js'

export class ReportsService {
  private getDateRange(query: ReportQuery) {
    if (query.startDate && query.endDate) {
      return { startDate: query.startDate, endDate: query.endDate }
    }

    const now = new Date()
    const year = query.year || now.getFullYear()
    const month = query.month || now.getMonth() + 1

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    return { startDate, endDate }
  }

  async getSummary(userId: string, query: ReportQuery) {
    const { startDate, endDate } = this.getDateRange(query)

    const transactions = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const income = transactions.find(t => t.type === TransactionType.INCOME)
    const expense = transactions.find(t => t.type === TransactionType.EXPENSE)

    const totalIncome = income?._sum.amount?.toNumber() || 0
    const totalExpense = expense?._sum.amount?.toNumber() || 0
    const balance = totalIncome - totalExpense

    return {
      period: { startDate, endDate },
      income: {
        total: totalIncome,
        count: income?._count || 0,
      },
      expense: {
        total: totalExpense,
        count: expense?._count || 0,
      },
      balance,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    }
  }

  async getByCategory(userId: string, query: ReportQuery) {
    const { startDate, endDate } = this.getDateRange(query)

    const result = await prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
    })

    const categoryIds = [...new Set(result.map(r => r.categoryId))]
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true, icon: true, type: true },
    })

    const categoryMap = new Map(categories.map(c => [c.id, c]))

    const data = result.map(r => ({
      category: categoryMap.get(r.categoryId),
      type: r.type,
      total: r._sum.amount?.toNumber() || 0,
      count: r._count,
    }))

    // Calculate percentages
    const incomeTotal = data
      .filter(d => d.type === TransactionType.INCOME)
      .reduce((acc, d) => acc + d.total, 0)

    const expenseTotal = data
      .filter(d => d.type === TransactionType.EXPENSE)
      .reduce((acc, d) => acc + d.total, 0)

    return {
      period: { startDate, endDate },
      income: data
        .filter(d => d.type === TransactionType.INCOME)
        .map(d => ({
          ...d,
          percentage: incomeTotal > 0 ? (d.total / incomeTotal) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total),
      expense: data
        .filter(d => d.type === TransactionType.EXPENSE)
        .map(d => ({
          ...d,
          percentage: expenseTotal > 0 ? (d.total / expenseTotal) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total),
    }
  }

  async getBalance(userId: string) {
    const result = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    })

    const income = result.find(r => r.type === TransactionType.INCOME)
    const expense = result.find(r => r.type === TransactionType.EXPENSE)

    const totalIncome = income?._sum.amount?.toNumber() || 0
    const totalExpense = expense?._sum.amount?.toNumber() || 0

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
    }
  }

  async getMonthlyTrend(userId: string, months = 6) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months + 1)
    startDate.setDate(1)

    const transactions = await prisma.$queryRaw<
      { month: string; type: TransactionType; total: Prisma.Decimal }[]
    >`
      SELECT
        DATE_FORMAT(date, '%Y-%m') as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ${userId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      GROUP BY month, type
      ORDER BY month ASC
    `

    const monthlyData = new Map<string, { income: number; expense: number }>()

    transactions.forEach(t => {
      const existing = monthlyData.get(t.month) || { income: 0, expense: 0 }
      if (t.type === TransactionType.INCOME) {
        existing.income = Number(t.total)
      } else {
        existing.expense = Number(t.total)
      }
      monthlyData.set(t.month, existing)
    })

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data,
      balance: data.income - data.expense,
    }))
  }
}

export const reportsService = new ReportsService()

import { Prisma } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import { NotFoundError, AppError } from '../../shared/errors/AppError.js'
import { paginate, getPaginationParams } from '../../shared/utils/pagination.js'
import { CreateTransactionInput, UpdateTransactionInput, TransactionQuery } from './transactions.schema.js'

export class TransactionsService {
  async findAll(userId: string, query: TransactionQuery) {
    const { page, limit } = getPaginationParams({
      page: query.page?.toString(),
      limit: query.limit?.toString(),
    })

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type && { type: query.type }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.isRecurring !== undefined && { isRecurring: query.isRecurring }),
      ...(query.startDate || query.endDate
        ? {
            date: {
              ...(query.startDate && { gte: query.startDate }),
              ...(query.endDate && { lte: query.endDate }),
            },
          }
        : {}),
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return paginate(transactions, total, { page, limit })
  }

  async findById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    })

    if (!transaction) {
      throw new NotFoundError('Transaction not found')
    }

    return transaction
  }

  async create(userId: string, data: CreateTransactionInput) {
    // Verify category belongs to user and matches transaction type
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    if (category.type !== data.type) {
      throw new AppError(`Category type (${category.type}) doesn't match transaction type (${data.type})`, 400)
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount),
        userId,
        // Set lastProcessedDate for recurring transactions
        ...(data.isRecurring && { lastProcessedDate: data.date }),
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    })

    return transaction
  }

  async update(id: string, userId: string, data: UpdateTransactionInput) {
    await this.findById(id, userId)

    // If changing category, verify it exists and belongs to user
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId },
      })

      if (!category) {
        throw new NotFoundError('Category not found')
      }

      // If type is also being changed, verify compatibility
      const type = data.type || (await this.findById(id, userId)).type
      if (category.type !== type) {
        throw new AppError(`Category type (${category.type}) doesn't match transaction type (${type})`, 400)
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        ...(data.amount && { amount: new Prisma.Decimal(data.amount) }),
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    })

    return transaction
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId)

    await prisma.transaction.delete({
      where: { id },
    })
  }

  /**
   * Get all recurring transactions for a user
   */
  async findRecurring(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        isRecurring: true,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return transactions
  }

  /**
   * Cancel a recurring transaction (set isRecurring to false)
   */
  async cancelRecurring(id: string, userId: string) {
    await this.findById(id, userId)

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        isRecurring: false,
        frequency: null,
        recurringEndDate: null,
      },
      include: {
        category: {
          select: { id: true, name: true, color: true, icon: true },
        },
      },
    })

    return transaction
  }

  /**
   * Process all due recurring transactions (called by cron job)
   */
  async processRecurringTransactions() {
    const now = new Date()

    // Find all active recurring transactions that need processing
    const recurringTransactions = await prisma.transaction.findMany({
      where: {
        isRecurring: true,
        OR: [
          { recurringEndDate: null },
          { recurringEndDate: { gte: now } },
        ],
      },
    })

    let processed = 0

    for (const transaction of recurringTransactions) {
      const lastProcessed = transaction.lastProcessedDate || transaction.date
      const nextDueDate = this.calculateNextDueDate(lastProcessed, transaction.frequency!)

      // Check if it's time to create a new transaction
      if (nextDueDate <= now) {
        // Create new transaction instance
        await prisma.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: nextDueDate,
            categoryId: transaction.categoryId,
            userId: transaction.userId,
            isRecurring: false, // The instance is not recurring, only the original
          },
        })

        // Update lastProcessedDate on the recurring transaction
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { lastProcessedDate: nextDueDate },
        })

        processed++
      }
    }

    return { processed, total: recurringTransactions.length }
  }

  /**
   * Calculate the next due date based on frequency
   */
  private calculateNextDueDate(lastDate: Date, frequency: string): Date {
    const next = new Date(lastDate)

    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1)
        break
      case 'WEEKLY':
        next.setDate(next.getDate() + 7)
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1)
        break
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1)
        break
    }

    return next
  }
}

export const transactionsService = new TransactionsService()

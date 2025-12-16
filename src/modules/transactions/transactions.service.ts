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
}

export const transactionsService = new TransactionsService()

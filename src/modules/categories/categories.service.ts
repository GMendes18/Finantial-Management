import { TransactionType } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import { NotFoundError, ConflictError, AppError } from '../../shared/errors/AppError.js'
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js'

export class CategoriesService {
  async findAll(userId: string, type?: TransactionType) {
    const categories = await prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    return categories
  }

  async findById(id: string, userId: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return category
  }

  async create(userId: string, data: CreateCategoryInput) {
    const existing = await prisma.category.findFirst({
      where: { name: data.name, userId },
    })

    if (existing) {
      throw new ConflictError('Category with this name already exists')
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        userId,
      },
    })

    return category
  }

  async update(id: string, userId: string, data: UpdateCategoryInput) {
    await this.findById(id, userId)

    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: data.name,
          userId,
          NOT: { id },
        },
      })

      if (existing) {
        throw new ConflictError('Category with this name already exists')
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    })

    return category
  }

  async delete(id: string, userId: string) {
    const category = await this.findById(id, userId)

    if (category._count.transactions > 0) {
      throw new AppError('Cannot delete category with transactions. Move or delete transactions first.', 400)
    }

    await prisma.category.delete({
      where: { id },
    })
  }
}

export const categoriesService = new CategoriesService()

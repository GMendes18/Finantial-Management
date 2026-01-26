import { TransactionType } from '@prisma/client'
import { prisma } from '../../database/prisma.js'
import { NotFoundError, ConflictError, AppError } from '../../shared/errors/AppError.js'
import { CreateCategoryInput, UpdateCategoryInput, SuggestCategoryInput } from './categories.schema.js'
import { suggestCategory, suggestCategories } from '../../shared/utils/categorizer.js'

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

  async suggestCategory(userId: string, data: SuggestCategoryInput) {
    const categories = await prisma.category.findMany({
      where: { userId, type: data.type },
    })

    const suggestion = suggestCategory(data.description, categories, data.type)

    if (!suggestion) {
      return null
    }

    return {
      categoryId: suggestion.category.id,
      categoryName: suggestion.category.name,
      confidence: suggestion.score,
      matchedKeyword: suggestion.matchedKeyword,
    }
  }

  async suggestCategories(userId: string, data: SuggestCategoryInput, limit: number = 3) {
    const categories = await prisma.category.findMany({
      where: { userId, type: data.type },
    })

    const suggestions = suggestCategories(data.description, categories, data.type, limit)

    return suggestions.map((s) => ({
      categoryId: s.category.id,
      categoryName: s.category.name,
      confidence: s.score,
      matchedKeyword: s.matchedKeyword,
    }))
  }
}

export const categoriesService = new CategoriesService()

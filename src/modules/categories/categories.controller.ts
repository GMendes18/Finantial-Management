import { Request, Response } from 'express'
import { TransactionType } from '@prisma/client'
import { categoriesService } from './categories.service.js'
import { CreateCategoryInput, UpdateCategoryInput, SuggestCategoryInput } from './categories.schema.js'

export class CategoriesController {
  async findAll(req: Request, res: Response) {
    const userId = req.user!.sub
    const type = req.query.type as TransactionType | undefined

    const categories = await categoriesService.findAll(userId, type)

    res.json({
      status: 'success',
      data: categories,
    })
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    const category = await categoriesService.findById(id, userId)

    res.json({
      status: 'success',
      data: category,
    })
  }

  async create(req: Request<unknown, unknown, CreateCategoryInput>, res: Response) {
    const userId = req.user!.sub

    const category = await categoriesService.create(userId, req.body)

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: category,
    })
  }

  async update(req: Request<{ id: string }, unknown, UpdateCategoryInput>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    const category = await categoriesService.update(id, userId, req.body)

    res.json({
      status: 'success',
      message: 'Category updated successfully',
      data: category,
    })
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    await categoriesService.delete(id, userId)

    res.status(204).send()
  }

  async suggest(req: Request<unknown, unknown, SuggestCategoryInput>, res: Response) {
    const userId = req.user!.sub

    const suggestion = await categoriesService.suggestCategory(userId, req.body)

    res.json({
      status: 'success',
      data: suggestion,
    })
  }

  async suggestMultiple(req: Request<unknown, unknown, SuggestCategoryInput>, res: Response) {
    const userId = req.user!.sub
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3

    const suggestions = await categoriesService.suggestCategories(userId, req.body, limit)

    res.json({
      status: 'success',
      data: suggestions,
    })
  }
}

export const categoriesController = new CategoriesController()

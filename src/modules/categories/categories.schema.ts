import { z } from 'zod'
import { TransactionType } from '@prisma/client'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters'),
  type: z.nativeEnum(TransactionType),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(30).optional(),
  keywords: z.array(z.string().max(50)).max(20).optional(),
})

export const suggestCategorySchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  type: z.nativeEnum(TransactionType),
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type SuggestCategoryInput = z.infer<typeof suggestCategorySchema>

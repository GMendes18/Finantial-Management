import { z } from 'zod'
import { TransactionType } from '@prisma/client'

export const createTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).optional(),
  date: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category ID'),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const transactionIdSchema = z.object({
  id: z.string().uuid('Invalid transaction ID'),
})

export const transactionQuerySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionQuery = z.infer<typeof transactionQuerySchema>

import { z } from 'zod'
import { TransactionType, Frequency } from '@prisma/client'

// Base schema without refinements (for partial/update)
const baseTransactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(255).optional(),
  date: z.coerce.date(),
  categoryId: z.string().uuid('Invalid category ID'),
  isRecurring: z.boolean().optional().default(false),
  frequency: z.nativeEnum(Frequency).optional(),
  recurringEndDate: z.coerce.date().optional(),
})

// Create schema with validation refinement
export const createTransactionSchema = baseTransactionSchema.refine(
  (data) => !data.isRecurring || data.frequency,
  { message: 'Frequency is required for recurring transactions', path: ['frequency'] }
)

// Update schema - partial of base (without refinement to allow partial updates)
export const updateTransactionSchema = baseTransactionSchema.partial()

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
  isRecurring: z.coerce.boolean().optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type TransactionQuery = z.infer<typeof transactionQuerySchema>

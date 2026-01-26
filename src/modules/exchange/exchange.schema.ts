import { z } from 'zod'

export const exchangeQuerySchema = z.object({
  base: z.string().length(3, 'Currency code must be 3 characters').default('BRL').optional(),
  symbols: z.string().optional().default('USD,EUR,GBP'),
})

export const historyQuerySchema = z.object({
  base: z.string().length(3).default('BRL').optional(),
  symbols: z.string().optional().default('USD,EUR,GBP'),
  days: z.coerce.number().int().min(1).max(30).default(7).optional(),
})

export type ExchangeQuery = z.infer<typeof exchangeQuerySchema>
export type HistoryQuery = z.infer<typeof historyQuerySchema>

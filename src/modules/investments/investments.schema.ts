import { z } from 'zod'

export const createInvestmentSchema = z.object({
  symbol: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  shares: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().max(500).optional(),
})

export const updateInvestmentSchema = createInvestmentSchema.partial()

export const investmentIdSchema = z.object({
  id: z.string().uuid(),
})

export const quoteSymbolsSchema = z.object({
  symbols: z.string().optional(), // Comma-separated symbols
})

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>

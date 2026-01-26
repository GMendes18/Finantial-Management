import { Request, Response } from 'express'
import { investmentsService } from './investments.service.js'
import { CreateInvestmentInput, UpdateInvestmentInput } from './investments.schema.js'

export class InvestmentsController {
  async findAll(req: Request, res: Response) {
    const userId = req.user!.sub
    const investments = await investmentsService.findAll(userId)

    res.json({
      status: 'success',
      data: investments,
    })
  }

  async findById(req: Request, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params
    const investment = await investmentsService.findById(id, userId)

    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment not found',
      })
    }

    res.json({
      status: 'success',
      data: investment,
    })
  }

  async create(req: Request, res: Response) {
    const userId = req.user!.sub
    const data = req.body as CreateInvestmentInput
    const investment = await investmentsService.create(userId, data)

    res.status(201).json({
      status: 'success',
      message: 'Investment created successfully',
      data: investment,
    })
  }

  async update(req: Request, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params
    const data = req.body as UpdateInvestmentInput

    try {
      const investment = await investmentsService.update(id, userId, data)

      res.json({
        status: 'success',
        message: 'Investment updated successfully',
        data: investment,
      })
    } catch {
      res.status(404).json({
        status: 'error',
        message: 'Investment not found',
      })
    }
  }

  async delete(req: Request, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    try {
      await investmentsService.delete(id, userId)

      res.json({
        status: 'success',
        message: 'Investment deleted successfully',
      })
    } catch {
      res.status(404).json({
        status: 'error',
        message: 'Investment not found',
      })
    }
  }

  async getQuotes(req: Request, res: Response) {
    const { symbols } = req.query as { symbols?: string }

    if (!symbols) {
      return res.status(400).json({
        status: 'error',
        message: 'Symbols parameter is required',
      })
    }

    const symbolList = symbols.split(',').map(s => s.trim())
    const quotes = await investmentsService.getQuotes(symbolList)

    res.json({
      status: 'success',
      data: quotes,
    })
  }

  async getPortfolio(req: Request, res: Response) {
    const userId = req.user!.sub
    const portfolio = await investmentsService.getPortfolioSummary(userId)

    res.json({
      status: 'success',
      data: portfolio,
    })
  }
}

export const investmentsController = new InvestmentsController()

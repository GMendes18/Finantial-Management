import { Request, Response } from 'express'
import { reportsService } from './reports.service.js'
import { ReportQuery } from './reports.schema.js'

export class ReportsController {
  async getSummary(req: Request<unknown, unknown, unknown, ReportQuery>, res: Response) {
    const userId = req.user!.sub

    const summary = await reportsService.getSummary(userId, req.query)

    res.json({
      status: 'success',
      data: summary,
    })
  }

  async getByCategory(req: Request<unknown, unknown, unknown, ReportQuery>, res: Response) {
    const userId = req.user!.sub

    const data = await reportsService.getByCategory(userId, req.query)

    res.json({
      status: 'success',
      data,
    })
  }

  async getBalance(req: Request, res: Response) {
    const userId = req.user!.sub

    const balance = await reportsService.getBalance(userId)

    res.json({
      status: 'success',
      data: balance,
    })
  }

  async getMonthlyTrend(req: Request<unknown, unknown, unknown, { months?: string }>, res: Response) {
    const userId = req.user!.sub
    const months = req.query.months ? parseInt(req.query.months, 10) : 6

    const trend = await reportsService.getMonthlyTrend(userId, months)

    res.json({
      status: 'success',
      data: trend,
    })
  }
}

export const reportsController = new ReportsController()

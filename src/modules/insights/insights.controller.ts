import { Request, Response } from 'express'
import { insightsService } from './insights.service.js'

export class InsightsController {
  async getInsights(req: Request, res: Response) {
    const userId = req.user!.sub
    const forceRefresh = req.query.refresh === 'true'

    const insights = await insightsService.getInsights(userId, forceRefresh)

    res.json({
      status: 'success',
      data: insights,
    })
  }
}

export const insightsController = new InsightsController()

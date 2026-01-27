import { Request, Response } from 'express'
import { statsService } from './stats.service.js'

export class StatsController {
  async getPublicStats(req: Request, res: Response) {
    try {
      const stats = await statsService.getPublicStats()

      res.json({
        status: 'success',
        data: stats,
      })
    } catch (error) {
      console.error('Error fetching public stats:', error)
      res.status(500).json({
        status: 'error',
        message: 'Erro ao buscar estatísticas',
      })
    }
  }
}

export const statsController = new StatsController()

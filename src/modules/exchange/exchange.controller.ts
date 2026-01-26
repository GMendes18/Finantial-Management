import { Request, Response } from 'express'
import { exchangeService } from './exchange.service.js'
import { ExchangeQuery, HistoryQuery } from './exchange.schema.js'

export class ExchangeController {
  async getLatestRates(req: Request<unknown, unknown, unknown, ExchangeQuery>, res: Response) {
    const { base = 'BRL', symbols = 'USD,EUR,GBP' } = req.query

    const rates = await exchangeService.getLatestRates(base, symbols)

    res.json({
      status: 'success',
      data: rates,
    })
  }

  async getHistoricalRates(req: Request<unknown, unknown, unknown, HistoryQuery>, res: Response) {
    const { base = 'BRL', symbols = 'USD,EUR,GBP', days = 7 } = req.query

    const history = await exchangeService.getHistoricalRates(base, symbols, days)

    res.json({
      status: 'success',
      data: history,
    })
  }

  async getWidgetData(req: Request<unknown, unknown, unknown, ExchangeQuery>, res: Response) {
    const { base = 'BRL', symbols = 'USD,EUR,GBP' } = req.query

    const widgetData = await exchangeService.getWidgetData(base, symbols)

    res.json({
      status: 'success',
      data: widgetData,
    })
  }
}

export const exchangeController = new ExchangeController()

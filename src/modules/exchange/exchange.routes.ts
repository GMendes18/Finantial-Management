import { Router } from 'express'
import { exchangeController } from './exchange.controller.js'
import { validate } from '../../shared/middlewares/validate.js'
import { exchangeQuerySchema, historyQuerySchema } from './exchange.schema.js'

const router = Router()

// Public routes - no auth required (rates are public data)
router.get('/rates', validate({ query: exchangeQuerySchema }), exchangeController.getLatestRates)
router.get('/history', validate({ query: historyQuerySchema }), exchangeController.getHistoricalRates)
router.get('/widget', validate({ query: exchangeQuerySchema }), exchangeController.getWidgetData)

export { router as exchangeRoutes }

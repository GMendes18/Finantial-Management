import { Router } from 'express'
import { reportsController } from './reports.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'
import { validate } from '../../shared/middlewares/validate.js'
import { reportQuerySchema } from './reports.schema.js'

const router = Router()

router.use(authMiddleware)

router.get('/summary', validate({ query: reportQuerySchema }), reportsController.getSummary)
router.get('/by-category', validate({ query: reportQuerySchema }), reportsController.getByCategory)
router.get('/balance', reportsController.getBalance)
router.get('/monthly-trend', reportsController.getMonthlyTrend)

export { router as reportsRoutes }

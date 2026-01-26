import { Router } from 'express'
import { investmentsController } from './investments.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'
import { validate } from '../../shared/middlewares/validate.js'
import {
  createInvestmentSchema,
  updateInvestmentSchema,
  investmentIdSchema,
  quoteSymbolsSchema,
} from './investments.schema.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Portfolio summary (aggregated view)
router.get('/portfolio', investmentsController.getPortfolio)

// Get quotes for symbols
router.get('/quotes', validate({ query: quoteSymbolsSchema }), investmentsController.getQuotes)

// CRUD routes
router.get('/', investmentsController.findAll)
router.get('/:id', validate({ params: investmentIdSchema }), investmentsController.findById)
router.post('/', validate({ body: createInvestmentSchema }), investmentsController.create)
router.put('/:id', validate({ params: investmentIdSchema, body: updateInvestmentSchema }), investmentsController.update)
router.delete('/:id', validate({ params: investmentIdSchema }), investmentsController.delete)

export { router as investmentsRoutes }

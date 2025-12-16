import { Router } from 'express'
import { transactionsController } from './transactions.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'
import { validate } from '../../shared/middlewares/validate.js'
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdSchema,
  transactionQuerySchema,
} from './transactions.schema.js'

const router = Router()

router.use(authMiddleware)

router.get('/', validate({ query: transactionQuerySchema }), transactionsController.findAll)
router.get('/:id', validate({ params: transactionIdSchema }), transactionsController.findById)
router.post('/', validate({ body: createTransactionSchema }), transactionsController.create)
router.put(
  '/:id',
  validate({ params: transactionIdSchema, body: updateTransactionSchema }),
  transactionsController.update
)
router.delete('/:id', validate({ params: transactionIdSchema }), transactionsController.delete)

export { router as transactionsRoutes }

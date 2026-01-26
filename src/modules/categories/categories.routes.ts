import { Router } from 'express'
import { categoriesController } from './categories.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'
import { validate } from '../../shared/middlewares/validate.js'
import { createCategorySchema, updateCategorySchema, categoryIdSchema, suggestCategorySchema } from './categories.schema.js'

const router = Router()

router.use(authMiddleware)

router.get('/', categoriesController.findAll)
router.get('/:id', validate({ params: categoryIdSchema }), categoriesController.findById)
router.post('/', validate({ body: createCategorySchema }), categoriesController.create)
router.post('/suggest', validate({ body: suggestCategorySchema }), categoriesController.suggest)
router.post('/suggest/multiple', validate({ body: suggestCategorySchema }), categoriesController.suggestMultiple)
router.put('/:id', validate({ params: categoryIdSchema, body: updateCategorySchema }), categoriesController.update)
router.delete('/:id', validate({ params: categoryIdSchema }), categoriesController.delete)

export { router as categoriesRoutes }

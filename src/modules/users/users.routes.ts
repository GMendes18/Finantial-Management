import { Router } from 'express'
import { usersController } from './users.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'
import { validate } from '../../shared/middlewares/validate.js'
import { updateUserSchema } from './users.schema.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

router.get('/me', usersController.getProfile)
router.put('/me', validate({ body: updateUserSchema }), usersController.updateProfile)

export { router as usersRoutes }

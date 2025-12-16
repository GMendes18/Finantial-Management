import { Router } from 'express'
import { authController } from './auth.controller.js'
import { validate } from '../../shared/middlewares/validate.js'
import { registerSchema, loginSchema } from './auth.schema.js'

const router = Router()

router.post('/register', validate({ body: registerSchema }), authController.register)
router.post('/login', validate({ body: loginSchema }), authController.login)

export { router as authRoutes }

import { Router } from 'express'
import { insightsController } from './insights.controller.js'
import { authMiddleware } from '../../shared/middlewares/auth.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Get insights (cached, use ?refresh=true to force refresh)
router.get('/', insightsController.getInsights)

export { router as insightsRoutes }

import { Router } from 'express'
import { statsController } from './stats.controller.js'

const router = Router()

// Public route - no authentication required
router.get('/public', statsController.getPublicStats)

export default router

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import 'express-async-errors'

import { errorHandler } from './shared/middlewares/errorHandler.js'
import { swaggerSpec } from './config/swagger.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { categoriesRoutes } from './modules/categories/categories.routes.js'
import { transactionsRoutes } from './modules/transactions/transactions.routes.js'
import { reportsRoutes } from './modules/reports/reports.routes.js'
import { exchangeRoutes } from './modules/exchange/exchange.routes.js'
import { investmentsRoutes } from './modules/investments/investments.routes.js'
import { insightsRoutes } from './modules/insights/insights.routes.js'

// Import swagger docs
import './modules/auth/auth.swagger.js'
import './modules/users/users.swagger.js'
import './modules/categories/categories.swagger.js'
import './modules/transactions/transactions.swagger.js'
import './modules/reports/reports.swagger.js'
import './modules/exchange/exchange.swagger.js'
import './modules/investments/investments.swagger.js'
import './modules/insights/insights.swagger.js'

const app = express()

// Security middlewares
app.use(helmet())
app.use(cors())

// Body parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => {
  res.json(swaggerSpec)
})

// API routes
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/categories', categoriesRoutes)
app.use('/transactions', transactionsRoutes)
app.use('/reports', reportsRoutes)
app.use('/exchange', exchangeRoutes)
app.use('/investments', investmentsRoutes)
app.use('/insights', insightsRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' })
})

// Error handler (must be last)
app.use(errorHandler)

export { app }

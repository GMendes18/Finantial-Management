import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'express-async-errors'

import { errorHandler } from './shared/middlewares/errorHandler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { usersRoutes } from './modules/users/users.routes.js'
import { categoriesRoutes } from './modules/categories/categories.routes.js'
import { transactionsRoutes } from './modules/transactions/transactions.routes.js'
import { reportsRoutes } from './modules/reports/reports.routes.js'

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

// API routes
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/categories', categoriesRoutes)
app.use('/transactions', transactionsRoutes)
app.use('/reports', reportsRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' })
})

// Error handler (must be last)
app.use(errorHandler)

export { app }

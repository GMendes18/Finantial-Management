import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '../errors/AppError.js'
import { env } from '../../config/env.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    err.errors.forEach(error => {
      const path = error.path.join('.')
      if (!errors[path]) errors[path] = []
      errors[path].push(error.message)
    })

    res.status(422).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    })
    return
  }

  // Custom validation errors
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errors: err.errors,
    })
    return
  }

  // Custom app errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
    return
  }

  // Unknown errors
  console.error('❌ Unexpected error:', err)

  res.status(500).json({
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

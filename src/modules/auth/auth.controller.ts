import { Request, Response } from 'express'
import { authService } from './auth.service.js'
import { RegisterInput, LoginInput } from './auth.schema.js'

export class AuthController {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response) {
    const result = await authService.register(req.body)

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    })
  }

  async login(req: Request<unknown, unknown, LoginInput>, res: Response) {
    const result = await authService.login(req.body)

    res.json({
      status: 'success',
      message: 'Login successful',
      data: result,
    })
  }
}

export const authController = new AuthController()

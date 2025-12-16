import { Request, Response } from 'express'
import { usersService } from './users.service.js'
import { UpdateUserInput } from './users.schema.js'

export class UsersController {
  async getProfile(req: Request, res: Response) {
    const userId = req.user!.sub
    const user = await usersService.getProfile(userId)

    res.json({
      status: 'success',
      data: user,
    })
  }

  async updateProfile(req: Request<unknown, unknown, UpdateUserInput>, res: Response) {
    const userId = req.user!.sub
    const user = await usersService.updateProfile(userId, req.body)

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: user,
    })
  }
}

export const usersController = new UsersController()

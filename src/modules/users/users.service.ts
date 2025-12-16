import bcrypt from 'bcryptjs'
import { prisma } from '../../database/prisma.js'
import { env } from '../../config/env.js'
import { NotFoundError, UnauthorizedError, ConflictError } from '../../shared/errors/AppError.js'
import { UpdateUserInput } from './users.schema.js'

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
            categories: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return user
  }

  async updateProfile(userId: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (existingUser) {
        throw new ConflictError('Email already in use')
      }
    }

    // Handle password change
    let passwordHash: string | undefined
    if (data.newPassword && data.currentPassword) {
      const passwordMatch = await bcrypt.compare(data.currentPassword, user.passwordHash)
      if (!passwordMatch) {
        throw new UnauthorizedError('Current password is incorrect')
      }
      passwordHash = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(passwordHash && { passwordHash }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    })

    return updatedUser
  }
}

export const usersService = new UsersService()

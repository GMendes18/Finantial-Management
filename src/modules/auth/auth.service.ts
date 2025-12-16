import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../database/prisma.js'
import { env } from '../../config/env.js'
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError.js'
import { RegisterInput, LoginInput } from './auth.schema.js'

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    const token = this.generateToken(user.id, user.email)

    return { user, token }
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const token = this.generateToken(user.id, user.email)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    }
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    })
  }
}

export const authService = new AuthService()

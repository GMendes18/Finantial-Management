import { PrismaClient, TransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.info('Seeding database...')

  const passwordHash = await bcrypt.hash('demo123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@finance.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@finance.com',
      passwordHash,
    },
  })

  console.info(`User created: ${user.email}`)

  const categories = [
    { name: 'Salario', type: TransactionType.INCOME, color: '#22c55e', icon: 'wallet' },
    { name: 'Freelance', type: TransactionType.INCOME, color: '#3b82f6', icon: 'laptop' },
    { name: 'Investimentos', type: TransactionType.INCOME, color: '#8b5cf6', icon: 'trending-up' },
    { name: 'Alimentacao', type: TransactionType.EXPENSE, color: '#f97316', icon: 'utensils' },
    { name: 'Transporte', type: TransactionType.EXPENSE, color: '#eab308', icon: 'car' },
    { name: 'Moradia', type: TransactionType.EXPENSE, color: '#ef4444', icon: 'home' },
    { name: 'Saude', type: TransactionType.EXPENSE, color: '#ec4899', icon: 'heart' },
    { name: 'Lazer', type: TransactionType.EXPENSE, color: '#06b6d4', icon: 'gamepad' },
    { name: 'Educacao', type: TransactionType.EXPENSE, color: '#6366f1', icon: 'book' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name_userId: { name: category.name, userId: user.id } },
      update: {},
      create: {
        ...category,
        userId: user.id,
      },
    })
  }

  console.info(`${categories.length} categories created`)
  console.info('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

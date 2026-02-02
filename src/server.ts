import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './database/prisma.js'
import { startRecurringTransactionsJob } from './jobs/recurring-transactions.job.js'

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.info('✅ Database connected')

    // Start cron jobs
    startRecurringTransactionsJob()

    // Start server
    app.listen(env.PORT, () => {
      console.info(`🚀 Server running on http://localhost:${env.PORT}`)
      console.info(`📚 Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.info('\n🛑 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.info('\n🛑 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

main()

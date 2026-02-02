import cron from 'node-cron'
import { transactionsService } from '../modules/transactions/transactions.service.js'

/**
 * Cron job to process recurring transactions
 * Runs every day at 00:05 (5 minutes after midnight)
 */
export function startRecurringTransactionsJob() {
  // Run at 00:05 every day
  cron.schedule('5 0 * * *', async () => {
    console.log('🔄 [CRON] Processing recurring transactions...')

    try {
      const result = await transactionsService.processRecurringTransactions()
      console.log(`✅ [CRON] Processed ${result.processed}/${result.total} recurring transactions`)
    } catch (error) {
      console.error('❌ [CRON] Error processing recurring transactions:', error)
    }
  })

  console.log('📅 [CRON] Recurring transactions job scheduled (daily at 00:05)')
}

/**
 * Manual trigger for testing or admin purposes
 */
export async function processRecurringTransactionsNow() {
  console.log('🔄 [MANUAL] Processing recurring transactions...')

  try {
    const result = await transactionsService.processRecurringTransactions()
    console.log(`✅ [MANUAL] Processed ${result.processed}/${result.total} recurring transactions`)
    return result
  } catch (error) {
    console.error('❌ [MANUAL] Error processing recurring transactions:', error)
    throw error
  }
}

interface ExchangeRates {
  base: string
  date: string
  rates: Record<string, number>
}

interface HistoricalRates {
  base: string
  startDate: string
  endDate: string
  rates: Record<string, Record<string, number>>
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Simple in-memory cache
const cache: Map<string, CacheEntry<unknown>> = new Map()

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const FRANKFURTER_API = 'https://api.frankfurter.dev/v1'

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL
  if (isExpired) {
    cache.delete(key)
    return null
  }

  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export class ExchangeService {
  /**
   * Get latest exchange rates
   * @param base Base currency (default: BRL)
   * @param symbols Comma-separated currency codes (default: USD,EUR,GBP)
   */
  async getLatestRates(base: string = 'BRL', symbols: string = 'USD,EUR,GBP'): Promise<ExchangeRates> {
    const cacheKey = `rates:${base}:${symbols}`
    const cached = getCached<ExchangeRates>(cacheKey)

    if (cached) {
      return cached
    }

    const url = `${FRANKFURTER_API}/latest?base=${base}&symbols=${symbols}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Exchange API error: ${response.statusText}`)
    }

    const data = await response.json()

    const result: ExchangeRates = {
      base: data.base,
      date: data.date,
      rates: data.rates,
    }

    setCache(cacheKey, result)
    return result
  }

  /**
   * Get historical exchange rates for sparkline
   * @param base Base currency
   * @param symbols Currency symbols
   * @param days Number of days (default: 7)
   */
  async getHistoricalRates(
    base: string = 'BRL',
    symbols: string = 'USD,EUR,GBP',
    days: number = 7
  ): Promise<HistoricalRates> {
    const cacheKey = `history:${base}:${symbols}:${days}`
    const cached = getCached<HistoricalRates>(cacheKey)

    if (cached) {
      return cached
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    const url = `${FRANKFURTER_API}/${formatDate(startDate)}..${formatDate(endDate)}?base=${base}&symbols=${symbols}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Exchange API error: ${response.statusText}`)
    }

    const data = await response.json()

    const result: HistoricalRates = {
      base: data.base,
      startDate: data.start_date,
      endDate: data.end_date,
      rates: data.rates,
    }

    setCache(cacheKey, result)
    return result
  }

  /**
   * Get rates formatted for frontend widget
   * Includes current rate + sparkline data
   */
  async getWidgetData(base: string = 'BRL', symbols: string = 'USD,EUR,GBP') {
    const [latest, history] = await Promise.all([
      this.getLatestRates(base, symbols),
      this.getHistoricalRates(base, symbols, 7),
    ])

    const symbolList = symbols.split(',')

    // Calculate sparkline and variation for each currency
    const currencies = symbolList.map((symbol) => {
      const currentRate = latest.rates[symbol]
      const historicalData = Object.entries(history.rates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rates]) => ({
          date,
          rate: rates[symbol],
        }))

      // Calculate variation (first vs last)
      const firstRate = historicalData[0]?.rate || currentRate
      const variation = ((currentRate - firstRate) / firstRate) * 100

      return {
        symbol,
        rate: currentRate,
        inverseRate: 1 / currentRate, // How much of base currency for 1 unit
        variation: parseFloat(variation.toFixed(2)),
        trend: variation >= 0 ? 'up' : 'down',
        sparkline: historicalData.map((d) => d.rate),
        lastUpdate: latest.date,
      }
    })

    return {
      base,
      date: latest.date,
      currencies,
    }
  }
}

export const exchangeService = new ExchangeService()

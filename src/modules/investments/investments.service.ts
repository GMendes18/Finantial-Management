import { prisma } from '../../database/prisma.js'
import { CreateInvestmentInput, UpdateInvestmentInput } from './investments.schema.js'

// Cache for quotes (Alpha Vantage has 25 req/day limit on free tier)
interface QuoteCache {
  price: number
  change: number
  changePercent: number
  timestamp: number
}

const quoteCache: Map<string, QuoteCache> = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour cache (to preserve API quota)

// Alpha Vantage API (free tier: 25 requests/day)
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query'
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo' // demo key for testing

// Fallback mock prices for when API quota is exceeded
const mockPrices: Record<string, number> = {
  'AAPL': 185.50,
  'GOOGL': 142.30,
  'MSFT': 378.90,
  'AMZN': 178.25,
  'META': 485.60,
  'TSLA': 248.75,
  'NVDA': 495.20,
  'PETR4.SA': 38.45,
  'VALE3.SA': 61.20,
  'ITUB4.SA': 32.80,
  'BBDC4.SA': 12.95,
  'BTC': 43250.00,
  'ETH': 2350.00,
}

async function fetchQuoteFromAPI(symbol: string): Promise<QuoteCache | null> {
  try {
    const url = `${ALPHA_VANTAGE_API}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    const response = await fetch(url)
    const data = await response.json()

    // Check for API limit or errors
    if (data['Note'] || data['Error Message'] || !data['Global Quote']) {
      console.log(`Alpha Vantage API limit or error for ${symbol}, using mock data`)
      return null
    }

    const quote = data['Global Quote']
    const price = parseFloat(quote['05. price']) || 0
    const change = parseFloat(quote['09. change']) || 0
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0

    return {
      price,
      change,
      changePercent,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return null
  }
}

function getMockQuote(symbol: string): QuoteCache {
  const basePrice = mockPrices[symbol.toUpperCase()] || 100
  // Add some random variation for demo purposes
  const variation = (Math.random() - 0.5) * 0.05 * basePrice
  const price = basePrice + variation
  const change = variation
  const changePercent = (variation / basePrice) * 100

  return {
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    timestamp: Date.now(),
  }
}

async function getQuote(symbol: string): Promise<QuoteCache> {
  const upperSymbol = symbol.toUpperCase()

  // Check cache first
  const cached = quoteCache.get(upperSymbol)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached
  }

  // Try to fetch from API
  const quote = await fetchQuoteFromAPI(upperSymbol)

  if (quote) {
    quoteCache.set(upperSymbol, quote)
    return quote
  }

  // Fallback to mock data
  const mockQuote = getMockQuote(upperSymbol)
  quoteCache.set(upperSymbol, mockQuote)
  return mockQuote
}

export class InvestmentsService {
  async findAll(userId: string) {
    return prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string, userId: string) {
    return prisma.investment.findFirst({
      where: { id, userId },
    })
  }

  async create(userId: string, data: CreateInvestmentInput) {
    return prisma.investment.create({
      data: {
        ...data,
        purchaseDate: new Date(data.purchaseDate),
        userId,
      },
    })
  }

  async update(id: string, userId: string, data: UpdateInvestmentInput) {
    // Verify ownership
    const existing = await this.findById(id, userId)
    if (!existing) {
      throw new Error('Investment not found')
    }

    return prisma.investment.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      },
    })
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    const existing = await this.findById(id, userId)
    if (!existing) {
      throw new Error('Investment not found')
    }

    return prisma.investment.delete({
      where: { id },
    })
  }

  async getQuotes(symbols: string[]) {
    const quotes: Record<string, QuoteCache> = {}

    for (const symbol of symbols) {
      quotes[symbol.toUpperCase()] = await getQuote(symbol)
    }

    return quotes
  }

  async getPortfolioSummary(userId: string) {
    const investments = await this.findAll(userId)

    if (investments.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        positions: [],
      }
    }

    // Get unique symbols
    const symbols = [...new Set(investments.map(i => i.symbol))]
    const quotes = await this.getQuotes(symbols)

    let totalInvested = 0
    let currentValue = 0

    const positions = investments.map(investment => {
      const shares = Number(investment.shares)
      const purchasePrice = Number(investment.purchasePrice)
      const invested = shares * purchasePrice
      const quote = quotes[investment.symbol.toUpperCase()]
      const current = shares * quote.price
      const gain = current - invested
      const gainPercent = invested > 0 ? (gain / invested) * 100 : 0

      totalInvested += invested
      currentValue += current

      return {
        id: investment.id,
        symbol: investment.symbol,
        name: investment.name,
        shares,
        purchasePrice,
        purchaseDate: investment.purchaseDate,
        notes: investment.notes,
        invested,
        currentPrice: quote.price,
        currentValue: current,
        gain,
        gainPercent,
        dayChange: quote.change,
        dayChangePercent: quote.changePercent,
      }
    })

    const totalGain = currentValue - totalInvested
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

    return {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      totalGain: parseFloat(totalGain.toFixed(2)),
      totalGainPercent: parseFloat(totalGainPercent.toFixed(2)),
      positions,
    }
  }
}

export const investmentsService = new InvestmentsService()

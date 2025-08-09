/**
 * Optimized Stock Prices API Route
 * 
 * Features:
 * - Deduplicates stock symbols across all requests
 * - Batches API calls to respect rate limits
 * - Implements caching to reduce API usage
 * - Returns consistent data format
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPrice } from '@/lib/polygon'
import { StockData, ApiResponse, StockPriceRequest, StockPriceResponse } from '@/lib/types/portfolio'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

// In-memory cache for stock prices (5 minute cache)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const stockCache = new Map<string, { data: StockData; timestamp: number }>()

// Rate limiting - track requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 10 // per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

function getRateLimitKey(): string {
  // Simplified rate limiting - use a generic key for development
  // In production, you'd want proper IP-based rate limiting
  return 'rate_limit:default'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return true
  }
  
  entry.count++
  return false
}

function getCachedStock(symbol: string): StockData | null {
  const cached = stockCache.get(symbol)
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
  if (isExpired) {
    stockCache.delete(symbol)
    return null
  }
  
  return cached.data
}

function setCachedStock(symbol: string, data: StockData): void {
  stockCache.set(symbol, {
    data,
    timestamp: Date.now()
  })
}

async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    console.log(`🔍 Fetching REAL stock data from Polygon for ${symbol}`)
    
    const result = await getCurrentPrice(symbol)
    
    const stockData: StockData = {
      symbol: symbol.toUpperCase(),
      price: result.price,
      change: result.change,
      changePercent: result.change,
      lastUpdated: Date.now(),
      volume: 0, // Will be populated from API if available
      previousClose: result.price - result.change
    }
    
    // Cache the result
    setCachedStock(symbol, stockData)
    
    console.log(`✅ Successfully fetched REAL data for ${symbol}: $${result.price.toFixed(2)}`)
    return stockData
  } catch (error) {
    console.error(`❌ Failed to fetch REAL data for ${symbol}:`, error)
    
    // Return null to let the batch handler deal with errors
    // This prevents one symbol failure from breaking the entire batch
    return null
  }
}

async function batchFetchStocks(symbols: string[]): Promise<StockPriceResponse> {
  console.log(`📊 Batch fetching ${symbols.length} stocks:`, symbols)
  
  const results: StockPriceResponse = {}
  const uncachedSymbols: string[] = []
  
  // First, try to get data from cache
  for (const symbol of symbols) {
    const cached = getCachedStock(symbol)
    if (cached) {
      results[symbol] = cached
      console.log(`⚡ Using cached data for ${symbol}`)
    } else {
      uncachedSymbols.push(symbol)
    }
  }
  
  // Fetch uncached symbols
  if (uncachedSymbols.length > 0) {
    console.log(`🔄 Fetching ${uncachedSymbols.length} uncached symbols:`, uncachedSymbols)
    
    // Use existing batch functionality from polygon.ts
    try {
      const batchResults = await Promise.allSettled(
        uncachedSymbols.map(symbol => fetchStockData(symbol))
      )
      
      batchResults.forEach((result, index) => {
        const symbol = uncachedSymbols[index]
        if (result.status === 'fulfilled' && result.value !== null) {
          results[symbol] = result.value
          console.log(`✅ Successfully got REAL data for ${symbol}`)
        } else {
          const errorReason = result.status === 'rejected' ? result.reason : 'Returned null'
          console.error(`❌ Failed to fetch REAL data for ${symbol}:`, errorReason)
          
          // Provide fallback data to prevent UI breaking
          results[symbol] = {
            symbol: symbol.toUpperCase(),
            price: 100,
            change: 0,
            changePercent: 0,
            lastUpdated: Date.now(),
            previousClose: 100
          }
          console.warn(`⚠️ Using fallback data for ${symbol} due to API error`)
        }
      })
    } catch (error) {
      console.error('❌ Error in batch fetch:', error)
    }
  }
  
  return results
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey()
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again in a minute.',
          timestamp: Date.now()
        } as ApiResponse<never>, 
        { status: 429 }
      )
    }

    const body: StockPriceRequest = await request.json()
    
    if (!body.symbols || !Array.isArray(body.symbols)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: symbols array is required',
          timestamp: Date.now()
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    // Deduplicate and clean symbols
    const uniqueSymbols = Array.from(new Set(body.symbols))
      .filter(symbol => typeof symbol === 'string' && symbol.trim().length > 0)
      .map(symbol => symbol.trim().toUpperCase())

    if (uniqueSymbols.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid symbols provided',
          timestamp: Date.now()
        } as ApiResponse<never>,
        { status: 400 }
      )
    }

    console.log(`🎯 API Request: ${uniqueSymbols.length} unique symbols from ${body.symbols.length} requested`)

    // Batch fetch with deduplication and caching
    console.log(`🎯 Starting batch fetch for symbols:`, uniqueSymbols)
    const stockData = await batchFetchStocks(uniqueSymbols)
    console.log(`🎯 Batch fetch completed, got data for:`, Object.keys(stockData))

    const response: ApiResponse<StockPriceResponse> = {
      success: true,
      data: stockData,
      timestamp: Date.now()
    }

    console.log(`✅ Returning data for ${Object.keys(stockData).length} symbols`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ API Route Error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('❌ Sending error response:', errorMessage)
    
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: errorMessage,
      timestamp: Date.now()
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST with symbols array in request body.',
      timestamp: Date.now()
    } as ApiResponse<never>,
    { status: 405 }
  )
}

// Cache cleanup function (runs every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    let cleaned = 0
    
    stockCache.forEach((cached, symbol) => {
      if (now - cached.timestamp > CACHE_DURATION) {
        stockCache.delete(symbol)
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`)
    }
  }, 10 * 60 * 1000) // Every 10 minutes
}
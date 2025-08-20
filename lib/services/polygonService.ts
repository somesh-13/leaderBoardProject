/**
 * Enhanced Polygon.io Service
 * 
 * Implements the developer doc specification for:
 * - 6/16/2025 official adjusted close prices
 * - Current prices as of Aug 8, 2025
 * - Proper caching and error handling
 */

const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY

if (!API_KEY) {
  console.error('❌ POLYGON API KEY NOT FOUND! Set NEXT_PUBLIC_POLYGON_API_KEY in your .env.local file')
}

export type PricePoint = {
  close_2025_06_16: number | null
  currentPrice: number | null
  currentTimestamp?: string | null
  prevClose?: number | null
  dayChange?: number | null
  dayChangePercent?: number | null
}

export type PolygonAggregateResponse = {
  ticker: string
  results?: Array<{
    t: number  // timestamp (ms)
    o: number  // open
    h: number  // high
    l: number  // low
    c: number  // close
    v: number  // volume
  }>
  status: string
  resultsCount: number
}

export type PolygonSnapshotResponse = {
  ticker: {
    ticker: string
  }
  lastTrade?: {
    p: number  // price
    s: number  // size
    t: number  // timestamp (ms)
  }
  prevDay?: {
    c: number  // close
    h: number  // high
    l: number  // low
    v: number  // volume
  }
  todaysChange?: number
  todaysChangePerc?: number
}

// Cache for historical prices (immutable after fetch)
const historicalCache = new Map<string, { price: number; timestamp: number }>()
const HISTORICAL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

// Cache for current prices (short TTL)
const snapshotCache = new Map<string, { data: PricePoint; timestamp: number }>()
const SNAPSHOT_CACHE_TTL = 10 * 1000 // 10 seconds during market hours

/**
 * Get daily close price for a specific date using aggregates endpoint
 */
export async function getDailyClose(ticker: string, date: string): Promise<number | null> {
  const cacheKey = `agg:${ticker}:${date}`
  const cached = historicalCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < HISTORICAL_CACHE_TTL) {
    console.log(`📦 Using cached historical price for ${ticker} on ${date}`)
    return cached.price
  }

  if (!API_KEY) {
    console.warn(`🔑 No Polygon API key for ${ticker} historical data`)
    return null
  }

  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${date}/${date}?adjusted=true&limit=1&apikey=${API_KEY}`
    
    console.log(`🔍 Fetching historical close for ${ticker} on ${date}`)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: PolygonAggregateResponse = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'DELAYED') {
      console.warn(`⚠️ Polygon API status: ${data.status} for ${ticker}`)
    }
    
    if (data.results && data.results.length > 0) {
      const closePrice = data.results[0]?.c || 0
      
      // Cache the result
      historicalCache.set(cacheKey, {
        price: closePrice,
        timestamp: Date.now()
      })
      
      console.log(`✅ Historical close for ${ticker} on ${date}: $${closePrice.toFixed(2)}`)
      return closePrice
    } else {
      console.warn(`⚠️ No trading data found for ${ticker} on ${date}`)
      return null
    }
    
  } catch (error) {
    console.error(`❌ Error fetching historical close for ${ticker}:`, error)
    return null
  }
}

/**
 * Get current snapshot price using snapshot endpoint
 */
export async function getSnapshotPrice(ticker: string): Promise<{
  price: number | null
  timestamp: string | null
  prevClose: number | null
  dayChange: number | null
  dayChangePercent: number | null
}> {
  if (!API_KEY) {
    console.warn(`🔑 No Polygon API key for ${ticker} snapshot`)
    return { price: null, timestamp: null, prevClose: null, dayChange: null, dayChangePercent: null }
  }

  try {
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${API_KEY}`
    
    console.log(`📊 Fetching current snapshot for ${ticker}`)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: PolygonSnapshotResponse = await response.json()
    
    const price = data.lastTrade?.p ?? null
    const timestamp = data.lastTrade?.t ? new Date(data.lastTrade.t).toISOString() : null
    const prevClose = data.prevDay?.c ?? null
    const dayChange = data.todaysChange ?? null
    const dayChangePercent = data.todaysChangePerc ?? null
    
    if (price !== null) {
      console.log(`✅ Current snapshot for ${ticker}: $${price.toFixed(2)} (${dayChangePercent !== null && dayChangePercent >= 0 ? '+' : ''}${dayChangePercent?.toFixed(2) || 'N/A'}%)`)
    }
    
    return { price, timestamp, prevClose, dayChange, dayChangePercent }
    
  } catch (error) {
    console.error(`❌ Error fetching snapshot for ${ticker}:`, error)
    return { price: null, timestamp: null, prevClose: null, dayChange: null, dayChangePercent: null }
  }
}

/**
 * Get complete price data for a ticker (6/16/2025 close + current price)
 */
export async function getCompletePriceData(ticker: string): Promise<PricePoint> {
  const cacheKey = `complete:${ticker}`
  const cached = snapshotCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < SNAPSHOT_CACHE_TTL) {
    console.log(`📦 Using cached complete price data for ${ticker}`)
    return cached.data
  }

  console.log(`🔄 Fetching complete price data for ${ticker}`)
  
  // Fetch both historical and current data in parallel
  const [historicalClose, currentSnapshot] = await Promise.all([
    getDailyClose(ticker, '2025-06-16'),
    getSnapshotPrice(ticker)
  ])
  
  const pricePoint: PricePoint = {
    close_2025_06_16: historicalClose,
    currentPrice: currentSnapshot.price,
    currentTimestamp: currentSnapshot.timestamp,
    prevClose: currentSnapshot.prevClose,
    dayChange: currentSnapshot.dayChange,
    dayChangePercent: currentSnapshot.dayChangePercent
  }
  
  // Cache the complete result
  snapshotCache.set(cacheKey, {
    data: pricePoint,
    timestamp: Date.now()
  })
  
  return pricePoint
}

/**
 * Batch fetch price data for multiple tickers
 */
export async function getBatchPriceData(tickers: string[]): Promise<Record<string, PricePoint>> {
  const results: Record<string, PricePoint> = {}
  
  console.log(`🚀 Batch fetching price data for ${tickers.length} tickers:`, tickers)
  
  // Process in batches to respect rate limits
  const batchSize = 5
  const batches = []
  
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    batches.push(batch)
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (ticker) => {
      const priceData = await getCompletePriceData(ticker)
      return { ticker, priceData }
    })
    
    const batchResults = await Promise.allSettled(batchPromises)
    
    batchResults.forEach((result, index) => {
      const ticker = batch[index]
      if (ticker && result.status === 'fulfilled') {
        results[ticker] = result.value.priceData
      } else if (ticker) {
        console.error(`❌ Failed to fetch data for ${ticker}:`, result.reason)
        results[ticker] = {
          close_2025_06_16: null,
          currentPrice: null,
          currentTimestamp: null,
          prevClose: null,
          dayChange: null,
          dayChangePercent: null
        }
      }
    })
    
    // Add delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  console.log(`✅ Batch fetch completed for ${Object.keys(results).length} tickers`)
  return results
}

/**
 * Validate ticker format and normalize
 */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase()
}

/**
 * Check if market is currently open (simplified)
 */
export function isMarketOpen(): boolean {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  const hour = now.getHours()
  
  // Basic check: weekdays 9:30 AM - 4:00 PM ET
  // Note: This is simplified and doesn't account for holidays
  if (day === 0 || day === 6) return false // Weekend
  if (hour < 9 || hour >= 16) return false // Outside market hours
  
  return true
}

/**
 * Get appropriate cache TTL based on market status
 */
export function getCacheTTL(): number {
  return isMarketOpen() ? 10 * 1000 : 5 * 60 * 1000 // 10s during market, 5m off-hours
}

/**
 * Clear expired cache entries
 */
export function cleanupCache(): void {
  const now = Date.now()
  let cleaned = 0
  
  // Clean historical cache
  historicalCache.forEach((cached, key) => {
    if (now - cached.timestamp > HISTORICAL_CACHE_TTL) {
      historicalCache.delete(key)
      cleaned++
    }
  })
  
  // Clean snapshot cache
  snapshotCache.forEach((cached, key) => {
    if (now - cached.timestamp > SNAPSHOT_CACHE_TTL) {
      snapshotCache.delete(key)
      cleaned++
    }
  })
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`)
  }
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): {
  historical: number
  snapshot: number
  totalSize: number
} {
  return {
    historical: historicalCache.size,
    snapshot: snapshotCache.size,
    totalSize: historicalCache.size + snapshotCache.size
  }
}

// Auto-cleanup cache every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupCache, 10 * 60 * 1000)
}

// Price Cache Utility for Finnhub API
// Implements in-memory caching to reduce API calls and improve performance
// Compatible with both client-side and server-side Next.js usage

const HISTORICAL_CACHE_DURATION = 14 * 24 * 60 * 60 * 1000 // 14 days
const CURRENT_PRICE_CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
const DIVIDEND_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// In-memory cache storage
interface CacheEntry {
  data: any
  timestamp: number
  expiry: number
}

const memoryCache = new Map<string, CacheEntry>()

// Cache key generators
function historicalPriceCacheKey(symbol: string, date: string): string {
  return `hist-${symbol}-${date}`
}

function currentPriceCacheKey(symbol: string): string {
  return `curr-${symbol}`
}

function dividendCacheKey(symbol: string, fromDate: string, toDate: string): string {
  return `div-${symbol}-${fromDate}-${toDate}`
}

// Generic cache operations
function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  
  if (!entry) {
    return null
  }
  
  if (Date.now() < entry.expiry) {
    console.log(`📦 Cache HIT for ${key}`)
    return entry.data as T
  } else {
    console.log(`⏰ Cache EXPIRED for ${key}`)
    memoryCache.delete(key)
    return null
  }
}

function setCache<T>(key: string, data: T, duration: number): void {
  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + duration
  }
  
  memoryCache.set(key, entry)
  console.log(`💾 Cache SET for ${key}`)
}

// Historical price caching
export async function getCachedHistoricalPrice(
  symbol: string,
  date: string,
  fetchFunction: () => Promise<number | null>
): Promise<number | null> {
  const cacheKey = historicalPriceCacheKey(symbol, date)
  
  // Try to get from cache first
  const cached = getFromCache<number>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  console.log(`🔄 Fetching fresh historical price for ${symbol} on ${date}`)
  const freshData = await fetchFunction()
  
  // Cache the result if valid
  if (freshData !== null) {
    setCache(cacheKey, freshData, HISTORICAL_CACHE_DURATION)
  }
  
  return freshData
}

// Current price caching
export async function getCachedCurrentPrice(
  symbol: string,
  fetchFunction: () => Promise<{ price: number; change: number }>
): Promise<{ price: number; change: number }> {
  const cacheKey = currentPriceCacheKey(symbol)
  
  // Try to get from cache first
  const cached = getFromCache<{ price: number; change: number }>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  console.log(`🔄 Fetching fresh current price for ${symbol}`)
  const freshData = await fetchFunction()
  
  // Cache the result
  setCache(cacheKey, freshData, CURRENT_PRICE_CACHE_DURATION)
  
  return freshData
}

// Dividend caching
export async function getCachedDividends(
  symbol: string,
  fromDate: string,
  toDate: string,
  fetchFunction: () => Promise<number>
): Promise<number> {
  const cacheKey = dividendCacheKey(symbol, fromDate, toDate)
  
  // Try to get from cache first
  const cached = getFromCache<number>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // Fetch fresh data
  console.log(`🔄 Fetching fresh dividends for ${symbol} (${fromDate} to ${toDate})`)
  const freshData = await fetchFunction()
  
  // Cache the result
  setCache(cacheKey, freshData, DIVIDEND_CACHE_DURATION)
  
  return freshData
}

// Prefetch common symbols
export async function prefetchCommonSymbols(
  symbols: string[],
  date: string,
  historicalFetchFunction: (symbol: string) => Promise<number | null>,
  currentFetchFunction: (symbol: string) => Promise<{ price: number; change: number }>
): Promise<void> {
  console.log(`🚀 Prefetching ${symbols.length} symbols...`)
  
  const batchSize = 3
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    
    await Promise.all([
      ...batch.map(symbol => getCachedHistoricalPrice(symbol, date, () => historicalFetchFunction(symbol))),
      ...batch.map(symbol => getCachedCurrentPrice(symbol, () => currentFetchFunction(symbol)))
    ])
    
    // Small delay between batches
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log(`✅ Prefetching complete`)
}

// Cache statistics
export async function getCacheStats(): Promise<{
  totalFiles: number
  totalSize: number
  oldestFile: string | null
  newestFile: string | null
}> {
  const totalEntries = memoryCache.size
  let oldestEntry: string | null = null
  let newestEntry: string | null = null
  let oldestTime = Infinity
  let newestTime = 0
  
  memoryCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp
      oldestEntry = key
    }
    if (entry.timestamp > newestTime) {
      newestTime = entry.timestamp
      newestEntry = key
    }
  })
  
  return {
    totalFiles: totalEntries,
    totalSize: Math.round(JSON.stringify(Array.from(memoryCache.entries())).length / 1024), // Approximate KB
    oldestFile: oldestEntry,
    newestFile: newestEntry
  }
}

// Clean expired cache entries
export async function cleanExpiredCache(): Promise<void> {
  const now = Date.now()
  let cleaned = 0
  
  const keysToDelete: string[] = []
  memoryCache.forEach((entry, key) => {
    if (now >= entry.expiry) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => {
    memoryCache.delete(key)
    cleaned++
  })
  
  console.log(`🧹 Cleaned ${cleaned} expired cache entries`)
}
// Polygon.io API Integration for Wall Street Bets Profile
// Polygon.io API integration with enhanced performance and accuracy
// Note: Temporarily using simplified caching to fix API route
// TODO: Re-enable full priceCache integration after testing

const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY

if (!API_KEY) {
  console.error('❌ POLYGON API KEY NOT FOUND! Set NEXT_PUBLIC_POLYGON_API_KEY in your .env.local file')
  console.error('❌ Real stock prices will not work without a valid Polygon.io API key')
} else {
  console.log(`✅ Polygon API key loaded: ${API_KEY.substring(0, 8)}...`)
}

export interface PolygonQuote {
  p: number    // Price
  s: number    // Size
  t: number    // Timestamp (nanoseconds)
  c: number[]  // Conditions
  x: number    // Exchange
}

export interface PolygonLastTrade {
  results: {
    p: number    // Price
    s: number    // Size  
    c: number    // Conditions
    x: number    // Exchange
    t: number    // Timestamp (nanoseconds)
  }
  status: string
  request_id: string
  count: number
}

export interface PolygonAggs {
  results: {
    c: number    // Close price
    h: number    // High price
    l: number    // Low price
    o: number    // Open price
    t: number    // Timestamp (milliseconds)
    v: number    // Volume
    vw: number   // Volume weighted average price
    n: number    // Number of transactions
  }[]
  status: string
  request_id: string
  count: number
  adjusted: boolean
}

export interface PolygonTickerDetails {
  results: {
    ticker: string
    name: string
    market: string
    locale: string
    primary_exchange: string
    type: string
    active: boolean
    currency_name: string
    cik?: string
    composite_figi?: string
    share_class_figi?: string
    market_cap?: number
    phone_number?: string
    address?: {
      address1?: string
      city?: string
      state?: string
      postal_code?: string
    }
    description?: string
    sic_code?: string
    sic_description?: string
    ticker_root?: string
    homepage_url?: string
    total_employees?: number
    list_date?: string
    branding?: {
      logo_url?: string
      icon_url?: string
    }
    share_class_shares_outstanding?: number
    weighted_shares_outstanding?: number
  }
  status: string
  request_id: string
}

export interface PolygonDividend {
  results: {
    cash_amount: number
    currency: string
    declaration_date: string
    dividend_type: string
    ex_dividend_date: string
    frequency: number
    pay_date: string
    record_date: string
    ticker: string
  }[]
  status: string
  request_id: string
  count: number
}

// Generic Polygon.io GET function with enhanced error handling
export async function fetchPolygonEndpoint<T>(
  endpoint: string, 
  params: Record<string, string> = {}
): Promise<T | null> {
  if (!API_KEY) {
    console.warn(`🔑 No Polygon API key for endpoint: ${endpoint}`)
    return null
  }

  try {
    const url = new URL(`https://api.polygon.io${endpoint}`)
    const fullParams = { ...params, apikey: API_KEY }
    
    // Add parameters to URL
    Object.entries(fullParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
    
    console.log(`🔗 Polygon API Request: ${endpoint}`)
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Check Polygon.io specific error responses
    if (data.status === 'ERROR') {
      throw new Error(`Polygon API Error: ${data.error || 'Unknown error'}`)
    }
    
    if (data.status !== 'OK' && data.status !== 'DELAYED') {
      console.warn(`⚠️ Polygon API Warning: Status ${data.status} for ${endpoint}`)
    } else if (data.status === 'DELAYED') {
      console.log(`📊 Polygon API Info: Using delayed data for ${endpoint}`)
    }
    
    return data as T
  } catch (error) {
    console.error(`❌ Polygon API error for ${endpoint}:`, error)
    return null
  }
}

// Get last trade price for a symbol
export async function getLivePrice(symbol: string): Promise<PolygonLastTrade | null> {
  return fetchPolygonEndpoint<PolygonLastTrade>(
    `/v2/last/trade/${symbol.toUpperCase()}`
  )
}

// Get company profile/details
export async function getCompanyProfile(symbol: string): Promise<PolygonTickerDetails | null> {
  return fetchPolygonEndpoint<PolygonTickerDetails>(
    `/v3/reference/tickers/${symbol.toUpperCase()}`
  )
}

// Get historical aggregates (candles)
export async function getHistoricalCandles(
  symbol: string,
  from: string,
  to: string,
  timespan: string = 'day',
  multiplier: number = 1
): Promise<PolygonAggs | null> {
  return fetchPolygonEndpoint<PolygonAggs>(
    `/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}`,
    {
      adjusted: 'true',
      sort: 'asc'
    }
  )
}

// Get dividends for a symbol within a date range
export async function getDividends(
  symbol: string,
  from: string,
  to: string
): Promise<PolygonDividend | null> {
  return fetchPolygonEndpoint<PolygonDividend>(
    `/v3/reference/dividends`,
    {
      'ticker': symbol.toUpperCase(),
      'ex_dividend_date.gte': from,
      'ex_dividend_date.lte': to,
      'limit': '1000'
    }
  )
}

// Get multiple live prices efficiently (batch processing)
export async function getMultiplePrices(symbols: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  
  // Use Promise.all for parallel requests with rate limiting
  const batches = []
  const batchSize = 5 // Respect Polygon.io rate limits
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    batches.push(batch)
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (symbol) => {
      const quote = await getLivePrice(symbol)
      return { 
        symbol, 
        price: quote?.results?.p || 0 
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ symbol, price }) => {
      results[symbol] = price
    })
    
    // Small delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return results
}

// Trading day validation (enhanced for US market)
export function isTradingDay(date: Date): boolean {
  const day = date.getDay()
  // Check if it's weekend (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) return false
  
  // US Market holidays (basic list - extend as needed)
  const month = date.getMonth() + 1
  const dayOfMonth = date.getDate()
  
  // New Year's Day
  if (month === 1 && dayOfMonth === 1) return false
  // Independence Day
  if (month === 7 && dayOfMonth === 4) return false
  // Christmas Day
  if (month === 12 && dayOfMonth === 25) return false
  
  // TODO: Add more holidays (MLK Day, Presidents Day, etc.)
  return true
}

// Find nearest trading day (preferring next available day)
export function getNearestTradingDay(date: Date): Date {
  let checkDate = new Date(date)
  let attempts = 0
  
  // First try to find next trading day
  while (!isTradingDay(checkDate) && attempts < 14) {
    checkDate.setDate(checkDate.getDate() + 1)
    attempts++
  }
  
  // If no trading day found in next 14 days, go backwards
  if (!isTradingDay(checkDate)) {
    checkDate = new Date(date)
    attempts = 0
    while (!isTradingDay(checkDate) && attempts < 14) {
      checkDate.setDate(checkDate.getDate() - 1)
      attempts++
    }
  }
  
  return checkDate
}

// Enhanced mock data with 2025 realistic price levels
export const mockPrices: Record<string, { price: number; change: number }> = {
  'RKLB': { price: 15.23, change: 2.5 },
  'AMZN': { price: 142.65, change: -0.8 },
  'SOFI': { price: 8.45, change: 3.2 },
  'ASTS': { price: 12.89, change: 1.8 },
  'BRK.B': { price: 345.67, change: 0.5 },
  'CELH': { price: 67.34, change: -1.2 },
  'OSCR': { price: 23.45, change: 4.1 },
  'EOG': { price: 123.78, change: 0.9 },
  'BROS': { price: 34.56, change: 2.3 },
  'ABCL': { price: 18.90, change: -0.5 },
  'PLTR': { price: 158.80, change: 5.2 },
  'HOOD': { price: 104.85, change: -2.1 },
  'TSLA': { price: 316.06, change: 3.8 },
  'AMD': { price: 166.47, change: 1.5 },
  'JPM': { price: 298.62, change: -0.3 },
  'NBIS': { price: 50.46, change: 2.7 },
  'GRAB': { price: 4.71, change: -1.8 },
  'AAPL': { price: 213.88, change: 1.2 },
  'V': { price: 357.04, change: 0.8 },
  'DUOL': { price: 364.09, change: 4.5 },
  'META': { price: 298.45, change: 2.1 },
  'MSTR': { price: 189.67, change: 8.9 },
  'MSFT': { price: 325.12, change: 1.1 },
  'HIMS': { price: 12.34, change: -3.2 },
  'AVGO': { price: 456.78, change: 0.7 },
  'CRWD': { price: 234.56, change: 3.4 },
  'NFLX': { price: 387.65, change: -1.5 },
  'CRM': { price: 198.45, change: 2.8 },
  'PYPL': { price: 67.89, change: -2.3 },
  'MU': { price: 89.12, change: 1.9 },
  'NVDA': { price: 456.78, change: 4.2 },
  'NU': { price: 8.90, change: 3.6 },
  'NOW': { price: 567.89, change: 1.4 },
  'MELI': { price: 1234.56, change: 0.9 },
  'SHOP': { price: 67.89, change: -1.1 },
  'TTD': { price: 78.45, change: 2.6 },
  'ASML': { price: 678.90, change: 0.3 },
  'APP': { price: 45.67, change: 5.1 },
  'COIN': { price: 123.45, change: -4.2 },
  'TSM': { price: 89.67, change: 1.7 },
  'UNH': { price: 456.78, change: 0.6 },
  'GOOGL': { price: 134.56, change: 1.8 },
  'MRVL': { price: 56.78, change: 2.4 },
  'AXON': { price: 189.45, change: 3.1 },
  'ELF': { price: 123.45, change: -0.9 },
  'ORCL': { price: 98.76, change: 1.3 },
  'CSCO': { price: 45.67, change: 0.4 },
  'LLY': { price: 567.89, change: 2.7 },
  'NVO': { price: 98.45, change: -1.4 },
  'TTWO': { price: 134.56, change: 3.5 },
  'JNJ': { price: 156.78, change: 0.2 },
  'SPY': { price: 412.34, change: 1.2 },
  'QQQ': { price: 345.67, change: -0.8 },
  'BND': { price: 78.90, change: 0.1 }
}

// Internal function to fetch historical price without caching
async function fetchHistoricalPriceFromAPI(symbol: string, date: string): Promise<number | null> {
  const requestedDate = new Date(date)
  const tradingDate = getNearestTradingDay(requestedDate)
  
  // Format dates for Polygon API (YYYY-MM-DD)
  const fromDate = tradingDate.toISOString().split('T')[0]
  const toDate = tradingDate.toISOString().split('T')[0]
  
  try {
    console.log(`🔍 Fetching historical data for ${symbol} on ${fromDate}`)
    const aggs = await getHistoricalCandles(symbol, fromDate, toDate, 'day', 1)
    
    if (aggs && aggs.results && aggs.results.length > 0) {
      const closePrice = aggs.results[0].c
      console.log(`✅ Polygon API Success for ${symbol}: $${closePrice.toFixed(2)} on ${fromDate}`)
      return closePrice
    } else {
      console.log(`⚠️ No historical data found for ${symbol} on ${fromDate}`)
    }
  } catch (error) {
    console.error(`❌ Polygon API Error for ${symbol}:`, error)
  }
  
  // Fallback to mock data with trend calculation
  const mockData = mockPrices[symbol]
  if (mockData?.price) {
    console.log(`🔄 Using calculated fallback for ${symbol}`)
    
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - tradingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Apply trend calculation for historical dates
    if (daysDiff > 0) {
      const trendFactor = Math.max(0.7, 1 - (daysDiff * 0.0008))
      const volatility = Math.sin(daysDiff / 30) * 0.05
      return mockData.price * (trendFactor + volatility)
    }
    
    return mockData.price * (1 + Math.abs(daysDiff) * 0.0002)
  }
  
  console.log(`❌ No data available for ${symbol}`)
  return null
}

// Simple cache for historical prices
const historicalCache = new Map<string, { price: number; timestamp: number }>()
const HISTORICAL_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Get historical price for a specific date (with caching)
export async function getHistoricalPrice(symbol: string, date: string): Promise<number | null> {
  console.log(`🔍 Getting historical price for ${symbol} on ${date}`)
  
  const cacheKey = `${symbol}-${date}`
  const cached = historicalCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < HISTORICAL_CACHE_DURATION) {
    console.log(`📦 Using cached historical price for ${symbol}`)
    return cached.price
  }
  
  const result = await fetchHistoricalPriceFromAPI(symbol, date)
  
  if (result !== null) {
    historicalCache.set(cacheKey, {
      price: result,
      timestamp: Date.now()
    })
  }
  
  return result
}

// Internal function to fetch current price without caching
async function fetchCurrentPriceFromAPI(symbol: string): Promise<{ price: number; change: number }> {
  // ALWAYS try Polygon API first - no fallback to mock unless API completely fails
  if (!API_KEY) {
    console.error(`❌ No Polygon API key configured for ${symbol}`)
    throw new Error('Polygon API key is required')
  }

  try {
    console.log(`🔍 Fetching REAL price from Polygon API for ${symbol}`)
    const liveData = await getLivePrice(symbol)
    
    if (liveData && liveData.results && liveData.results.p > 0) {
      const currentPrice = liveData.results.p
      
      // Get previous day's close for change calculation
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      // Try to get historical price for change calculation
      let changePercent = 0
      try {
        const prevClose = await getHistoricalPrice(symbol, yesterdayStr)
        changePercent = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0
      } catch (error) {
        console.warn(`⚠️ Could not get historical price for ${symbol}, using 0% change`)
      }
      
      console.log(`✅ REAL Polygon API data for ${symbol}: $${currentPrice.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`)
      
      return {
        price: currentPrice,
        change: changePercent
      }
    } else {
      console.error(`❌ Polygon API returned invalid/empty data for ${symbol}:`, liveData)
      throw new Error(`Invalid data from Polygon API for ${symbol}`)
    }
  } catch (error) {
    console.error(`❌ Polygon API Error for ${symbol}:`, error)
    
    // Only use fallback if explicitly allowed (for development)
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_MOCK_FALLBACK === 'true') {
      console.warn(`🔄 Using mock data for ${symbol} (development mode with fallback enabled)`)
      const mockData = mockPrices[symbol]
      if (mockData?.price) {
        return {
          price: mockData.price,
          change: mockData.change
        }
      }
    }
    
    // Throw error to force proper API usage
    throw new Error(`Failed to fetch real price for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Simple cache for current session
const priceCache = new Map<string, { price: number; change: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Get current price with caching and fallback to mock data in development
export async function getCurrentPrice(symbol: string): Promise<{ price: number; change: number }> {
  console.log(`🔍 Getting current price for ${symbol}`)
  
  // Check cache first
  const cached = priceCache.get(symbol)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`📦 Using cached price for ${symbol}`)
    return { price: cached.price, change: cached.change }
  }
  
  const result = await fetchCurrentPriceFromAPI(symbol)
  
  // Cache the result
  priceCache.set(symbol, {
    price: result.price,
    change: result.change,
    timestamp: Date.now()
  })
  
  return result
}

// Get multiple historical prices at once
export async function getMultipleHistoricalPrices(symbols: string[], date: string): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {}
  
  const batches = []
  const batchSize = 3 // Smaller batch size for historical data
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    batches.push(batch)
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (symbol) => {
      const price = await getHistoricalPrice(symbol, date)
      return { symbol, price }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ symbol, price }) => {
      results[symbol] = price
    })
    
    // Delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  
  return results
}

// Internal function to fetch dividends without caching
async function fetchDividendsFromAPI(symbol: string, fromDate: string, toDate: string): Promise<number> {
  try {
    const dividends = await getDividends(symbol, fromDate, toDate)
    
    if (dividends && dividends.results && dividends.results.length > 0) {
      const totalDividends = dividends.results.reduce((sum, div) => sum + div.cash_amount, 0)
      console.log(`✅ Polygon dividends for ${symbol}: $${totalDividends.toFixed(4)}`)
      return totalDividends
    }
  } catch (error) {
    console.error(`❌ Polygon API Error fetching dividends for ${symbol}:`, error)
  }
  
  // Fallback: estimate dividends for major stocks
  const mockDividends: Record<string, number> = {
    'AAPL': 0.24, 'MSFT': 0.28, 'GOOGL': 0.0, 'AMZN': 0.0, 'TSLA': 0.0,
    'META': 0.0, 'NVDA': 0.04, 'JPM': 1.05, 'UNH': 1.88, 'V': 0.45,
    'JNJ': 1.19, 'BRK.B': 0.0, 'PLTR': 0.0, 'HOOD': 0.0, 'AMD': 0.0,
    'RKLB': 0.0, 'SOFI': 0.0, 'ASTS': 0.0, 'CELH': 0.0, 'OSCR': 0.0,
    'EOG': 0.65, 'BROS': 0.0, 'ABCL': 0.0, 'NBIS': 0.0, 'GRAB': 0.0,
    'DUOL': 0.0, 'MSTR': 0.0, 'HIMS': 0.0, 'AVGO': 1.12, 'CRWD': 0.0,
    'NFLX': 0.0, 'CRM': 0.0, 'PYPL': 0.0, 'MU': 0.0, 'NU': 0.0,
    'NOW': 0.0, 'MELI': 0.0, 'SHOP': 0.0, 'TTD': 0.0, 'ASML': 1.40,
    'APP': 0.0, 'COIN': 0.0, 'TSM': 0.92, 'MRVL': 0.06, 'AXON': 0.0,
    'ELF': 0.0, 'ORCL': 0.40, 'CSCO': 0.40, 'LLY': 1.30, 'NVO': 3.42,
    'TTWO': 0.0
  }
  
  // Estimate quarterly dividends over the period
  const monthsDiff = Math.abs(new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
  const quarters = Math.floor(monthsDiff / 3)
  return (mockDividends[symbol] || 0) * quarters
}

// Simple cache for dividends
const dividendCache = new Map<string, { amount: number; timestamp: number }>()
const DIVIDEND_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Calculate total dividends for a symbol between two dates (with caching)
export async function getTotalDividends(
  symbol: string, 
  fromDate: string, 
  toDate: string
): Promise<number> {
  console.log(`🔍 Getting dividends for ${symbol} (${fromDate} to ${toDate})`)
  
  const cacheKey = `${symbol}-${fromDate}-${toDate}`
  const cached = dividendCache.get(cacheKey)
  
  if (cached && (Date.now() - cached.timestamp) < DIVIDEND_CACHE_DURATION) {
    console.log(`📦 Using cached dividend data for ${symbol}`)
    return cached.amount
  }
  
  const result = await fetchDividendsFromAPI(symbol, fromDate, toDate)
  
  dividendCache.set(cacheKey, {
    amount: result,
    timestamp: Date.now()
  })
  
  return result
}

// Get multiple dividend totals at once
export async function getMultipleDividends(
  symbols: string[], 
  fromDate: string, 
  toDate: string
): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  
  const batches = []
  const batchSize = 2
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    batches.push(batch)
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (symbol) => {
      const dividendTotal = await getTotalDividends(symbol, fromDate, toDate)
      return { symbol, dividendTotal }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ symbol, dividendTotal }) => {
      results[symbol] = dividendTotal
    })
    
    // Longer delay for dividend requests
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600))
    }
  }
  
  return results
}

// Prefetch common portfolio symbols (simplified version)
export async function prefetchPortfolioSymbols(symbols: string[], date: string): Promise<void> {
  console.log(`🚀 Prefetching Polygon data for ${symbols.length} symbols...`)
  
  // Prefetch current prices
  const currentPricePromises = symbols.slice(0, 5).map(symbol => getCurrentPrice(symbol))
  await Promise.allSettled(currentPricePromises)
  
  // Prefetch historical prices
  const historicalPricePromises = symbols.slice(0, 3).map(symbol => getHistoricalPrice(symbol, date))
  await Promise.allSettled(historicalPricePromises)
  
  console.log(`✅ Prefetching completed`)
}

// Export cache statistics for monitoring (simplified version)
export async function logCacheStats(): Promise<void> {
  console.log(`📊 Polygon Cache Statistics:`)
  console.log(`   - Current price cache: ${priceCache.size} entries`)
  console.log(`   - Historical price cache: ${historicalCache.size} entries`)
  console.log(`   - Dividend cache: ${dividendCache.size} entries`)
}
// Using fetch API instead of axios for better Next.js compatibility

const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY

if (!API_KEY) {
  console.warn('Finnhub API key not found. Using mock data.')
}

export interface FinnhubQuote {
  c: number  // Current price
  d: number  // Change
  dp: number // Percent change
  h: number  // High price of the day
  l: number  // Low price of the day
  o: number  // Open price of the day
  pc: number // Previous close price
  t: number  // Timestamp
}

export interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  finnhubIndustry: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
}

export interface FinnhubCandle {
  c: number[]  // Close prices
  h: number[]  // High prices
  l: number[]  // Low prices
  o: number[]  // Open prices
  s: string    // Status
  t: number[]  // Timestamps
  v: number[]  // Volume
}

// Generic Finnhub GET function
export async function fetchFinnhubEndpoint<T>(
  endpoint: string, 
  params: Record<string, string>
): Promise<T | null> {
  if (!API_KEY) {
    return null
  }

  try {
    const url = new URL(`https://finnhub.io/api/v1/${endpoint}`)
    const fullParams = { ...params, token: API_KEY }
    
    // Add parameters to URL
    Object.entries(fullParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`Finnhub API error for ${endpoint}:`, error)
    return null
  }
}

// Fetch current price for a ticker
export async function getLivePrice(symbol: string): Promise<FinnhubQuote | null> {
  return fetchFinnhubEndpoint<FinnhubQuote>('quote', { symbol })
}

// Fetch company profile
export async function getCompanyProfile(symbol: string): Promise<FinnhubProfile | null> {
  return fetchFinnhubEndpoint<FinnhubProfile>('stock/profile2', { symbol })
}

// Fetch historical candles
export async function getHistoricalCandles(
  symbol: string, 
  from: number, 
  to: number,
  resolution: string = 'D'
): Promise<FinnhubCandle | null> {
  return fetchFinnhubEndpoint<FinnhubCandle>('stock/candle', {
    symbol,
    resolution,
    from: from.toString(),
    to: to.toString()
  })
}

// Fetch multiple quotes at once
export async function getMultiplePrices(symbols: string[]): Promise<Record<string, FinnhubQuote | null>> {
  const results: Record<string, FinnhubQuote | null> = {}
  
  // Use Promise.all for parallel requests but with rate limiting
  const batches = []
  const batchSize = 5 // Limit concurrent requests
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize)
    batches.push(batch)
  }
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (symbol) => {
      const quote = await getLivePrice(symbol)
      return { symbol, quote }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ symbol, quote }) => {
      results[symbol] = quote
    })
    
    // Small delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}

// Mock data fallback when API is not available
export const mockPrices: Record<string, Partial<FinnhubQuote>> = {
  'RKLB': { c: 15.23, dp: 2.5 },
  'AMZN': { c: 142.65, dp: -0.8 },
  'SOFI': { c: 8.45, dp: 3.2 },
  'ASTS': { c: 12.89, dp: 1.8 },
  'BRK.B': { c: 345.67, dp: 0.5 },
  'CELH': { c: 67.34, dp: -1.2 },
  'OSCR': { c: 23.45, dp: 4.1 },
  'EOG': { c: 123.78, dp: 0.9 },
  'BROS': { c: 34.56, dp: 2.3 },
  'ABCL': { c: 18.90, dp: -0.5 },
  'PLTR': { c: 18.76, dp: 5.2 },
  'HOOD': { c: 14.23, dp: -2.1 },
  'TSLA': { c: 245.67, dp: 3.8 },
  'AMD': { c: 89.34, dp: 1.5 },
  'JPM': { c: 145.23, dp: -0.3 },
  'NBIS': { c: 32.17, dp: 2.7 },
  'GRAB': { c: 3.45, dp: -1.8 },
  'AAPL': { c: 175.23, dp: 1.2 },
  'V': { c: 234.56, dp: 0.8 },
  'DUOL': { c: 156.78, dp: 4.5 },
  'META': { c: 298.45, dp: 2.1 },
  'MSTR': { c: 189.67, dp: 8.9 },
  'MSFT': { c: 325.12, dp: 1.1 },
  'HIMS': { c: 12.34, dp: -3.2 },
  'AVGO': { c: 456.78, dp: 0.7 },
  'CRWD': { c: 234.56, dp: 3.4 },
  'NFLX': { c: 387.65, dp: -1.5 },
  'CRM': { c: 198.45, dp: 2.8 },
  'PYPL': { c: 67.89, dp: -2.3 },
  'MU': { c: 89.12, dp: 1.9 },
  'NVDA': { c: 456.78, dp: 4.2 },
  'NU': { c: 8.90, dp: 3.6 },
  'NOW': { c: 567.89, dp: 1.4 },
  'MELI': { c: 1234.56, dp: 0.9 },
  'SHOP': { c: 67.89, dp: -1.1 },
  'TTD': { c: 78.45, dp: 2.6 },
  'ASML': { c: 678.90, dp: 0.3 },
  'APP': { c: 45.67, dp: 5.1 },
  'COIN': { c: 123.45, dp: -4.2 },
  'TSM': { c: 89.67, dp: 1.7 },
  'UNH': { c: 456.78, dp: 0.6 },
  'GOOGL': { c: 134.56, dp: 1.8 },
  'MRVL': { c: 56.78, dp: 2.4 },
  'AXON': { c: 189.45, dp: 3.1 },
  'ELF': { c: 123.45, dp: -0.9 },
  'ORCL': { c: 98.76, dp: 1.3 },
  'CSCO': { c: 45.67, dp: 0.4 },
  'LLY': { c: 567.89, dp: 2.7 },
  'NVO': { c: 98.45, dp: -1.4 },
  'TTWO': { c: 134.56, dp: 3.5 },
  'JNJ': { c: 156.78, dp: 0.2 },
  'SPY': { c: 412.34, dp: 1.2 },
  'QQQ': { c: 345.67, dp: -0.8 },
  'BND': { c: 78.90, dp: 0.1 }
}

// Get historical price for a specific date
export async function getHistoricalPrice(symbol: string, date: string): Promise<number | null> {
  const targetDate = new Date(date)
  const targetTimestamp = Math.floor(targetDate.getTime() / 1000)
  
  // Get a range around the target date (in case of weekends/holidays)
  const startDate = new Date(targetDate)
  startDate.setDate(startDate.getDate() - 5)
  const endDate = new Date(targetDate)
  endDate.setDate(endDate.getDate() + 1)
  
  const startTimestamp = Math.floor(startDate.getTime() / 1000)
  const endTimestamp = Math.floor(endDate.getTime() / 1000)
  
  const candles = await getHistoricalCandles(symbol, startTimestamp, endTimestamp, 'D')
  
  if (candles && candles.c && candles.t && candles.c.length > 0) {
    // Find the closest date to our target
    let closestIndex = 0
    let closestDiff = Math.abs(candles.t[0] - targetTimestamp)
    
    for (let i = 1; i < candles.t.length; i++) {
      const diff = Math.abs(candles.t[i] - targetTimestamp)
      if (diff < closestDiff) {
        closestDiff = diff
        closestIndex = i
      }
    }
    
    return candles.c[closestIndex]
  }
  
  // Fallback to mock data with date-based variation
  const mockData = mockPrices[symbol]
  if (mockData?.c) {
    // Add some historical variation based on how far back the date is
    const daysAgo = Math.floor((Date.now() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
    const variation = (Math.sin(daysAgo / 10) * 0.1) + (daysAgo * 0.001) // Some historical drift
    return mockData.c * (1 - variation)
  }
  
  return null
}

// Get price with fallback to mock data
export async function getPriceWithFallback(symbol: string): Promise<{ price: number; change: number }> {
  const liveData = await getLivePrice(symbol)
  
  if (liveData && liveData.c) {
    return {
      price: liveData.c,
      change: liveData.dp || 0
    }
  }
  
  // Fallback to mock data
  const mockData = mockPrices[symbol]
  return {
    price: mockData?.c || 100,
    change: mockData?.dp || 0
  }
}

// Get multiple historical prices at once
export async function getMultipleHistoricalPrices(symbols: string[], date: string): Promise<Record<string, number | null>> {
  const results: Record<string, number | null> = {}
  
  // Use Promise.all for parallel requests but with rate limiting
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
    
    // Small delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  
  return results
}
/**
 * Historical Price Data Service using Polygon.io Aggregates API
 * 
 * Fetches historical stock price data for charting and analysis
 */

export interface HistoricalDataPoint {
  timestamp: number // Unix ms timestamp
  open: number
  high: number
  low: number
  close: number
  volume: number
  vwap?: number // Volume weighted average price
  transactions?: number
  date: string // YYYY-MM-DD format for easier handling
}

export interface HistoricalPriceResponse {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: HistoricalDataPoint[]
  status: string
  request_id?: string
  next_url?: string
}

export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y'

// Exact Polygon.io API response structure
export interface PolygonAggregateResult {
  v: number    // Volume
  vw: number   // Volume weighted average price
  o: number    // Open
  c: number    // Close
  h: number    // High
  l: number    // Low
  t: number    // Timestamp (Unix ms)
  n: number    // Number of transactions
}

export interface PolygonAggregatesResponse {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: PolygonAggregateResult[]
  status: string
  request_id?: string
  count?: number
  next_url?: string
}

interface TimeRangeConfig {
  days: number
  multiplier: number
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month'
}

const TIME_RANGE_CONFIGS: Record<TimeRange, TimeRangeConfig> = {
  '1D': { days: 1, multiplier: 5, timespan: 'minute' },
  '5D': { days: 5, multiplier: 15, timespan: 'minute' },
  '1M': { days: 30, multiplier: 1, timespan: 'day' },
  '3M': { days: 90, multiplier: 1, timespan: 'day' },
  '6M': { days: 180, multiplier: 1, timespan: 'day' },
  '1Y': { days: 365, multiplier: 1, timespan: 'day' },
  '2Y': { days: 730, multiplier: 1, timespan: 'week' },
  '5Y': { days: 1825, multiplier: 1, timespan: 'week' }
}

export class HistoricalPriceService {
  private apiKey: string
  private baseUrl = 'https://api.polygon.io/v2/aggs'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get historical price data for a ticker within a specific time range
   */
  async getHistoricalData(
    ticker: string, 
    timeRange: TimeRange = '1M'
  ): Promise<HistoricalPriceResponse> {
    const config = TIME_RANGE_CONFIGS[timeRange]
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - config.days)

    const fromDate = startDate.toISOString().split('T')[0]
    const toDate = endDate.toISOString().split('T')[0]

    const url = `${this.baseUrl}/ticker/${ticker.toUpperCase()}/range/${config.multiplier}/${config.timespan}/${fromDate}/${toDate}`
    
    const params = new URLSearchParams({
      adjusted: 'true',
      sort: 'asc',
      limit: '50000',
      apiKey: this.apiKey
    })

    try {
      console.log(`📊 Fetching ${timeRange} historical data for ${ticker}...`)
      
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: PolygonAggregatesResponse = await response.json()
      
      // Accept both "OK" and "DELAYED" status as valid responses
      if ((data.status !== 'OK' && data.status !== 'DELAYED') || !data.results || data.results.length === 0) {
        throw new Error(`No data available for ${ticker}`)
      }

      // Transform the data to include formatted dates based on exact API structure
      const transformedResults = data.results.map((point: {
        v: number;    // Volume
        vw: number;   // Volume weighted average price
        o: number;    // Open
        c: number;    // Close
        h: number;    // High
        l: number;    // Low
        t: number;    // Timestamp (Unix ms)
        n: number;    // Number of transactions
      }) => ({
        timestamp: point.t,
        open: point.o,
        high: point.h,
        low: point.l,
        close: point.c,
        volume: point.v,
        vwap: point.vw,
        transactions: point.n,
        date: new Date(point.t || Date.now()).toISOString().split('T')[0]
      }))

      console.log(`✅ Retrieved ${transformedResults.length} data points for ${ticker} (${timeRange})`)

      return {
        ticker: data.ticker,
        queryCount: data.queryCount,
        resultsCount: data.resultsCount,
        adjusted: true,
        results: transformedResults as HistoricalDataPoint[],
        status: data.status,
        request_id: data.request_id || '',
        next_url: data.next_url || ''
      }
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${ticker}:`, error)
      throw error
    }
  }

  /**
   * Get historical data for custom date range
   */
  async getHistoricalDataRange(
    ticker: string,
    fromDate: string, // YYYY-MM-DD
    toDate: string,   // YYYY-MM-DD
    timespan: 'day' | 'week' | 'month' = 'day',
    multiplier: number = 1
  ): Promise<HistoricalPriceResponse> {
    const url = `${this.baseUrl}/ticker/${ticker.toUpperCase()}/range/${multiplier}/${timespan}/${fromDate}/${toDate}`
    
    const params = new URLSearchParams({
      adjusted: 'true',
      sort: 'asc',
      limit: '50000',
      apiKey: this.apiKey
    })

    try {
      console.log(`📊 Fetching custom range historical data for ${ticker} (${fromDate} to ${toDate})...`)
      
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: PolygonAggregatesResponse = await response.json()
      
      // Accept both "OK" and "DELAYED" status as valid responses  
      if ((data.status !== 'OK' && data.status !== 'DELAYED') || !data.results || data.results.length === 0) {
        throw new Error(`No data available for ${ticker} in range ${fromDate} to ${toDate}`)
      }

      // Transform the data to include formatted dates based on exact API structure
      const transformedResults = data.results.map((point: {
        v: number;    // Volume
        vw: number;   // Volume weighted average price
        o: number;    // Open
        c: number;    // Close
        h: number;    // High
        l: number;    // Low
        t: number;    // Timestamp (Unix ms)
        n: number;    // Number of transactions
      }) => ({
        timestamp: point.t,
        open: point.o,
        high: point.h,
        low: point.l,
        close: point.c,
        volume: point.v,
        vwap: point.vw,
        transactions: point.n,
        date: new Date(point.t || Date.now()).toISOString().split('T')[0]
      }))

      console.log(`✅ Retrieved ${transformedResults.length} data points for ${ticker} (custom range)`)

      return {
        ticker: data.ticker,
        queryCount: data.queryCount,
        resultsCount: data.resultsCount,
        adjusted: true,
        results: transformedResults as HistoricalDataPoint[],
        status: data.status,
        request_id: data.request_id || '',
        next_url: data.next_url || ''
      }
    } catch (error) {
      console.error(`❌ Error fetching custom range historical data for ${ticker}:`, error)
      throw error
    }
  }

  /**
   * Generate mock historical data for fallback
   */
  generateMockHistoricalData(
    ticker: string, 
    timeRange: TimeRange = '1M',
    currentPrice: number = 100
  ): HistoricalPriceResponse {
    const config = TIME_RANGE_CONFIGS[timeRange]
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - config.days)

    const results: HistoricalDataPoint[] = []
    const totalPoints = Math.min(config.days, 250) // Reasonable number of points
    
    let price = currentPrice * 0.9 // Start 10% below current price
    const volatility = 0.02 // 2% daily volatility
    
    for (let i = 0; i < totalPoints; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + (i * config.days / totalPoints))
      
      // Generate realistic OHLCV data
      const changePercent = (Math.random() - 0.5) * volatility * 2
      const open = price
      const close = price * (1 + changePercent)
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = Math.floor(Math.random() * 10000000) + 1000000
      
      results.push({
        timestamp: date.getTime(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
        vwap: Number(((open + high + low + close) / 4).toFixed(2)),
        transactions: Math.floor(volume / 100),
        date: (date || new Date()).toISOString().split('T')[0] as string
      })
      
      price = close
    }

    return {
      ticker: ticker.toUpperCase(),
      queryCount: 1,
      resultsCount: results.length,
      adjusted: true,
      results,
      status: 'OK (MOCK)'
    }
  }
}

// Export a singleton instance
let historicalPriceService: HistoricalPriceService | null = null

export function getHistoricalPriceService(): HistoricalPriceService {
  if (!historicalPriceService) {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
    if (!apiKey) {
      throw new Error('Polygon API key not found. Set NEXT_PUBLIC_POLYGON_API_KEY in your environment.')
    }
    historicalPriceService = new HistoricalPriceService(apiKey)
  }
  return historicalPriceService
}
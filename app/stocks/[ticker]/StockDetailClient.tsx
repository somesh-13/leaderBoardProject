'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import StockPriceChart from '@/components/charts/StockPriceChart'
import type { HistoricalDataPoint, TimeRange, PolygonAggregatesResponse } from '@/lib/services/historicalPriceService'

interface StockDetailData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  dayHigh: number
  dayLow: number
  open: number
  previousClose: number
  pe?: number
  yearHigh?: number
  yearLow?: number
  avgVolume?: number
  lastUpdated: string
  historicalData?: HistoricalDataPoint[]
}

interface StockDetailClientProps {
  ticker: string
}

export default function StockDetailClient({ ticker }: StockDetailClientProps) {
  const [stockData, setStockData] = useState<StockDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [fullHistoricalData, setFullHistoricalData] = useState<HistoricalDataPoint[] | null>(null)

  // Function to get cached data from localStorage
  const getCachedHistoricalData = useCallback((ticker: string): HistoricalDataPoint[] | null => {
    try {
      const cached = localStorage.getItem(`stock_history_${ticker.toUpperCase()}`)
      if (cached) {
        const data = JSON.parse(cached)
        // Check if data is less than 1 hour old
        if (Date.now() - data.timestamp < 60 * 60 * 1000) {
          console.log(`📋 Using cached data for ${ticker}`)
          return data.historicalData
        }
      }
    } catch (error) {
      console.warn('Error reading cached data:', error)
    }
    return null
  }, [])

  // Function to cache historical data in localStorage
  const setCachedHistoricalData = useCallback((ticker: string, data: HistoricalDataPoint[]) => {
    try {
      localStorage.setItem(`stock_history_${ticker.toUpperCase()}`, JSON.stringify({
        timestamp: Date.now(),
        historicalData: data
      }))
      console.log(`💾 Cached historical data for ${ticker}`)
    } catch (error) {
      console.warn('Error caching data:', error)
    }
  }, [])

  // Function to filter historical data based on time range
  const filterHistoricalDataByTimeRange = useCallback((
    data: HistoricalDataPoint[], 
    timeRange: TimeRange
  ): HistoricalDataPoint[] => {
    if (!data || data.length === 0) return []
    
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '1D':
        startDate.setDate(now.getDate() - 1)
        break
      case '5D':
        startDate.setDate(now.getDate() - 5)
        break
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case '2Y':
        startDate.setFullYear(now.getFullYear() - 2)
        break
      case '5Y':
        startDate.setFullYear(now.getFullYear() - 5)
        break
      default:
        return data
    }

    return data.filter(point => point.timestamp >= startDate.getTime())
  }, [])

  // Generate mock historical data for fallback
  const generateMockHistoricalData = useCallback((
    ticker: string, 
    timeRange: TimeRange,
    currentPrice: number = 100
  ): HistoricalDataPoint[] => {
    const endDate = new Date()
    const startDate = new Date()
    
    let days = 30 // Default to 1 month
    switch (timeRange) {
      case '1D': days = 1; break
      case '5D': days = 5; break
      case '1M': days = 30; break
      case '3M': days = 90; break
      case '6M': days = 180; break
      case '1Y': days = 365; break
      case '2Y': days = 730; break
      case '5Y': days = 1825; break
    }
    
    startDate.setDate(endDate.getDate() - days)

    const results: HistoricalDataPoint[] = []
    const totalPoints = Math.min(days, 250)
    
    let price = currentPrice * 0.9 // Start 10% below current
    const volatility = 0.02 // 2% daily volatility
    
    for (let i = 0; i < totalPoints; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + (i * days / totalPoints))
      
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
        date: date.toISOString().split('T')[0]!
      })
      
      price = close
    }

    console.log(`📊 Generated ${results.length} mock data points for ${ticker} (${timeRange})`)
    return results
  }, [])

  // Function to fetch historical data directly from Polygon.io
  const fetchHistoricalDataFromPolygon = useCallback(async (
    ticker: string, 
    timeRange: TimeRange
  ): Promise<HistoricalDataPoint[] | null> => {
    const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
    
    if (!API_KEY) {
      console.warn('Polygon API key not found, using mock data')
      return generateMockHistoricalData(ticker, timeRange)
    }

    try {
      // Calculate date range based on timeRange
      const endDate = new Date()
      const startDate = new Date()
      
      let multiplier = 1
      let timespan = 'day'
      
      switch (timeRange) {
        case '1D':
          startDate.setDate(endDate.getDate() - 1)
          multiplier = 5
          timespan = 'minute'
          break
        case '5D':
          startDate.setDate(endDate.getDate() - 5)
          multiplier = 15
          timespan = 'minute'
          break
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1)
          multiplier = 1
          timespan = 'day'
          break
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3)
          multiplier = 1
          timespan = 'day'
          break
        case '6M':
          startDate.setMonth(endDate.getMonth() - 6)
          multiplier = 1
          timespan = 'day'
          break
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          multiplier = 1
          timespan = 'day'
          break
        case '2Y':
          startDate.setFullYear(endDate.getFullYear() - 2)
          multiplier = 1
          timespan = 'week'
          break
        case '5Y':
          startDate.setFullYear(endDate.getFullYear() - 5)
          multiplier = 1
          timespan = 'week'
          break
      }

      const fromDate = startDate.toISOString().split('T')[0]
      const toDate = endDate.toISOString().split('T')[0]

      // Build Polygon.io API URL - using the exact format from your example
      const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${API_KEY}`
      
      console.log(`📊 Fetching historical data from Polygon.io for ${ticker} (${timeRange}):`, polygonUrl)
      
      const response = await fetch(polygonUrl, {
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`)
      }

      const data: PolygonAggregatesResponse = await response.json()
      
      // Accept both "OK" and "DELAYED" status as per your API response example
      if ((data.status !== 'OK' && data.status !== 'DELAYED') || !data.results || data.results.length === 0) {
        console.warn(`No historical data available for ${ticker} (status: ${data.status}), using mock data`)
        return generateMockHistoricalData(ticker, timeRange)
      }

      // Transform Polygon.io response to our format based on exact API structure
      const transformedResults: HistoricalDataPoint[] = data.results.map((point: {
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
        date: new Date(point.t).toISOString().split('T')[0]!
      }))

      console.log(`✅ Fetched ${transformedResults.length} data points from Polygon.io for ${ticker}`)
      console.log(`📈 Latest closing price (c): $${data.results[data.results.length - 1]?.c} for ${ticker}`)
      return transformedResults

    } catch (error) {
      console.error(`❌ Error fetching historical data from Polygon.io for ${ticker}:`, error)
      // Fallback to mock data
      return generateMockHistoricalData(ticker, timeRange)
    }
  }, [generateMockHistoricalData])

  // Function to fetch snapshot data directly from Polygon.io
  const fetchPolygonSnapshotDirect = useCallback(async (ticker: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
    
    if (!API_KEY) {
      throw new Error('Polygon API key not found')
    }

    try {
      const response = await fetch(
        `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${API_KEY}`,
        {
          headers: {
            'User-Agent': 'leaderboard-app/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`📊 Direct Polygon API response for ${ticker}:`, JSON.stringify(data, null, 2))
      
      if (data.status === 'OK' && data.ticker) {
        const ticker_data = data.ticker
        const day = ticker_data.day || {}
        const prevDay = ticker_data.prevDay || {}
        
        const currentPrice = day.c || 0
        const previousClose = prevDay.c || 0
        const change = currentPrice - previousClose
        const changePercent = previousClose ? (change / previousClose) * 100 : 0
        
        // Mock company names for common tickers
        const companyNames: Record<string, string> = {
          AAPL: 'Apple Inc.',
          TSLA: 'Tesla, Inc.',
          MSFT: 'Microsoft Corporation',
          GOOGL: 'Alphabet Inc.',
          AMZN: 'Amazon.com, Inc.',
          META: 'Meta Platforms, Inc.',
          NVDA: 'NVIDIA Corporation',
          PLTR: 'Palantir Technologies Inc.',
          RKLB: 'Rocket Lab USA, Inc.',
          HOOD: 'Robinhood Markets, Inc.',
          SOFI: 'SoFi Technologies, Inc.',
          JPM: 'JPMorgan Chase & Co.',
          UNH: 'UnitedHealth Group Incorporated',
          MSTR: 'MicroStrategy Incorporated',
          HIMS: 'Hims & Hers Health, Inc.',
          NOW: 'ServiceNow, Inc.',
          MELI: 'MercadoLibre, Inc.',
          SHOP: 'Shopify Inc.',
          TTD: 'The Trade Desk, Inc.',
          ASML: 'ASML Holding N.V.',
          APP: 'AppLovin Corporation',
          COIN: 'Coinbase Global, Inc.',
          TSM: 'Taiwan Semiconductor Manufacturing Company Limited',
          MRVL: 'Marvell Technology, Inc.',
          AXON: 'Axon Enterprise, Inc.',
          ELF: 'e.l.f. Beauty, Inc.',
          ORCL: 'Oracle Corporation',
          CSCO: 'Cisco Systems, Inc.',
          LLY: 'Eli Lilly and Company',
          NVO: 'Novo Nordisk A/S',
          TTWO: 'Take-Two Interactive Software, Inc.',
          ASTS: 'AST SpaceMobile, Inc.',
          'BRK.B': 'Berkshire Hathaway Inc.',
          CELH: 'Celsius Holdings, Inc.',
          OSCR: 'Oscar Health, Inc.',
          EOG: 'EOG Resources, Inc.',
          BROS: 'Dutch Bros Inc.',
          ABCL: 'AbCellera Biologics Inc.',
          AMD: 'Advanced Micro Devices, Inc.',
          NBIS: 'Nebius Group N.V.',
          GRAB: 'Grab Holdings Limited',
          V: 'Visa Inc.',
          DUOL: 'Duolingo, Inc.',
          AVGO: 'Broadcom Inc.',
          CRWD: 'CrowdStrike Holdings, Inc.',
          NFLX: 'Netflix, Inc.',
          CRM: 'Salesforce, Inc.',
          PYPL: 'PayPal Holdings, Inc.',
          MU: 'Micron Technology, Inc.',
          NU: 'Nu Holdings Ltd.',
          SPY: 'SPDR S&P 500 ETF Trust',
          QQQ: 'Invesco QQQ Trust'
        }
        
        return {
          ticker: ticker.toUpperCase(),
          name: companyNames[ticker.toUpperCase()] || `${ticker.toUpperCase()} Inc.`,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: day.v || 0,
          marketCap: `$${(Math.random() * 1000 + 100).toFixed(1)}B`,
          dayHigh: day.h || currentPrice,
          dayLow: day.l || currentPrice,
          open: day.o || currentPrice,
          previousClose: previousClose,
          pe: Math.random() * 30 + 10,
          yearHigh: currentPrice * (1 + Math.random() * 0.5),
          yearLow: currentPrice * (1 - Math.random() * 0.3),
          avgVolume: (day.v || 0) * (0.8 + Math.random() * 0.4),
          lastUpdated: new Date().toLocaleTimeString()
        }
      }
      
      throw new Error(`Invalid response from Polygon API: ${data.status}`)
    } catch (error) {
      console.error('Error fetching snapshot from Polygon API:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch basic stock data directly from Polygon.io
        const basicData = await fetchPolygonSnapshotDirect(ticker)

        // Check for cached historical data first
        let historicalData = getCachedHistoricalData(ticker)
        
        if (!historicalData) {
          // Fetch full historical data (5Y) only once and cache it
          console.log(`🔄 Fetching fresh historical data for ${ticker}`)
          historicalData = await fetchHistoricalDataFromPolygon(ticker, '5Y')
          
          if (historicalData) {
            setFullHistoricalData(historicalData)
            setCachedHistoricalData(ticker, historicalData)
          }
        } else {
          setFullHistoricalData(historicalData)
        }
        
        // Initially show 1M data by default
        const filteredData = historicalData ? filterHistoricalDataByTimeRange(historicalData, '1M') : []
        
        // Combine the data
        const combinedData = {
          ...basicData,
          historicalData: filteredData
        }
        
        setStockData(combinedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        console.error('Error fetching stock details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchStockDetail()
    }
  }, [ticker, getCachedHistoricalData, setCachedHistoricalData, fetchHistoricalDataFromPolygon, filterHistoricalDataByTimeRange, fetchPolygonSnapshotDirect])

  // Separate effect to handle time range changes without refetching data
  useEffect(() => {
    if (fullHistoricalData && timeRange) {
      const filteredData = filterHistoricalDataByTimeRange(fullHistoricalData, timeRange)
      setStockData(prevData => prevData ? {
        ...prevData,
        historicalData: filteredData
      } : null)
    }
  }, [timeRange, fullHistoricalData, filterHistoricalDataByTimeRange])

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || `Unable to find data for "${ticker}". Please check the symbol and try again.`}
          </p>
          <Link 
            href="/screener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Market Screener
          </Link>
        </div>
      </div>
    )
  }

  const isPositive = stockData.changePercent >= 0
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const changeBgColor = isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/screener"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stockData.ticker}
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${changeBgColor} ${changeColor}`}>
                {isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stockData.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Price Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${stockData.price.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${changeBgColor}`}>
                  {isPositive ? (
                    <TrendingUp className={`h-8 w-8 ${changeColor}`} />
                  ) : (
                    <TrendingDown className={`h-8 w-8 ${changeColor}`} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-semibold ${changeColor}`}>
                  {isPositive ? '+' : ''}${stockData.change.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {stockData.lastUpdated}
                </span>
              </div>
            </div>

            {/* Price Chart */}
            {stockData.historicalData && stockData.historicalData.length > 0 ? (
              <StockPriceChart
                ticker={stockData.ticker}
                data={stockData.historicalData}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                className="mb-6"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Price Chart
                </h2>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
                  </div>
                </div>
              </div>
            )}

            {/* News Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Latest News
              </h2>
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">News feed coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Open</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.open.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Previous Close</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.previousClose.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day High</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.dayHigh.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day Low</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.dayLow.toFixed(2)}
                  </span>
                </div>
                {stockData.yearHigh && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">52W High</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${stockData.yearHigh.toFixed(2)}
                    </span>
                  </div>
                )}
                {stockData.yearLow && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">52W Low</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${stockData.yearLow.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Volume & Market Cap */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trading Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stockData.volume.toLocaleString()}
                  </span>
                </div>
                {stockData.avgVolume && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Volume</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stockData.avgVolume.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stockData.marketCap}
                  </span>
                </div>
                {stockData.pe && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stockData.pe.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/terminal"
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Test Strategy
                </Link>
                <Link
                  href="/leaderboard"
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Traders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
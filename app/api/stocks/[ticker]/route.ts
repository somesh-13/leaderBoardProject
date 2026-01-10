import { NextRequest, NextResponse } from 'next/server'
import { getHistoricalPriceService, type HistoricalDataPoint, type TimeRange } from '@/lib/services/historicalPriceService'

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
  QQQ: 'Invesco QQQ Trust',
  // Crypto Mining & AI Infrastructure
  WULF: 'TeraWulf Inc.',
  CIFR: 'Cipher Mining Inc.',
  CLSK: 'CleanSpark, Inc.',
  CRWV: 'CoreWeave',
  MARA: 'Marathon Digital Holdings, Inc.',
  BITF: 'Bitfarms Ltd.',
  IREN: 'Iris Energy Limited'
}

async function fetchPolygonSnapshot(ticker: string): Promise<StockDetailData | null> {
  const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
  
  if (!API_KEY) {
    console.warn('Polygon API key not found, using mock data')
    return null
  }

  try {
    // First try to get snapshot data
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
    console.log(`📊 Polygon API response for ${ticker}:`, JSON.stringify(data, null, 2))
    
    if (data.status === 'OK' && data.ticker) {
      const ticker_data = data.ticker
      const day = ticker_data.day || {}
      const prevDay = ticker_data.prevDay || {}
      
      // Use day.c if available (market hours), otherwise use prevDay.c (market closed)
      let currentPrice = day.c || 0
      let previousClose = prevDay.c || 0
      
      // If current day close is 0, try to get last trade price
      if (currentPrice === 0 && previousClose > 0) {
        try {
          const lastTradeResponse = await fetch(
            `https://api.polygon.io/v2/last/trade/${ticker}?apikey=${API_KEY}`,
            {
              headers: {
                'User-Agent': 'leaderboard-app/1.0'
              }
            }
          )
          
          if (lastTradeResponse.ok) {
            const lastTradeData = await lastTradeResponse.json()
            if (lastTradeData.status === 'OK' || lastTradeData.status === 'DELAYED') {
              currentPrice = lastTradeData.results?.p || previousClose
              console.log(`💰 Using last trade price for ${ticker}: ${currentPrice}`)
            }
          }
        } catch (lastTradeError) {
          console.warn('Could not fetch last trade price, using previous close:', lastTradeError)
          currentPrice = previousClose
        }
      }
      
      // Final fallback: use previous close if we still don't have a current price
      if (currentPrice === 0 && previousClose > 0) {
        currentPrice = previousClose
        console.log(`📈 Using previous close for ${ticker}: ${currentPrice}`)
      }
      
      const change = currentPrice - previousClose
      const changePercent = previousClose ? (change / previousClose) * 100 : 0
      
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
    
    return null
  } catch (error) {
    console.error('Error fetching from Polygon API:', error)
    return null
  }
}

function generateMockStockData(ticker: string): StockDetailData {
  // Generate realistic mock data
  const basePrice = Math.random() * 500 + 50
  const change = (Math.random() - 0.5) * basePrice * 0.1
  const changePercent = (change / basePrice) * 100
  
  return {
    ticker: ticker.toUpperCase(),
    name: companyNames[ticker.toUpperCase()] || `${ticker.toUpperCase()} Inc.`,
    price: basePrice,
    change: change,
    changePercent: changePercent,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: `$${(Math.random() * 1000 + 100).toFixed(1)}B`,
    dayHigh: basePrice + Math.random() * 10,
    dayLow: basePrice - Math.random() * 10,
    open: basePrice + (Math.random() - 0.5) * 5,
    previousClose: basePrice - change,
    pe: Math.random() * 30 + 10,
    yearHigh: basePrice * (1 + Math.random() * 0.5),
    yearLow: basePrice * (1 - Math.random() * 0.3),
    avgVolume: Math.floor(Math.random() * 5000000) + 2000000,
    lastUpdated: new Date().toLocaleTimeString()
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await context.params
  const ticker = rawTicker.toUpperCase()
  const { searchParams } = new URL(request.url)
  const timeRange = (searchParams.get('timeRange') as TimeRange) || '1M'
  const includeHistory = searchParams.get('includeHistory') !== 'false'
  
  try {
    // Try to fetch real data from Polygon API
    let stockData = await fetchPolygonSnapshot(ticker)
    
    // If real data is not available, use mock data
    if (!stockData) {
      console.log(`Using mock data for ${ticker}`)
      stockData = generateMockStockData(ticker)
    }

    // Fetch historical data if requested
    if (includeHistory) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
        if (apiKey) {
          const historicalService = getHistoricalPriceService()
          const historicalResponse = await historicalService.getHistoricalData(ticker, timeRange)
          stockData.historicalData = historicalResponse.results
          console.log(`✅ Added ${historicalResponse.results.length} historical data points`)
        } else {
          throw new Error('No API key available')
        }
      } catch (historicalError) {
        console.warn(`⚠️ Failed to fetch historical data for ${ticker}, using mock:`, historicalError)
        // Generate mock historical data as fallback
        const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'mock'
        const historicalService = new (await import('@/lib/services/historicalPriceService')).HistoricalPriceService(apiKey)
        const mockHistoricalData = historicalService.generateMockHistoricalData(ticker, timeRange, stockData.price)
        stockData.historicalData = mockHistoricalData.results
        console.log(`📊 Generated ${mockHistoricalData.results.length} mock historical data points`)
      }
    }
    
    return NextResponse.json(stockData)
  } catch (error) {
    console.error('Error in stock detail API:', error)
    
    // Return mock data as fallback
    const mockData = generateMockStockData(ticker)
    
    // Add mock historical data if requested
    if (includeHistory) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'mock'
        const historicalService = new (await import('@/lib/services/historicalPriceService')).HistoricalPriceService(apiKey)
        const mockHistoricalData = historicalService.generateMockHistoricalData(ticker, timeRange, mockData.price)
        mockData.historicalData = mockHistoricalData.results
      } catch {
        // If even mock data fails, just return without historical data
        console.warn(`⚠️ Could not generate mock historical data for ${ticker}`)
      }
    }
    
    return NextResponse.json(mockData)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
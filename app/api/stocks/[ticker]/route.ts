import { NextRequest, NextResponse } from 'next/server'

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
  QQQ: 'Invesco QQQ Trust'
}

async function fetchPolygonSnapshot(ticker: string): Promise<StockDetailData | null> {
  const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
  
  if (!API_KEY) {
    console.warn('Polygon API key not found, using mock data')
    return null
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
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const value = result.value || {}
      const prevDay = result.prevDay || {}
      
      return {
        ticker: ticker.toUpperCase(),
        name: companyNames[ticker.toUpperCase()] || `${ticker.toUpperCase()} Inc.`,
        price: value.c || 0,
        change: value.c - prevDay.c || 0,
        changePercent: ((value.c - prevDay.c) / prevDay.c) * 100 || 0,
        volume: value.v || 0,
        marketCap: `$${(Math.random() * 1000 + 100).toFixed(1)}B`,
        dayHigh: value.h || value.c || 0,
        dayLow: value.l || value.c || 0,
        open: value.o || value.c || 0,
        previousClose: prevDay.c || 0,
        pe: Math.random() * 30 + 10,
        yearHigh: (value.c || 0) * (1 + Math.random() * 0.5),
        yearLow: (value.c || 0) * (1 - Math.random() * 0.3),
        avgVolume: (value.v || 0) * (0.8 + Math.random() * 0.4),
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
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase()
  
  try {
    // Try to fetch real data from Polygon API
    let stockData = await fetchPolygonSnapshot(ticker)
    
    // If real data is not available, use mock data
    if (!stockData) {
      console.log(`Using mock data for ${ticker}`)
      stockData = generateMockStockData(ticker)
    }
    
    return NextResponse.json(stockData)
  } catch (error) {
    console.error('Error in stock detail API:', error)
    
    // Return mock data as fallback
    const mockData = generateMockStockData(ticker)
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
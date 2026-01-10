import { NextResponse } from 'next/server'

interface ScreenerStock {
  name: string
  symbol: string
  sector: string
  type: string
}

const SCREENER_STOCKS: ScreenerStock[] = [
  { name: 'TeraWulf', symbol: 'WULF', sector: 'Crypto Mining', type: 'Stock' },
  { name: 'Cipher Mining', symbol: 'CIFR', sector: 'Crypto Mining', type: 'Stock' },
  { name: 'CleanSpark', symbol: 'CLSK', sector: 'Crypto Mining', type: 'Stock' },
  { name: 'Nebius Group', symbol: 'NBIS', sector: 'AI Infrastructure', type: 'Stock' },
  { name: 'CoreWeave', symbol: 'CRWV', sector: 'AI Infrastructure', type: 'Stock' },
  { name: 'Marathon Digital', symbol: 'MARA', sector: 'Crypto Mining', type: 'Stock' },
  { name: 'Bitfarms', symbol: 'BITF', sector: 'Crypto Mining', type: 'Stock' },
  { name: 'Iris Energy', symbol: 'IREN', sector: 'Crypto Mining', type: 'Stock' },
]

// Helper function to format market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toFixed(0)}`
  }
}

// Fetch ticker details from Polygon
async function fetchTickerDetails(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://api.polygon.io/v3/reference/tickers/${symbol}?apikey=${apiKey}`,
      {
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        },
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      console.warn(`Failed to fetch details for ${symbol}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    return data.results
  } catch (error) {
    console.error(`Error fetching ticker details for ${symbol}:`, error)
    return null
  }
}

// Fetch current price snapshot from Polygon
async function fetchPriceSnapshot(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apikey=${apiKey}`,
      {
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        },
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      console.warn(`Failed to fetch snapshot for ${symbol}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.ticker) {
      const ticker = data.ticker
      const day = ticker.day || {}
      const prevDay = ticker.prevDay || {}
      
      const currentPrice = day.c || prevDay.c || 0
      const previousClose = prevDay.c || 0
      const volume = day.v || 0
      
      const change = currentPrice - previousClose
      const changePercent = previousClose ? (change / previousClose) * 100 : 0
      
      return {
        price: currentPrice,
        change: changePercent,
        volume
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching snapshot for ${symbol}:`, error)
    return null
  }
}

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    console.log('🔄 Fetching screener data for stocks...')
    
    // Fetch data for all stocks in parallel
    const results = await Promise.all(
      SCREENER_STOCKS.map(async (stock) => {
        console.log(`📊 Fetching data for ${stock.symbol}...`)
        
        // Fetch price and details in parallel
        const [priceData, tickerDetails] = await Promise.all([
          fetchPriceSnapshot(stock.symbol, apiKey),
          fetchTickerDetails(stock.symbol, apiKey)
        ])
        
        // Default values
        let price = 0
        let change = 0
        let volume = 0
        let marketCap = 'N/A'
        
        // Get price and volume from snapshot
        if (priceData) {
          price = priceData.price
          change = priceData.change
          volume = priceData.volume
        }
        
        // Get market cap from ticker details
        if (tickerDetails && tickerDetails.market_cap) {
          marketCap = formatMarketCap(tickerDetails.market_cap)
          console.log(`✅ ${stock.symbol}: Price=$${price.toFixed(2)}, Change=${change.toFixed(2)}%, MarketCap=${marketCap}`)
        } else {
          console.warn(`⚠️ No market cap data for ${stock.symbol}`)
        }
        
        return {
          name: stock.name,
          symbol: stock.symbol,
          sector: stock.sector,
          type: stock.type,
          price,
          change,
          changePercent: change,
          volume,
          marketCap
        }
      })
    )
    
    console.log(`✅ Screener data fetched for ${results.length} stocks`)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('❌ Error fetching screener data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screener data' },
      { status: 500 }
    )
  }
}

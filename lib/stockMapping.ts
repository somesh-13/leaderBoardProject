/**
 * Stock Data Mapping Utilities
 * 
 * Maps Polygon Snapshot data to our internal StockData format
 * Handles normalization and provides fallback values
 */

import type { PolygonSnapshot } from './polygon'

// Re-export StockData from our existing types
export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated: number
  volume?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
}

/**
 * Convert Polygon snapshots to our StockData format
 * Skips tickers with errors and normalizes field names
 */
export function snapshotsToStockMap(snapshots: PolygonSnapshot[]): Record<string, StockData> {
  const out: Record<string, StockData> = {}
  
  console.log(`🔄 Mapping ${snapshots.length} Polygon snapshots to StockData format`)

  for (const s of snapshots) {
    // Skip if Polygon flags error on the specific ticker
    if (s.error) {
      console.warn(`⚠️ Skipping ${s.ticker} due to error: ${s.error}`)
      continue
    }

    const symbol = s.ticker?.toUpperCase()
    if (!symbol) {
      console.warn(`⚠️ Skipping snapshot with missing ticker:`, s)
      continue
    }

    // Extract price data from session object with fallbacks
    const session = s.session || {}
    const price = session.price ?? session.close ?? 0
    const change = session.change ?? 0
    const changePercent = session.change_percent ?? 0
    const lastUpdated = session.last_updated ?? Date.now()
    
    // Optional fields for extended data
    const volume = session.volume
    const high = session.high
    const low = session.low  
    const open = session.open
    
    // Calculate previous close if we have current price and change
    const previousClose = price > 0 && change !== 0 ? price - change : undefined

    // Only include if we have valid price data
    if (price > 0) {
      out[symbol] = {
        symbol,
        price,
        change,
        changePercent,
        lastUpdated,
        ...(volume !== undefined && { volume }),
        ...(high !== undefined && { high }),
        ...(low !== undefined && { low }),
        ...(open !== undefined && { open }),
        ...(previousClose !== undefined && { previousClose })
      }
      
      console.log(`✅ Mapped ${symbol}: $${price.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`)
    } else {
      console.warn(`⚠️ Skipping ${symbol} due to invalid price data:`, { price, session })
    }
  }
  
  console.log(`✅ Successfully mapped ${Object.keys(out).length} stocks`)
  return out
}

/**
 * Merge new stock data into existing stock map
 * Preserves existing data for symbols not in the update
 */
export function mergeStockData(
  existing: Record<string, StockData>, 
  incoming: Record<string, StockData>
): Record<string, StockData> {
  const merged = { ...existing, ...incoming }
  
  const updatedCount = Object.keys(incoming).length
  const totalCount = Object.keys(merged).length
  
  console.log(`🔄 Merged stock data: ${updatedCount} updated, ${totalCount} total symbols`)
  
  return merged
}

/**
 * Create a StockData object with fallback values
 * Useful for demo data or when API data is unavailable
 */
export function createFallbackStockData(
  symbol: string, 
  price: number, 
  changePercent: number = 0
): StockData {
  const change = price * (changePercent / 100)
  const previousClose = price - change
  
  return {
    symbol: symbol.toUpperCase(),
    price,
    change,
    changePercent,
    lastUpdated: Date.now(),
    previousClose
  }
}

/**
 * Validate StockData object has required fields
 */
export function isValidStockData(data: any): data is StockData {
  return (
    typeof data === 'object' &&
    typeof data.symbol === 'string' &&
    typeof data.price === 'number' &&
    typeof data.change === 'number' &&
    typeof data.changePercent === 'number' &&
    typeof data.lastUpdated === 'number' &&
    data.price > 0
  )
}

/**
 * Get summary statistics from a stock data map
 * Useful for debugging and monitoring
 */
export function getStockDataSummary(stocks: Record<string, StockData>): {
  count: number
  avgPrice: number
  avgChange: number
  positiveCount: number
  negativeCount: number
  lastUpdated: number
} {
  const values = Object.values(stocks)
  const count = values.length
  
  if (count === 0) {
    return {
      count: 0,
      avgPrice: 0,
      avgChange: 0,
      positiveCount: 0,
      negativeCount: 0,
      lastUpdated: 0
    }
  }
  
  const avgPrice = values.reduce((sum, s) => sum + s.price, 0) / count
  const avgChange = values.reduce((sum, s) => sum + s.changePercent, 0) / count
  const positiveCount = values.filter(s => s.changePercent > 0).length
  const negativeCount = values.filter(s => s.changePercent < 0).length
  const lastUpdated = Math.max(...values.map(s => s.lastUpdated))
  
  return {
    count,
    avgPrice,
    avgChange,
    positiveCount,
    negativeCount,
    lastUpdated
  }
}
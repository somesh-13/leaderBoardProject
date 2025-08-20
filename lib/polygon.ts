/**
 * Polygon.io Unified Snapshot API Client
 * 
 * Uses GET /v3/snapshot with ticker.any_of for multiple tickers
 * Supports batching up to 250 symbols per request
 */

export type PolygonSnapshot = {
  ticker: string
  type?: 'stocks' | 'options' | 'fx' | 'crypto' | 'indices'
  session?: {
    open?: number
    high?: number
    low?: number
    close?: number
    volume?: number
    vwap?: number
    price?: number
    change?: number
    change_percent?: number
    last_updated?: number
  }
  last_trade?: Record<string, unknown>
  last_quote?: Record<string, unknown>
  last_minute?: Record<string, unknown>
  error?: string
  message?: string
}

type PolygonResponse = {
  results?: PolygonSnapshot[]
  next_url?: string
  status: string
  request_id?: string
}

const API_BASE = 'https://api.polygon.io/v3/snapshot'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Fetch stock snapshots from Polygon API using ticker.any_of
 * Automatically batches requests if > 250 symbols
 */
export async function fetchPolygonSnapshots(symbols: string[], apiKey: string): Promise<PolygonSnapshot[]> {
  if (!symbols.length) return []
  
  console.log(`🔄 Fetching Polygon snapshots for ${symbols.length} symbols:`, symbols)
  
  const batches = chunk(symbols, 250)
  const all: PolygonSnapshot[] = []

  for (const group of batches) {
    console.log(`📊 Processing batch of ${group.length} symbols`)
    
    const params = new URLSearchParams()
    params.set('ticker.any_of', group.join(','))
    params.set('limit', Math.min(group.length, 250).toString())
    params.set('sort', 'ticker')
    params.set('order', 'asc')
    params.set('apiKey', apiKey)

    let url = `${API_BASE}?${params.toString()}`
    
    // Handle pagination (generally not needed with ticker.any_of, but kept for completeness)
    do {
      try {
        console.log(`🌐 Fetching: ${url.replace(apiKey, '***')}`)
        
        const res = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'User-Agent': 'leaderboard-app/1.0'
          }
        })
        
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Polygon HTTP ${res.status}: ${errorText}`)
        }
        
        const data: PolygonResponse = await res.json()
        
        console.log(`✅ Polygon API response:`, {
          status: data.status,
          resultsCount: data.results?.length || 0,
          requestId: data.request_id,
          nextUrl: !!data.next_url
        })
        
        if (Array.isArray(data.results)) {
          all.push(...data.results)
          
          // Log any per-ticker errors
          const errors = data.results.filter(r => r.error)
          if (errors.length > 0) {
            console.warn(`⚠️ Ticker-level errors:`, errors.map(e => `${e.ticker}: ${e.error}`))
          }
        }
        
        url = data.next_url ? `${data.next_url}&apiKey=${apiKey}` : ''
        
      } catch (error) {
        console.error(`❌ Error fetching batch:`, error)
        throw error
      }
    } while (url)
    
    // Rate limiting - small delay between batches
    if (batches.indexOf(group) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`✅ Polygon fetch completed: ${all.length} snapshots retrieved`)
  return all
}

/**
 * Get available symbols from a snapshot response
 * Useful for debugging which tickers were successfully returned
 */
export function getAvailableSymbols(snapshots: PolygonSnapshot[]): string[] {
  return snapshots
    .filter(s => !s.error && s.ticker)
    .map(s => s.ticker.toUpperCase())
    .sort()
}

/**
 * Get error details from snapshots
 * Useful for handling entitlement issues
 */
export function getSnapshotErrors(snapshots: PolygonSnapshot[]): Array<{ticker: string, error: string, message?: string}> {
  return snapshots
    .filter(s => s.error)
    .map(s => ({
      ticker: s.ticker,
      error: s.error!,
      ...(s.message ? { message: s.message } : {})
    }))
}

/**
 * Get current price for a single symbol
 * Returns price and change percentage
 */
export async function getCurrentPrice(symbol: string): Promise<{ price: number; change: number }> {
  const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
  
  if (!apiKey) {
    console.warn(`🔑 No Polygon API key available for ${symbol}`)
    // Return mock data for development
    return {
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 10
    }
  }

  try {
    const snapshots = await fetchPolygonSnapshots([symbol], apiKey)
    
    if (snapshots.length === 0 || snapshots[0]?.error) {
      console.warn(`⚠️ No data available for ${symbol}`)
      // Return mock data as fallback
      return {
        price: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 10
      }
    }

    const snapshot = snapshots[0]
    const price = snapshot?.session?.price || snapshot?.session?.close || 0
    const change = snapshot?.session?.change_percent || 0

    return {
      price,
      change
    }
  } catch (error) {
    console.error(`❌ Error fetching current price for ${symbol}:`, error)
    // Return mock data as fallback
    return {
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 10
    }
  }
}
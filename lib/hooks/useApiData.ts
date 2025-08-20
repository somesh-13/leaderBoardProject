/**
 * API Data Hooks
 * 
 * Hooks that fetch data from API endpoints instead of client-side calculations
 */

import { useEffect, useState, useCallback } from 'react'

// Types
interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    username: string
    displayName: string
    primarySector: string
  }
  portfolio: {
    totalValue: number
    invested: number
    totalReturnPct: number
    dayChangePct: number
    dayChangeValue: number
    primarySector: string
    lastUpdated: string
  }
  metrics: {
    pnl: number
    winRate: number
    sharpe: number
    avgReturn: number
    trades: number
    totalValue: number
    totalReturnPct: number
    dayChangePct: number
  }
  period: string
  lastComputed: string
}

interface LeaderboardResponse {
  data: LeaderboardEntry[]
  page: number
  pageSize: number
  total: number
  asOf: string
}

interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

interface PortfolioSnapshot {
  user: {
    id: string
    username: string
    displayName: string
    primarySector: string
  }
  positions: {
    symbol: string
    sector?: string
    shares: number
    avgPrice: number
    currentPrice: number
    currentValue: number
    returnPct: number
    returnValue: number
  }[]
  totalValue: number
  invested: number
  totalReturnPct: number
  dayChangePct: number
  dayChangeValue: number
  primarySector: string
  lastUpdated: string
  tier?: string
  sectorAllocations: {
    sector: string
    value: number
    percentage: number
    color: string
  }[]
}

/**
 * Hook to fetch leaderboard data from API
 */
export function useLeaderboardAPI(params: {
  period?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  q?: string
  sector?: string
} = {}) {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (params.period) searchParams.set('period', params.period)
      if (params.sort) searchParams.set('sort', params.sort)
      if (params.order) searchParams.set('order', params.order)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params.q) searchParams.set('q', params.q)
      if (params.sector) searchParams.set('sector', params.sector)

      const response = await fetch(`/api/leaderboard?${searchParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<LeaderboardResponse> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch leaderboard')
      }

      setData(result.data || null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('❌ Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [params.period, params.sort, params.order, params.page, params.pageSize, params.q, params.sector])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    data,
    loading,
    error,
    refetch: fetchLeaderboard
  }
}

/**
 * Hook to fetch individual user leaderboard entry
 */
export function useUserLeaderboardEntry(username: string) {
  const [data, setData] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserEntry = useCallback(async () => {
    if (!username) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/leaderboard/${encodeURIComponent(username)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<LeaderboardEntry> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user entry')
      }

      setData(result.data || null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`❌ Error fetching user entry for ${username}:`, err)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchUserEntry()
  }, [fetchUserEntry])

  return {
    data,
    loading,
    error,
    refetch: fetchUserEntry
  }
}

/**
 * Hook to fetch portfolio snapshot from API
 */
export function usePortfolioSnapshotAPI(username: string, atDate?: string) {
  const [data, setData] = useState<PortfolioSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSnapshot = useCallback(async () => {
    if (!username) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (atDate) searchParams.set('at', atDate)

      const url = `/api/portfolio/${encodeURIComponent(username)}/snapshot${searchParams.toString() ? `?${searchParams}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Portfolio not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<PortfolioSnapshot> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch portfolio snapshot')
      }

      setData(result.data || null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error(`❌ Error fetching portfolio snapshot for ${username}:`, err)
    } finally {
      setLoading(false)
    }
  }, [username, atDate])

  useEffect(() => {
    fetchSnapshot()
  }, [fetchSnapshot])

  return {
    data,
    loading,
    error,
    refetch: fetchSnapshot
  }
}

/**
 * Hook with auto-refresh functionality
 */
export function useAutoRefreshAPI(
  fetchFn: () => Promise<void>,
  intervalMs: number = 60000
) {
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFn()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [fetchFn, intervalMs])
}
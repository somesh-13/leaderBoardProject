/**
 * Leaderboard API Endpoint
 * 
 * GET /api/leaderboard?period=1D&sort=pnl&order=desc&page=1&pageSize=25&q=&sector=
 * 
 * Implements the full leaderboard specification with portfolio-aware ranking
 * and comprehensive metrics calculation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios';
import { priceService } from '@/lib/services/priceService';
import { 
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardQueryParams,
  DEFAULT_LEADERBOARD_PARAMS,
  Period,
  SortKey,
  User,
  PortfolioSnapshot,
  LeaderboardMetrics,
  Position,
  APIResponse
} from '@/lib/types/leaderboard';

export const dynamic = 'force-dynamic';

// Cache for leaderboard results
const leaderboardCache = new Map<string, { data: LeaderboardResponse; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds TTL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with defaults
    const params: Required<LeaderboardQueryParams> = {
      period: (searchParams.get('period') as Period) || DEFAULT_LEADERBOARD_PARAMS.period,
      sort: (searchParams.get('sort') as SortKey) || DEFAULT_LEADERBOARD_PARAMS.sort,
      order: (searchParams.get('order') as 'desc' | 'asc') || DEFAULT_LEADERBOARD_PARAMS.order,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: Math.min(parseInt(searchParams.get('pageSize') || '25'), 100),
      q: searchParams.get('q') || '',
      sector: searchParams.get('sector') || ''
    };

    // Generate cache key
    const cacheKey = `${params.period}|${params.sort}|${params.order}|${params.page}|${params.pageSize}|${params.q}|${params.sector}`;
    
    // Check cache first
    const cached = leaderboardCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Serving cached leaderboard for key: ${cacheKey}`);
      return NextResponse.json({
        success: true,
        data: cached.data,
        timestamp: new Date().toISOString()
      } as APIResponse<LeaderboardResponse>);
    }

    console.log(`🔄 Computing leaderboard for period: ${params.period}, sort: ${params.sort}`);

    // Get all portfolio snapshots
    const entries: LeaderboardEntry[] = [];
    const usernames = Object.keys(INITIAL_PORTFOLIOS);

    for (const username of usernames) {
      try {
        const entry = await computeLeaderboardEntry(username, params.period);
        if (entry) {
          entries.push(entry);
        }
      } catch (error) {
        console.error(`❌ Failed to compute entry for ${username}:`, error);
      }
    }

    // Apply filters
    let filteredEntries = entries;

    if (params.q) {
      const query = params.q.toLowerCase();
      filteredEntries = filteredEntries.filter(entry => 
        entry.user.username.toLowerCase().includes(query) ||
        entry.user.displayName.toLowerCase().includes(query)
      );
    }

    if (params.sector) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.portfolio.primarySector.toLowerCase() === params.sector.toLowerCase()
      );
    }

    // Sort entries
    filteredEntries.sort((a, b) => {
      const aVal = getMetricValue(a, params.sort);
      const bVal = getMetricValue(b, params.sort);
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return params.order === 'desc' ? -comparison : comparison;
    });

    // Assign ranks
    filteredEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Apply pagination
    const startIndex = (params.page - 1) * params.pageSize;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + params.pageSize);

    const response: LeaderboardResponse = {
      data: paginatedEntries,
      page: params.page,
      pageSize: params.pageSize,
      total: filteredEntries.length,
      asOf: new Date().toISOString()
    };

    // Cache the result
    leaderboardCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    // Clean up old cache entries (simple cleanup)
    if (leaderboardCache.size > 100) {
      const oldestKey = leaderboardCache.keys().next().value;
      if (oldestKey !== undefined) {
        leaderboardCache.delete(oldestKey);
      }
    }

    console.log(`✅ Computed leaderboard with ${response.data.length} entries`);

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    } as APIResponse<LeaderboardResponse>);

  } catch (error) {
    console.error('❌ Leaderboard API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as APIResponse<never>, { status: 500 });
  }
}

/**
 * Compute a complete leaderboard entry for a user
 */
async function computeLeaderboardEntry(username: string, period: Period): Promise<LeaderboardEntry | null> {
  const portfolioData = INITIAL_PORTFOLIOS[username];
  if (!portfolioData) {
    return null;
  }

  console.log(`📊 Computing entry for ${username} (period: ${period})`);

  try {
    // Get current prices for all positions
    const symbols = portfolioData.positions.map(pos => pos.symbol);
    const pricesMap = await priceService.getBatchCurrentPrices(symbols);

    // Calculate positions with real-time data
    const positions: Position[] = await Promise.all(
      portfolioData.positions.map(async (pos) => {
        const priceData = pricesMap.get(pos.symbol.toUpperCase());
        const currentPrice = priceData?.price || pos.avgPrice;
        
        const currentValue = pos.shares * currentPrice;
        const investedValue = pos.shares * pos.avgPrice;
        const returnValue = currentValue - investedValue;
        const returnPct = investedValue > 0 ? (returnValue / investedValue) * 100 : 0;

        return {
          symbol: pos.symbol,
          sector: pos.sector,
          shares: pos.shares,
          avgPrice: pos.avgPrice,
          currentPrice,
          currentValue,
          returnPct,
          returnValue
        };
      })
    );

    // Calculate portfolio metrics
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const invested = 10000; // All users started with $10,000
    const totalReturnPct = invested > 0 ? ((totalValue - invested) / invested) * 100 : 0;

    // Calculate day change
    let totalDayChangeValue = 0;
    let totalPriorCloseValue = 0;
    
    for (const pos of positions) {
      const dayChange = await priceService.calculateDayChange(pos.symbol, pos.shares);
      totalDayChangeValue += dayChange.dayChangeValue;
      totalPriorCloseValue += dayChange.priorClosePrice * pos.shares;
    }
    
    const dayChangePct = totalPriorCloseValue > 0 ? (totalDayChangeValue / totalPriorCloseValue) * 100 : 0;

    // Calculate primary sector
    const sectorMap = new Map<string, number>();
    positions.forEach(pos => {
      const sector = pos.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + pos.currentValue);
    });
    
    const primarySector = Array.from(sectorMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Technology';

    // Create user object
    const user: User = {
      id: portfolioData.userId,
      username: portfolioData.username,
      displayName: portfolioData.username,
      primarySector
    };

    // Create portfolio snapshot
    const portfolio: Pick<PortfolioSnapshot, 
      'totalValue' | 'invested' | 'totalReturnPct' | 'dayChangePct' | 'dayChangeValue' | 'primarySector' | 'lastUpdated'
    > = {
      totalValue,
      invested,
      totalReturnPct,
      dayChangePct,
      dayChangeValue: totalDayChangeValue,
      primarySector,
      lastUpdated: new Date().toISOString()
    };

    // Calculate advanced metrics based on period
    const metrics = await calculateMetrics(positions, totalValue, invested, totalReturnPct, dayChangePct);

    const entry: LeaderboardEntry = {
      rank: 0, // Will be set during sorting
      user,
      portfolio,
      metrics,
      period,
      lastComputed: new Date().toISOString()
    };

    console.log(`✅ Computed entry for ${username}: $${totalValue.toFixed(2)} (${totalReturnPct.toFixed(2)}%)`);
    return entry;

  } catch (error) {
    console.error(`❌ Error computing entry for ${username}:`, error);
    return null;
  }
}

/**
 * Calculate comprehensive metrics for leaderboard
 */
async function calculateMetrics(
  positions: Position[],
  totalValue: number,
  invested: number,
  totalReturnPct: number,
  dayChangePct: number
): Promise<LeaderboardMetrics> {
  
  // Basic metrics
  const pnl = totalValue - invested;
  
  // Mock advanced metrics (in a real implementation, these would be calculated from trade history)
  const winRate = Math.random() * 100; // Mock: 0-100%
  const trades = Math.floor(Math.random() * 50) + 10; // Mock: 10-60 trades
  const avgReturn = (Math.random() - 0.3) * 20; // Mock: -6% to +14%
  
  // Simple Sharpe calculation (mock)
  // In reality, this would use daily return series
  const volatility = Math.random() * 30 + 10; // Mock: 10-40% annualized
  const riskFreeRate = 4.5; // 4.5% risk-free rate
  const excessReturn = totalReturnPct - riskFreeRate;
  const sharpe = volatility > 0 ? excessReturn / volatility : 0;

  return {
    pnl,
    winRate,
    sharpe,
    avgReturn,
    trades,
    totalValue,
    totalReturnPct,
    dayChangePct
  };
}

/**
 * Extract the metric value for sorting
 */
function getMetricValue(entry: LeaderboardEntry, sortKey: SortKey): number {
  switch (sortKey) {
    case 'pnl':
      return entry.metrics.pnl;
    case 'winRate':
      return entry.metrics.winRate;
    case 'sharpe':
      return entry.metrics.sharpe;
    case 'avgReturn':
      return entry.metrics.avgReturn;
    case 'trades':
      return entry.metrics.trades;
    case 'totalValue':
      return entry.portfolio.totalValue;
    case 'totalReturnPct':
      return entry.portfolio.totalReturnPct;
    case 'dayChangePct':
      return entry.portfolio.dayChangePct;
    default:
      return entry.metrics.pnl;
  }
}
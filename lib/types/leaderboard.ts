/**
 * Unified Data Model for Portfolio-Aware Leaderboard
 * 
 * This file implements the types specified in the Leaderboard Integration Dev Doc
 * to ensure consistency between profile pages and leaderboard display.
 */

export type Period = '1D' | '1W' | '1M' | 'ALL';

export type SortKey = 
  | 'pnl' 
  | 'winRate' 
  | 'sharpe' 
  | 'avgReturn' 
  | 'trades' 
  | 'totalValue' 
  | 'totalReturnPct' 
  | 'dayChangePct';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  primarySector?: string;
}

export interface PortfolioSnapshot {
  totalValue: number;
  invested: number;
  totalReturnPct: number;
  dayChangePct: number;
  dayChangeValue: number;
  primarySector: string;
  lastUpdated: string; // ISO string
}

export interface Position {
  symbol: string;
  sector?: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  returnPct: number; // (currentPrice - avgPrice) / avgPrice
  returnValue: number; // (currentPrice - avgPrice) * shares
}

export interface LeaderboardMetrics {
  pnl: number; // totalValue - invested over period window
  winRate: number; // wins/(wins+losses) from closed trades in period
  sharpe: number; // based on daily portfolio returns
  avgReturn: number; // average trade return or portfolio daily return
  trades: number; // count of executed trades in period
  totalValue: number; // mirrored for sorting/display parity
  totalReturnPct: number; // parity with profile card
  dayChangePct: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  portfolio: Pick<PortfolioSnapshot, 
    'totalValue' | 
    'invested' | 
    'totalReturnPct' | 
    'dayChangePct' | 
    'dayChangeValue' | 
    'primarySector' | 
    'lastUpdated'
  >;
  metrics: LeaderboardMetrics;
  period: Period;
  lastComputed: string; // ISO string
}

// API Request/Response Types
export interface LeaderboardQueryParams {
  period?: Period;
  sort?: SortKey;
  order?: 'desc' | 'asc';
  page?: number;
  pageSize?: number;
  q?: string; // username/prefix search
  sector?: string; // filter by primarySector
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  page: number;
  pageSize: number;
  total: number;
  asOf: string; // ISO string
}

export interface PortfolioSnapshotParams {
  at?: string; // YYYY-MM-DD format
}

// Price Data Types for Polygon Integration
export interface PriceBar {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CachedPrice {
  symbol: string;
  date: string; // YYYY-MM-DD
  price: number;
  timestamp: number;
  source: 'polygon' | 'cache' | 'fallback';
}

// Trade Data Types (for future implementation)
export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  executedAt: string; // ISO string
  realizedPnL?: number; // for SELL trades
}

// Utility Types
export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPct: number;
  dayChange: number;
  dayChangePct: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

// Color coding for UI consistency
export type ReturnColorScheme = 'positive' | 'negative' | 'neutral';

export interface FormattedMetric {
  value: string;
  colorScheme: ReturnColorScheme;
  prefix?: string;
  suffix?: string;
}

// Error types for API responses
export interface APIError {
  success: false;
  error: string;
  code?: string;
  timestamp: string;
}

export interface APISuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type APIResponse<T> = APISuccess<T> | APIError;

// Cache configuration
export interface CacheConfig {
  ttl: {
    prices: number; // milliseconds
    snapshots: number;
    leaderboard: number;
  };
  maxEntries: {
    prices: number;
    snapshots: number;
    leaderboard: number;
  };
}

// Default values
export const DEFAULT_LEADERBOARD_PARAMS: Required<LeaderboardQueryParams> = {
  period: '1D',
  sort: 'pnl',
  order: 'desc',
  page: 1,
  pageSize: 25,
  q: '',
  sector: ''
};

export const PERIODS: Record<Period, { label: string; days: number }> = {
  '1D': { label: '1 Day', days: 1 },
  '1W': { label: '1 Week', days: 7 },
  '1M': { label: '1 Month', days: 30 },
  'ALL': { label: 'All Time', days: Infinity }
};

export const SORT_OPTIONS: Record<SortKey, { label: string; format: 'currency' | 'percentage' | 'number' }> = {
  pnl: { label: 'P&L', format: 'currency' },
  winRate: { label: 'Win Rate', format: 'percentage' },
  sharpe: { label: 'Sharpe Ratio', format: 'number' },
  avgReturn: { label: 'Avg Return', format: 'percentage' },
  trades: { label: 'Trades', format: 'number' },
  totalValue: { label: 'Total Value', format: 'currency' },
  totalReturnPct: { label: 'Total Return', format: 'percentage' },
  dayChangePct: { label: 'Day Change', format: 'percentage' }
};
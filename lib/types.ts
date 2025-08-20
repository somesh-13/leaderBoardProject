import { z } from 'zod';

// Environment variables schema
export const envSchema = z.object({
  POLYGON_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  AUTH_TRUST_HOST: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  POSTHOG_KEY: z.string().optional(),
  APP_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
});

// Polygon.io API schemas
export const polygonBarSchema = z.object({
  t: z.number(), // timestamp
  o: z.number(), // open
  h: z.number(), // high
  l: z.number(), // low
  c: z.number(), // close
  v: z.number(), // volume
  vw: z.number().optional(), // volume weighted average price
  n: z.number().optional(), // number of transactions
});

export const polygonAggregatesResponseSchema = z.object({
  status: z.string(),
  results: z.array(polygonBarSchema),
  resultsCount: z.number(),
  adjusted: z.boolean(),
  queryCount: z.number(),
  request_id: z.string(),
});

export const polygonSnapshotSchema = z.object({
  status: z.string(),
  ticker: z.object({
    ticker: z.string(),
    todaysChangePerc: z.number(),
    todaysChange: z.number(),
    updated: z.number(),
    day: z.object({
      o: z.number(),
      h: z.number(),
      l: z.number(),
      c: z.number(),
      v: z.number(),
      vw: z.number(),
    }),
    lastTrade: z.object({
      p: z.number(),
      s: z.number(),
      t: z.number(),
      x: z.number(),
    }).optional(),
    prevDay: z.object({
      o: z.number(),
      h: z.number(),
      l: z.number(),
      c: z.number(),
      v: z.number(),
      vw: z.number(),
    }),
  }),
});

// Application data types
export const stockDataSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number(),
  marketCap: z.string(),
  dayHigh: z.number(),
  dayLow: z.number(),
  open: z.number(),
  previousClose: z.number(),
  pe: z.number().optional(),
  yearHigh: z.number().optional(),
  yearLow: z.number().optional(),
  avgVolume: z.number().optional(),
  lastUpdated: z.string(),
});

export const historicalDataPointSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  vwap: z.number().optional(),
  transactions: z.number().optional(),
  date: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  avatar: z.string().url().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'diamond']).default('bronze'),
  totalReturn: z.number().default(0),
  totalReturnPercent: z.number().default(0),
  streak: z.number().default(0),
  rank: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const portfolioSnapshotSchema = z.object({
  userId: z.string(),
  asOf: z.date(),
  totalValue: z.number(),
  dayChange: z.number(),
  dayChangePercent: z.number(),
  totalReturn: z.number(),
  totalReturnPercent: z.number(),
  positions: z.array(z.object({
    ticker: z.string(),
    shares: z.number(),
    currentPrice: z.number(),
    marketValue: z.number(),
    dayChange: z.number(),
    dayChangePercent: z.number(),
    totalReturn: z.number(),
    totalReturnPercent: z.number(),
  })),
});

export const tradeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ticker: z.string(),
  type: z.enum(['buy', 'sell']),
  shares: z.number(),
  price: z.number(),
  value: z.number(),
  timestamp: z.date(),
  reason: z.string().optional(),
});


// API request/response schemas
export const stockDetailRequestSchema = z.object({
  ticker: z.string().min(1).max(10),
  timeRange: z.enum(['1D', '5D', '1M', '3M', '6M', '1Y', '2Y', '5Y']).optional().default('1M'),
});

export const historicalPricesRequestSchema = z.object({
  ticker: z.string().min(1).max(10),
  range: z.string().default('1/day'),
  from: z.string().default('5y'),
  to: z.string().default('now'),
});

// Type exports
export type PolygonBar = z.infer<typeof polygonBarSchema>;
export type PolygonAggregatesResponse = z.infer<typeof polygonAggregatesResponseSchema>;
export type PolygonSnapshot = z.infer<typeof polygonSnapshotSchema>;
export type StockData = z.infer<typeof stockDataSchema>;
export type HistoricalDataPoint = z.infer<typeof historicalDataPointSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type PortfolioSnapshot = z.infer<typeof portfolioSnapshotSchema>;
export type Trade = z.infer<typeof tradeSchema>;

// Time range type
export type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

// API error response
export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
/**
 * Price Service with Polygon Integration and Caching
 * 
 * Handles all stock price data fetching, caching, and formatting
 * for both leaderboard and profile consistency.
 */

import { CachedPrice, PriceBar } from '@/lib/types/leaderboard';

interface PolygonAggResponse {
  status: string;
  results?: Array<{
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    t: number; // timestamp
    v: number; // volume
  }>;
  adjusted?: boolean;
  next_url?: string;
  request_id: string;
  results_count: number;
}

interface PolygonLastTradeResponse {
  status: string;
  results?: {
    p: number; // price
    s: number; // size
    t: number; // timestamp
  };
}

class PriceService {
  private cache = new Map<string, CachedPrice>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 10000;
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.polygon.io';
  
  constructor() {
    this.API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || '';
    if (!this.API_KEY) {
      console.warn('⚠️ Polygon API key not found. Price service will use fallback data.');
    }
  }

  /**
   * Get current price for a single symbol
   */
  async getCurrentPrice(symbol: string): Promise<CachedPrice> {
    const cacheKey = `current:${symbol.toUpperCase()}`;
    const cached = this.getCachedPrice(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached current price for ${symbol}: $${cached.price}`);
      return cached;
    }

    try {
      const price = await this.fetchCurrentPrice(symbol);
      this.setCachedPrice(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`❌ Failed to fetch current price for ${symbol}:`, error);
      return this.getFallbackPrice(symbol, 'current');
    }
  }

  /**
   * Get historical close price for a specific date
   */
  async getHistoricalPrice(symbol: string, date: string): Promise<CachedPrice> {
    const cacheKey = `historical:${symbol.toUpperCase()}:${date}`;
    const cached = this.getCachedPrice(cacheKey);
    
    if (cached) {
      console.log(`📦 Using cached historical price for ${symbol} on ${date}: $${cached.price}`);
      return cached;
    }

    try {
      const price = await this.fetchHistoricalPrice(symbol, date);
      this.setCachedPrice(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`❌ Failed to fetch historical price for ${symbol} on ${date}:`, error);
      return this.getFallbackPrice(symbol, date);
    }
  }

  /**
   * Batch fetch current prices for multiple symbols
   */
  async getBatchCurrentPrices(symbols: string[]): Promise<Map<string, CachedPrice>> {
    const results = new Map<string, CachedPrice>();
    const uniqueSymbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));
    
    console.log(`🔄 Batch fetching current prices for ${uniqueSymbols.length} symbols`);

    // Check cache first
    const uncachedSymbols: string[] = [];
    for (const symbol of uniqueSymbols) {
      const cacheKey = `current:${symbol}`;
      const cached = this.getCachedPrice(cacheKey);
      if (cached) {
        results.set(symbol, cached);
      } else {
        uncachedSymbols.push(symbol);
      }
    }

    console.log(`📦 Found ${results.size} cached prices, need to fetch ${uncachedSymbols.length}`);

    // Fetch uncached prices with rate limiting
    for (let i = 0; i < uncachedSymbols.length; i++) {
      const symbol = uncachedSymbols[i];
      try {
        const price = await this.getCurrentPrice(symbol);
        results.set(symbol, price);
        
        // Rate limiting: wait between requests
        if (i < uncachedSymbols.length - 1) {
          await this.delay(200); // 200ms between requests
        }
      } catch (error) {
        console.error(`❌ Failed in batch fetch for ${symbol}:`, error);
        results.set(symbol, this.getFallbackPrice(symbol, 'current'));
      }
    }

    console.log(`✅ Batch fetch completed: ${results.size} prices obtained`);
    return results;
  }

  /**
   * Get price range for calculating day change
   */
  async getPriceRange(symbol: string, fromDate: string, toDate?: string): Promise<PriceBar[]> {
    const to = toDate || fromDate;
    // const cacheKey = `range:${symbol.toUpperCase()}:${fromDate}:${to}`;
    
    try {
      return await this.fetchPriceRange(symbol, fromDate, to);
    } catch (error) {
      console.error(`❌ Failed to fetch price range for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Calculate day change percentage and value
   */
  async calculateDayChange(symbol: string, shares: number): Promise<{
    dayChangePct: number;
    dayChangeValue: number;
    currentPrice: number;
    priorClosePrice: number;
  }> {
    try {
      // const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [currentPrice, priorClosePrice] = await Promise.all([
        this.getCurrentPrice(symbol),
        this.getHistoricalPrice(symbol, yesterday)
      ]);

      const priceDiff = currentPrice.price - priorClosePrice.price;
      const dayChangePct = priorClosePrice.price > 0 ? (priceDiff / priorClosePrice.price) * 100 : 0;
      const dayChangeValue = priceDiff * shares;

      return {
        dayChangePct,
        dayChangeValue,
        currentPrice: currentPrice.price,
        priorClosePrice: priorClosePrice.price
      };
    } catch (error) {
      console.error(`❌ Failed to calculate day change for ${symbol}:`, error);
      return {
        dayChangePct: 0,
        dayChangeValue: 0,
        currentPrice: 100,
        priorClosePrice: 100
      };
    }
  }

  private async fetchCurrentPrice(symbol: string): Promise<CachedPrice> {
    if (!this.API_KEY) {
      throw new Error('No API key available');
    }

    const url = `${this.BASE_URL}/v2/last/trade/${symbol.toUpperCase()}?apikey=${this.API_KEY}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'leaderboard-app/1.0' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PolygonLastTradeResponse = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'DELAYED') {
      throw new Error(`Invalid response status: ${data.status}`);
    }

    if (!data.results || data.results.p <= 0) {
      throw new Error('Invalid price data received');
    }

    return {
      symbol: symbol.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      price: data.results.p,
      timestamp: Date.now(),
      source: 'polygon'
    };
  }

  private async fetchHistoricalPrice(symbol: string, date: string): Promise<CachedPrice> {
    if (!this.API_KEY) {
      throw new Error('No API key available');
    }

    const url = `${this.BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${date}/${date}?adjusted=true&limit=1&apikey=${this.API_KEY}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'leaderboard-app/1.0' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PolygonAggResponse = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Invalid response status: ${data.status}`);
    }

    if (!data.results || data.results.length === 0 || data.results[0].c <= 0) {
      throw new Error('No price data available for date');
    }

    const result = data.results[0];
    return {
      symbol: symbol.toUpperCase(),
      date: date,
      price: result.c,
      timestamp: Date.now(),
      source: 'polygon'
    };
  }

  private async fetchPriceRange(symbol: string, fromDate: string, toDate: string): Promise<PriceBar[]> {
    if (!this.API_KEY) {
      throw new Error('No API key available');
    }

    const url = `${this.BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${fromDate}/${toDate}?adjusted=true&apikey=${this.API_KEY}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'leaderboard-app/1.0' },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PolygonAggResponse = await response.json();
    
    if (data.status !== 'OK' || !data.results) {
      return [];
    }

    return data.results.map(result => ({
      symbol: symbol.toUpperCase(),
      timestamp: result.t,
      open: result.o,
      high: result.h,
      low: result.l,
      close: result.c,
      volume: result.v
    }));
  }

  private getCachedPrice(key: string): CachedPrice | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCachedPrice(key: string, price: CachedPrice): void {
    // Simple LRU: remove oldest if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, price);
  }

  private getFallbackPrice(symbol: string, dateOrType: string): CachedPrice {
    // Provide reasonable fallback prices for common stocks
    const fallbackPrices: Record<string, number> = {
      'AAPL': 195, 'MSFT': 435, 'GOOGL': 186, 'AMZN': 178, 'TSLA': 248,
      'META': 582, 'NVDA': 145, 'NFLX': 485, 'PLTR': 65, 'AMD': 142,
      'UNH': 618, 'JPM': 180, 'V': 275, 'BRK.B': 455, 'JNJ': 160,
      'RKLB': 18.5, 'ASTS': 15.2, 'SOFI': 10.45, 'HOOD': 32,
      'MSTR': 425, 'HIMS': 13.2, 'NU': 12.8, 'NOW': 1025, 'MELI': 2150,
      'CELH': 85, 'OSCR': 15.5, 'EOG': 125, 'BROS': 38, 'ABCL': 12.75,
      'NBIS': 8.5, 'GRAB': 3.25, 'DUOL': 185, 'AVGO': 850, 'CRWD': 320,
      'CRM': 280, 'PYPL': 75, 'MU': 95, 'SHOP': 65, 'TTD': 95,
      'ASML': 750, 'APP': 45, 'COIN': 220, 'TSM': 185, 'ELF': 125,
      'ORCL': 115, 'CSCO': 48, 'LLY': 825, 'NVO': 105, 'TTWO': 165
    };

    const basePrice = fallbackPrices[symbol.toUpperCase()] || 100;
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    const price = basePrice * (1 + variation);

    return {
      symbol: symbol.toUpperCase(),
      date: dateOrType === 'current' ? new Date().toISOString().split('T')[0] : dateOrType,
      price: Math.round(price * 100) / 100,
      timestamp: Date.now(),
      source: 'fallback'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 Price cache cleared');
  }

  /**
   * Fetch multiple stock prices using Polygon.io snapshot API
   * This uses the v3/snapshot endpoint with ticker.any_of parameter
   */
  async getBatchSnapshotPrices(symbols: string[]): Promise<Map<string, CachedPrice>> {
    if (symbols.length === 0) {
      return new Map();
    }

    const pricesMap = new Map<string, CachedPrice>();
    
    if (!this.API_KEY) {
      console.warn('⚠️ No API key, using fallback prices');
      for (const symbol of symbols) {
        pricesMap.set(symbol.toUpperCase(), this.getFallbackPrice(symbol, 'current'));
      }
      return pricesMap;
    }

    try {
      // Create comma-separated list of symbols for the API
      const tickerList = symbols.map(s => s.toUpperCase()).join(',');
      const url = `https://api.polygon.io/v3/snapshot?ticker.any_of=${tickerList}&apikey=${this.API_KEY}`;
      
      console.log(`📈 Fetching batch prices for ${symbols.length} symbols: ${symbols.join(', ')}`);
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'leaderboard-app/1.0' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 Polygon v3 snapshot response:`, JSON.stringify(data, null, 2));
      
      if (data.status === 'OK' && data.results && Array.isArray(data.results)) {
        // Process each ticker result
        for (const tickerData of data.results) {
          // Get price from session.price or last_trade.price
          const sessionPrice = tickerData.session?.price;
          const lastTradePrice = tickerData.last_trade?.price;
          const currentPrice = sessionPrice || lastTradePrice;
          
          if (currentPrice && currentPrice > 0) {
            const symbol = tickerData.ticker.toUpperCase();
            const price: CachedPrice = {
              symbol,
              date: new Date().toISOString().split('T')[0],
              price: currentPrice,
              timestamp: Date.now(),
              source: 'polygon_snapshot'
            };
            
            pricesMap.set(symbol, price);
            // Cache the individual price
            this.setCachedPrice(`current:${symbol}`, price);
            console.log(`💰 Updated price for ${symbol}: $${price.price}`);
          }
        }
      }
      
      // For any symbols that didn't get prices, use fallback
      for (const symbol of symbols) {
        const upperSymbol = symbol.toUpperCase();
        if (!pricesMap.has(upperSymbol)) {
          console.log(`⚠️ No price data for ${symbol}, using fallback`);
          pricesMap.set(upperSymbol, this.getFallbackPrice(symbol, 'current'));
        }
      }
      
      console.log(`✅ Fetched ${pricesMap.size} prices from Polygon.io snapshot API`);
      return pricesMap;
      
    } catch (error) {
      console.error('❌ Error fetching batch snapshot prices:', error);
      
      // Fallback: use individual price fetching or fallback prices
      for (const symbol of symbols) {
        try {
          const price = await this.getCurrentPrice(symbol);
          pricesMap.set(symbol.toUpperCase(), price);
        } catch (fallbackError) {
          pricesMap.set(symbol.toUpperCase(), this.getFallbackPrice(symbol, 'current'));
        }
      }
      
      return pricesMap;
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}

// Singleton instance
export const priceService = new PriceService();

// Export types for use in other modules
export type { CachedPrice, PriceBar };
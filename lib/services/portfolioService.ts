/**
 * Portfolio Service - MongoDB Integration
 * 
 * Handles fetching and managing portfolio data from MongoDB
 */

import { getDatabase } from '@/lib/db';
import { Portfolio, Position } from '@/lib/types/portfolio';
import { priceService } from './priceService';

export interface MongoPortfolio {
  _id?: string;
  userId: string;
  username: string;
  positions: Position[];
  totalInvested: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioWithMetrics extends Portfolio {
  sectorAllocations?: {
    sector: string;
    value: number;
    percentage: number;
  }[];
}

class PortfolioService {
  private readonly COLLECTION_NAME = 'portfolios';

  /**
   * Get portfolio collection from MongoDB
   */
  private getCollection() {
    return getDatabase().collection<MongoPortfolio>(this.COLLECTION_NAME);
  }

  /**
   * Fetch portfolio data for a specific user from MongoDB
   */
  async getPortfolioByUsername(username: string): Promise<Portfolio | null> {
    try {
      const collection = this.getCollection();
      const portfolioData = await collection.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') }
      });

      if (!portfolioData) {
        console.log(`❌ Portfolio not found for user: ${username}`);
        return null;
      }

      console.log(`📊 Found portfolio for ${username} with ${portfolioData.positions.length} positions`);

      // Calculate current portfolio metrics with real-time prices
      const calculatedPortfolio = await this.calculatePortfolioMetrics(portfolioData);
      return calculatedPortfolio;

    } catch (error) {
      console.error(`❌ Error fetching portfolio for ${username}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all portfolios from MongoDB
   */
  async getAllPortfolios(): Promise<Portfolio[]> {
    try {
      const collection = this.getCollection();
      const portfolios = await collection.find({}).toArray();

      console.log(`📊 Found ${portfolios.length} portfolios in database`);

      // Calculate metrics for all portfolios
      const calculatedPortfolios = await Promise.all(
        portfolios.map(portfolio => this.calculatePortfolioMetrics(portfolio))
      );

      return calculatedPortfolios.filter(p => p !== null) as Portfolio[];

    } catch (error) {
      console.error(`❌ Error fetching all portfolios:`, error);
      throw error;
    }
  }

  /**
   * Create or update a portfolio in MongoDB
   */
  async savePortfolio(portfolio: Omit<MongoPortfolio, '_id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const collection = this.getCollection();
      const now = new Date();

      const result = await collection.updateOne(
        { userId: portfolio.userId },
        {
          $set: {
            ...portfolio,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );

      console.log(`✅ Portfolio saved for ${portfolio.username}: ${result.upsertedCount ? 'created' : 'updated'}`);
      return true;

    } catch (error) {
      console.error(`❌ Error saving portfolio for ${portfolio.username}:`, error);
      return false;
    }
  }

  /**
   * Calculate portfolio metrics with real-time stock prices
   */
  private async calculatePortfolioMetrics(portfolioData: MongoPortfolio): Promise<Portfolio | null> {
    try {
      // Get current prices for all positions
      const symbols = portfolioData.positions.map(pos => pos.symbol);
      const pricesMap = await priceService.getBatchCurrentPrices(symbols);

      console.log(`💰 Fetched prices for ${pricesMap.size} symbols for ${portfolioData.username}`);

      // Calculate position values and metrics
      let totalCurrentValue = 0;
      let totalDayChangeValue = 0;
      let totalPriorCloseValue = 0;

      const updatedPositions: Position[] = [];

      for (const position of portfolioData.positions) {
        const priceData = pricesMap.get(position.symbol.toUpperCase());
        const currentPrice = priceData?.price || position.avgPrice; // Fallback to avg price

        const currentValue = position.shares * currentPrice;
        const investedValue = position.shares * position.avgPrice;

        totalCurrentValue += currentValue;

        // Calculate day change for this position
        const dayChange = await priceService.calculateDayChange(position.symbol, position.shares);
        totalDayChangeValue += dayChange.dayChangeValue;
        totalPriorCloseValue += dayChange.priorClosePrice * position.shares;

        updatedPositions.push({
          ...position,
          // Add any additional calculated fields if needed
        });
      }

      // Calculate portfolio-level metrics
      const totalReturn = totalCurrentValue - portfolioData.totalInvested;
      const totalReturnPercent = portfolioData.totalInvested > 0 
        ? (totalReturn / portfolioData.totalInvested) * 100 
        : 0;

      const dayChangePercent = totalPriorCloseValue > 0 
        ? (totalDayChangeValue / totalPriorCloseValue) * 100 
        : 0;

      // Calculate tier based on return percentage
      const tier = this.calculateTier(totalReturnPercent);

      // Determine primary sector and stock
      const sectorCounts = updatedPositions.reduce((acc, pos) => {
        const sector = pos.sector || 'Technology';
        acc[sector] = (acc[sector] || 0) + (pos.shares * (pricesMap.get(pos.symbol.toUpperCase())?.price || pos.avgPrice));
        return acc;
      }, {} as Record<string, number>);

      const primarySector = Object.entries(sectorCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Technology';

      const primaryStock = updatedPositions
        .sort((a, b) => {
          const valueA = a.shares * (pricesMap.get(a.symbol.toUpperCase())?.price || a.avgPrice);
          const valueB = b.shares * (pricesMap.get(b.symbol.toUpperCase())?.price || b.avgPrice);
          return valueB - valueA;
        })[0]?.symbol || '';

      const portfolio: Portfolio = {
        userId: portfolioData.userId,
        username: portfolioData.username,
        positions: updatedPositions,
        totalValue: totalCurrentValue,
        totalInvested: portfolioData.totalInvested,
        totalReturn,
        totalReturnPercent,
        dayChange: totalDayChangeValue,
        dayChangePercent,
        tier,
        sector: primarySector,
        primaryStock,
        lastCalculated: Date.now()
      };

      console.log(`✅ Calculated portfolio for ${portfolioData.username}: $${totalCurrentValue.toFixed(2)} (${totalReturnPercent.toFixed(2)}%)`);

      return portfolio;

    } catch (error) {
      console.error(`❌ Error calculating portfolio metrics for ${portfolioData.username}:`, error);
      return null;
    }
  }

  /**
   * Calculate tier based on return percentage
   */
  private calculateTier(returnPercent: number): 'S' | 'A' | 'B' | 'C' {
    if (returnPercent >= 200) return 'S';
    if (returnPercent >= 100) return 'A';  
    if (returnPercent >= 50) return 'B';
    return 'C';
  }

  /**
   * Get portfolio with sector allocations
   */
  async getPortfolioWithAllocations(username: string): Promise<PortfolioWithMetrics | null> {
    try {
      const portfolio = await this.getPortfolioByUsername(username);
      if (!portfolio) return null;

      // Calculate sector allocations
      const sectorMap = new Map<string, number>();
      
      // Get current prices for allocation calculation
      const symbols = portfolio.positions.map(pos => pos.symbol);
      const pricesMap = await priceService.getBatchCurrentPrices(symbols);

      portfolio.positions.forEach(pos => {
        const sector = pos.sector || 'Other';
        const currentPrice = pricesMap.get(pos.symbol.toUpperCase())?.price || pos.avgPrice;
        const value = pos.shares * currentPrice;
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
      });

      const sectorAllocations = Array.from(sectorMap.entries())
        .map(([sector, value]) => ({
          sector,
          value,
          percentage: portfolio.totalValue > 0 ? (value / portfolio.totalValue) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);

      return {
        ...portfolio,
        sectorAllocations
      };

    } catch (error) {
      console.error(`❌ Error getting portfolio with allocations for ${username}:`, error);
      return null;
    }
  }

  /**
   * Initialize sample portfolios in MongoDB (for testing/demo)
   */
  async initializeSamplePortfolios(): Promise<void> {
    try {
      const collection = this.getCollection();
      
      // Check if portfolios already exist
      const existingCount = await collection.countDocuments();
      if (existingCount > 0) {
        console.log(`📊 Found ${existingCount} existing portfolios, skipping initialization`);
        return;
      }

      const samplePortfolios: Omit<MongoPortfolio, '_id' | 'createdAt' | 'updatedAt'>[] = [
        {
          userId: 'matt',
          username: 'Matt',
          totalInvested: 10000,
          positions: [
            { symbol: 'RKLB', shares: 37, avgPrice: 26.55, sector: 'Aerospace' },
            { symbol: 'AMZN', shares: 4, avgPrice: 216.10, sector: 'Technology' },
            { symbol: 'SOFI', shares: 67, avgPrice: 14.90, sector: 'Financial' },
            { symbol: 'ASTS', shares: 23, avgPrice: 41.91, sector: 'Aerospace' },
            { symbol: 'BRK.B', shares: 2, avgPrice: 490.23, sector: 'Financial' }
          ]
        },
        {
          userId: 'amit',
          username: 'Amit',
          totalInvested: 10000,
          positions: [
            { symbol: 'PLTR', shares: 7, avgPrice: 141.41, sector: 'Technology' },
            { symbol: 'HOOD', shares: 13, avgPrice: 76.75, sector: 'Financial' },
            { symbol: 'TSLA', shares: 3, avgPrice: 329.13, sector: 'Automotive' },
            { symbol: 'AMD', shares: 7, avgPrice: 126.39, sector: 'Technology' },
            { symbol: 'JPM', shares: 3, avgPrice: 270.36, sector: 'Financial' }
          ]
        }
        // Add more sample portfolios as needed
      ];

      for (const portfolio of samplePortfolios) {
        await this.savePortfolio(portfolio);
      }

      console.log(`✅ Initialized ${samplePortfolios.length} sample portfolios in MongoDB`);

    } catch (error) {
      console.error(`❌ Error initializing sample portfolios:`, error);
      throw error;
    }
  }
}

export const portfolioService = new PortfolioService();
/**
 * Seed Portfolio Data Script
 * 
 * Populates MongoDB with sample portfolio data for testing
 */

// Load environment variables first
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

import { portfolioService } from '../lib/services/portfolioService';
import client from '../lib/db';

// Sample portfolio data based on the static INITIAL_PORTFOLIOS
const samplePortfolios = [
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
  },
  {
    userId: 'steve',
    username: 'Steve',
    totalInvested: 10000,
    positions: [
      { symbol: 'META', shares: 1, avgPrice: 702.12, sector: 'Technology' },
      { symbol: 'MSTR', shares: 2, avgPrice: 382.25, sector: 'Technology' },
      { symbol: 'MSFT', shares: 2, avgPrice: 479.14, sector: 'Technology' },
      { symbol: 'HIMS', shares: 16, avgPrice: 59.78, sector: 'Healthcare' },
      { symbol: 'AVGO', shares: 3, avgPrice: 252.10, sector: 'Technology' }
    ]
  },
  {
    userId: 'tannor',
    username: 'Tannor', 
    totalInvested: 10000,
    positions: [
      { symbol: 'NVDA', shares: 6, avgPrice: 144.69, sector: 'Technology' },
      { symbol: 'NU', shares: 80, avgPrice: 12.39, sector: 'Financial' },
      { symbol: 'SHOP', shares: 9, avgPrice: 108.37, sector: 'Technology' },
      { symbol: 'TTD', shares: 14, avgPrice: 70.25, sector: 'Technology' },
      { symbol: 'COIN', shares: 3, avgPrice: 261.57, sector: 'Financial' }
    ]
  },
  {
    userId: 'kris',
    username: 'Kris',
    totalInvested: 10000,
    positions: [
      { symbol: 'UNH', shares: 3, avgPrice: 307.66, sector: 'Healthcare' },
      { symbol: 'GOOGL', shares: 5, avgPrice: 176.77, sector: 'Technology' },
      { symbol: 'MRVL', shares: 14, avgPrice: 70.42, sector: 'Technology' },
      { symbol: 'AXON', shares: 1, avgPrice: 780.61, sector: 'Technology' },
      { symbol: 'ELF', shares: 7, avgPrice: 126.21, sector: 'Consumer' }
    ]
  }
];

async function seedPortfolioData() {
  console.log('🌱 Starting Portfolio Data Seeding...\n');

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingPortfolios = await portfolioService.getAllPortfolios();
    if (existingPortfolios.length > 0) {
      console.log(`📊 Found ${existingPortfolios.length} existing portfolios.`);
      console.log('❓ Do you want to continue? This will add sample portfolios alongside existing ones.');
      
      // In a real scenario, you might want to prompt the user
      // For now, we'll continue with seeding
    }

    // Seed portfolios
    let successCount = 0;
    let failureCount = 0;

    for (const portfolioData of samplePortfolios) {
      try {
        const success = await portfolioService.savePortfolio(portfolioData);
        if (success) {
          console.log(`✅ Seeded portfolio for ${portfolioData.username}`);
          successCount++;
        } else {
          console.log(`❌ Failed to seed portfolio for ${portfolioData.username}`);
          failureCount++;
        }
      } catch (error) {
        console.error(`❌ Error seeding portfolio for ${portfolioData.username}:`, error);
        failureCount++;
      }
    }

    console.log(`\n📈 Seeding Summary:`);
    console.log(`   ✅ Success: ${successCount} portfolios`);
    console.log(`   ❌ Failed: ${failureCount} portfolios`);

    // Verify seeded data
    console.log(`\n🔍 Verification:`);
    const allPortfolios = await portfolioService.getAllPortfolios();
    console.log(`   📊 Total portfolios in database: ${allPortfolios.length}`);
    
    allPortfolios.forEach(portfolio => {
      console.log(`     - ${portfolio.username}: $${portfolio.totalValue.toLocaleString()} (${portfolio.totalReturnPercent.toFixed(2)}%)`);
    });

    console.log('\n🎉 Portfolio data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPortfolioData().then(() => {
    console.log('✨ Seeding process completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  });
}

export default seedPortfolioData;
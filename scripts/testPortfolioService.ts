/**
 * Test Portfolio Service - MongoDB Integration
 * 
 * Script to test portfolio data fetching from MongoDB
 */

// Load environment variables first
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

import { portfolioService } from '../lib/services/portfolioService';
import client from '../lib/db';

async function testPortfolioService() {
  console.log('🧪 Starting Portfolio Service Tests...\n');

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Test 1: Initialize sample portfolios
    console.log('\n📊 Test 1: Initialize sample portfolios');
    await portfolioService.initializeSamplePortfolios();

    // Test 2: Fetch all portfolios
    console.log('\n📊 Test 2: Fetch all portfolios');
    const allPortfolios = await portfolioService.getAllPortfolios();
    console.log(`Found ${allPortfolios.length} portfolios:`);
    allPortfolios.forEach(p => {
      console.log(`  - ${p.username}: $${p.totalValue.toFixed(2)} (${p.totalReturnPercent.toFixed(2)}%)`);
    });

    // Test 3: Fetch specific user portfolio
    console.log('\n📊 Test 3: Fetch portfolio for Matt');
    const mattPortfolio = await portfolioService.getPortfolioByUsername('Matt');
    if (mattPortfolio) {
      console.log(`✅ Matt's Portfolio:
        Total Value: $${mattPortfolio.totalValue.toFixed(2)}
        Total Invested: $${mattPortfolio.totalInvested.toFixed(2)}
        Total Return: ${mattPortfolio.totalReturnPercent.toFixed(2)}%
        Day Change: ${mattPortfolio.dayChangePercent.toFixed(2)}%
        Tier: ${mattPortfolio.tier}
        Primary Sector: ${mattPortfolio.sector}
        Primary Stock: ${mattPortfolio.primaryStock}
        Positions: ${mattPortfolio.positions.length}`);
        
      mattPortfolio.positions.forEach(pos => {
        console.log(`    ${pos.symbol}: ${pos.shares} shares @ $${pos.avgPrice} (${pos.sector})`);
      });
    } else {
      console.log('❌ Portfolio not found for Matt');
    }

    // Test 4: Fetch portfolio with allocations
    console.log('\n📊 Test 4: Fetch portfolio with sector allocations');
    const portfolioWithAllocations = await portfolioService.getPortfolioWithAllocations('Matt');
    if (portfolioWithAllocations?.sectorAllocations) {
      console.log('Sector Allocations:');
      portfolioWithAllocations.sectorAllocations.forEach(allocation => {
        console.log(`  ${allocation.sector}: $${allocation.value.toFixed(2)} (${allocation.percentage.toFixed(1)}%)`);
      });
    }

    // Test 5: Test non-existent user
    console.log('\n📊 Test 5: Test non-existent user');
    const nonExistentPortfolio = await portfolioService.getPortfolioByUsername('NonExistentUser');
    if (!nonExistentPortfolio) {
      console.log('✅ Correctly handled non-existent user');
    } else {
      console.log('❌ Should have returned null for non-existent user');
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPortfolioService().then(() => {
    console.log('🎉 Test execution completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

export default testPortfolioService;
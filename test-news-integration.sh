#!/bin/bash

# Quick Start Guide - News Tab Integration Test
# This script helps you verify the news integration is working correctly

echo "=========================================="
echo "   News Tab Integration - Quick Test"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file found"
    
    # Check for Polygon API key
    if grep -q "NEXT_PUBLIC_POLYGON_API_KEY=" .env.local && ! grep -q "NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key_here" .env.local; then
        echo "✅ Polygon.io API key is configured"
        echo "   → News will use Polygon.io API"
    else
        echo "⚠️  Polygon.io API key not configured"
    fi
    
    # Check for News API key
    if grep -q "NEWS_API_KEY=" .env.local && ! grep -q "NEWS_API_KEY=your_news_api_key_here" .env.local; then
        echo "✅ NewsAPI.org API key is configured (optional)"
    else
        echo "ℹ️  NewsAPI.org key not configured (optional - will use Polygon.io)"
    fi
else
    echo "❌ .env.local file not found"
    echo ""
    echo "📝 To set up:"
    echo "   1. Copy the example file:"
    echo "      cp .env.local.example .env.local"
    echo ""
    echo "   2. Edit .env.local and add your Polygon.io API key"
    echo "      Get it from: https://polygon.io/pricing"
    echo ""
    echo "   3. Run this script again"
    exit 1
fi

echo ""
echo "=========================================="
echo "   Testing the Implementation"
echo "=========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting development server..."
echo ""
echo "📋 Test Steps:"
echo "   1. Wait for server to start"
echo "   2. Open http://localhost:3000"
echo "   3. Navigate to any stock page (e.g., /stocks/AAPL)"
echo "   4. Click on the 'Latest News' tab"
echo "   5. Verify news articles are displayed"
echo ""
echo "✨ Features to test:"
echo "   • News articles load correctly"
echo "   • Article images display (when available)"
echo "   • Timestamps show relative time"
echo "   • Clicking articles opens in new tab"
echo "   • Error handling (try invalid ticker)"
echo "   • Dark mode works properly"
echo ""
echo "Starting server now..."
echo ""

# Start the development server
npm run dev

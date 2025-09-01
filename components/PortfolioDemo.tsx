/**
 * Portfolio Demo Component
 * 
 * Demonstrates how to fetch and display portfolio data from MongoDB
 */

'use client';

import React, { useState } from 'react';
import { usePortfolio, useAllPortfolios, useCreatePortfolio } from '@/lib/hooks/usePortfolio';

export default function PortfolioDemo() {
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch all portfolios
  const { portfolios, isLoading: allLoading, error: allError, refetch: refetchAll } = useAllPortfolios();
  
  // Fetch specific portfolio
  const { portfolio, isLoading: portfolioLoading, error: portfolioError, refetch } = usePortfolio(selectedUsername || null);
  
  // Create portfolio hook
  const { createPortfolio, isCreating, error: createError } = useCreatePortfolio();

  const handleCreatePortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const portfolioData = {
      userId: formData.get('userId') as string,
      username: formData.get('username') as string,
      totalInvested: parseFloat(formData.get('totalInvested') as string || '10000'),
      positions: [
        {
          symbol: formData.get('symbol') as string,
          shares: parseInt(formData.get('shares') as string || '0'),
          avgPrice: parseFloat(formData.get('avgPrice') as string || '0'),
          sector: formData.get('sector') as string || 'Technology'
        }
      ]
    };

    const result = await createPortfolio(portfolioData);
    if (result) {
      setShowCreateForm(false);
      refetchAll();
      alert('Portfolio created successfully!');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Portfolio Data from MongoDB</h1>

      {/* All Portfolios Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">All Portfolios</h2>
          <div className="space-x-2">
            <button
              onClick={() => refetchAll()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={allLoading}
            >
              {allLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {showCreateForm ? 'Cancel' : 'Create Portfolio'}
            </button>
          </div>
        </div>

        {allError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {allError}
          </div>
        )}

        {allLoading ? (
          <div className="text-gray-600">Loading all portfolios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.userId}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedUsername(portfolio.username)}
              >
                <h3 className="font-semibold text-lg">{portfolio.username}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Total Value: ${portfolio.totalValue.toLocaleString()}</div>
                  <div>Return: {portfolio.totalReturnPercent.toFixed(2)}%</div>
                  <div>Day Change: {portfolio.dayChangePercent.toFixed(2)}%</div>
                  <div>Tier: <span className={`font-semibold ${getTierColor(portfolio.tier)}`}>{portfolio.tier}</span></div>
                  <div>Primary Sector: {portfolio.sector}</div>
                  <div>Positions: {portfolio.positions.length}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {portfolios.length === 0 && !allLoading && (
          <div className="text-gray-600 text-center py-8">
            No portfolios found. Create one using the form below.
          </div>
        )}
      </div>

      {/* Create Portfolio Form */}
      {showCreateForm && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Create New Portfolio</h3>
          <form onSubmit={handleCreatePortfolio} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  name="userId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Invested
                </label>
                <input
                  type="number"
                  name="totalInvested"
                  defaultValue={10000}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  name="symbol"
                  placeholder="e.g., AAPL"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shares
                </label>
                <input
                  type="number"
                  name="shares"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Price
                </label>
                <input
                  type="number"
                  name="avgPrice"
                  step="0.01"
                  required
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <select
                  name="sector"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial">Financial</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Energy">Energy</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Automotive">Automotive</option>
                </select>
              </div>
            </div>
            
            {createError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Error: {createError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Portfolio'}
            </button>
          </form>
        </div>
      )}

      {/* Selected Portfolio Details */}
      {selectedUsername && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Portfolio Details: {selectedUsername}</h2>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={portfolioLoading}
            >
              {portfolioLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {portfolioError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {portfolioError}
            </div>
          )}

          {portfolioLoading ? (
            <div className="text-gray-600">Loading portfolio details...</div>
          ) : portfolio ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${portfolio.totalValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {portfolio.totalReturnPercent.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">Total Return</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${portfolio.dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.dayChangePercent.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">Day Change</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getTierColor(portfolio.tier)}`}>
                    {portfolio.tier}
                  </div>
                  <div className="text-sm text-gray-600">Tier</div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">Positions ({portfolio.positions.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Symbol</th>
                        <th className="text-left py-2">Shares</th>
                        <th className="text-left py-2">Avg Price</th>
                        <th className="text-left py-2">Sector</th>
                        <th className="text-right py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((position) => (
                        <tr key={position.symbol} className="border-b">
                          <td className="py-2 font-medium">{position.symbol}</td>
                          <td className="py-2">{position.shares.toLocaleString()}</td>
                          <td className="py-2">${position.avgPrice.toFixed(2)}</td>
                          <td className="py-2">{position.sector}</td>
                          <td className="py-2 text-right">${(position.shares * position.avgPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last calculated: {new Date(portfolio.lastCalculated).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Portfolio not found for {selectedUsername}</div>
          )}
        </div>
      )}
    </div>
  );
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'S': return 'text-purple-600';
    case 'A': return 'text-green-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-gray-600';
    default: return 'text-gray-600';
  }
}
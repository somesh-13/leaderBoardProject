/**
 * Portfolio React Hooks
 * 
 * Custom hooks for fetching and managing portfolio data from MongoDB
 */

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Portfolio } from '@/lib/types/portfolio';
import { APIResponse } from '@/lib/types/leaderboard';

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: APIResponse<any> = await response.json();
  
  // Validate response structure
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  if (!data.data) {
    throw new Error('No data received from API');
  }
  
  return data.data;
};

/**
 * Hook to fetch a specific user's portfolio from MongoDB
 */
export function usePortfolio(username: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Portfolio>(
    username ? `/api/portfolio?username=${encodeURIComponent(username)}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    portfolio: data,
    isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

/**
 * Hook to fetch all portfolios from MongoDB
 */
export function useAllPortfolios() {
  const { data, error, isLoading, mutate } = useSWR<Portfolio[]>(
    '/api/portfolio',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    portfolios: data || [],
    isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

/**
 * Hook to create or update a portfolio
 */
export function useCreatePortfolio() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPortfolio = async (portfolioData: {
    userId: string;
    username: string;
    positions: Array<{
      symbol: string;
      shares: number;
      avgPrice: number;
      sector?: string;
      datePurchased?: string;
    }>;
    totalInvested: number;
  }): Promise<Portfolio | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      });

      const data: APIResponse<Portfolio> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create portfolio');
      }

      return data.data || null;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating portfolio:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPortfolio,
    isCreating,
    error
  };
}

/**
 * Hook to fetch portfolio data with real-time updates
 */
export function usePortfolioRealtime(username: string | null, intervalMs: number = 30000) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = async () => {
    if (!username) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio?username=${encodeURIComponent(username)}`);
      const data: APIResponse<Portfolio> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch portfolio');
      }

      setPortfolio(data.data || null);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!username) return;

    // Initial fetch
    fetchPortfolio();

    // Set up interval for real-time updates
    const interval = setInterval(fetchPortfolio, intervalMs);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, intervalMs]);



  return {
    portfolio,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchPortfolio
  };
}

/**
 * Hook for portfolio statistics and metrics
 */
export function usePortfolioStats(portfolios: Portfolio[]) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalValue: 0,
    averageReturn: 0,
    topPerformer: null as Portfolio | null,
    bottomPerformer: null as Portfolio | null,
    sectorDistribution: {} as Record<string, number>
  });

  useEffect(() => {
    if (!portfolios || portfolios.length === 0) {
      setStats({
        totalUsers: 0,
        totalValue: 0,
        averageReturn: 0,
        topPerformer: null,
        bottomPerformer: null,
        sectorDistribution: {}
      });
      return;
    }

    const totalUsers = portfolios.length;
    const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
    const averageReturn = portfolios.reduce((sum, p) => sum + p.totalReturnPercent, 0) / totalUsers;
    
    const sortedByReturn = [...portfolios].sort((a, b) => b.totalReturnPercent - a.totalReturnPercent);
    const topPerformer = sortedByReturn[0] || null;
    const bottomPerformer = sortedByReturn[sortedByReturn.length - 1] || null;

    const sectorDistribution = portfolios.reduce((acc, portfolio) => {
      const sector = portfolio.sector || 'Other';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalUsers,
      totalValue,
      averageReturn,
      topPerformer,
      bottomPerformer,
      sectorDistribution
    });

  }, [portfolios]);

  return stats;
}
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { getCurrentPrice } from '@/lib/polygon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PortfolioPerformanceChartProps {
  user: {
    username: string;
    portfolio: string[];
    totalReturn: number;
  };
  className?: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type ViewMode = 'value' | 'return';

interface ChartDataPoint {
  date: string;
  value: number;
  returnPct: number;
}

export default function PortfolioPerformanceChart({ user, className = "" }: PortfolioPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [viewMode, setViewMode] = useState<ViewMode>('value');
  const [customStartDate, setCustomStartDate] = useState('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState(0);
  const [totalReturnPct, setTotalReturnPct] = useState(0);
  const [totalReturnDollar, setTotalReturnDollar] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [initialPortfolioValue, setInitialPortfolioValue] = useState(0);

  // Calculate date range based on selected time period
  const getDateRange = useCallback((range: TimeRange, customDate?: string) => {
    const endDate = new Date();
    let startDate = new Date();

    if (customDate) {
      startDate = new Date(customDate);
    } else {
      switch (range) {
        case '1D':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '1W':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'ALL':
          startDate.setFullYear(endDate.getFullYear() - 5); // Default to 5 years
          break;
      }
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, []);

  // Fetch and calculate portfolio performance data
  const fetchPortfolioData = useCallback(async () => {
    if (!user.portfolio || user.portfolio.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { startDate, endDate } = getDateRange(timeRange, customStartDate);

      // Fetch current prices
      const currentPricesData = await Promise.all(
        user.portfolio.map(async (symbol) => {
          const { price } = await getCurrentPrice(symbol);
          return { symbol, price };
        })
      );

      // Mock historical prices for now - use current prices as baseline
      const historicalPrices: Record<string, number> = {};
      currentPricesData.forEach(item => {
        // Simulate historical price being 90-110% of current price
        historicalPrices[item.symbol] = item.price * (0.9 + Math.random() * 0.2);
      });

      // Fetch dividends for the period (for future enhancement)
      // const dividends = await getMultipleDividends(user.portfolio, startDate, endDate);

      // Calculate portfolio metrics
      let totalCurrentValue = 0;
      let totalHistoricalValue = 0;

      user.portfolio.forEach((symbol) => {
        const currentData = currentPricesData.find(item => item.symbol === symbol);
        const currentPrice = currentData?.price || 0;
        const historicalPrice = historicalPrices[symbol] || currentPrice;

        // Assume $1000 investment per stock for equal weighting
        const investment = 1000;
        const shares = investment / historicalPrice;
        const currentValue = shares * currentPrice;
        
        totalCurrentValue += currentValue;
        totalHistoricalValue += investment;
      });

      // Calculate overall returns
      const portfolioPL = totalCurrentValue - totalHistoricalValue;
      const portfolioReturnPct = totalHistoricalValue > 0 ? (portfolioPL / totalHistoricalValue) * 100 : 0;
      
      setCurrentPortfolioValue(totalCurrentValue);
      setTotalReturnPct(portfolioReturnPct);
      setTotalReturnDollar(portfolioPL);
      setInitialPortfolioValue(totalHistoricalValue);

      // Generate more realistic chart data points for smoother interaction
      const chartPoints: ChartDataPoint[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const pointCount = Math.min(Math.max(daysDiff, 10), 50); // Between 10-50 points

      for (let i = 0; i <= pointCount; i++) {
        const progress = i / pointCount;
        const pointDate = new Date(start.getTime() + (end.getTime() - start.getTime()) * progress);
        
        // Simulate gradual portfolio growth with some volatility
        const baseProgress = progress;
        const volatility = Math.sin(progress * Math.PI * 4) * 0.05; // ±5% volatility
        const adjustedProgress = Math.max(0, baseProgress + volatility);
        
        const pointValue = totalHistoricalValue + (portfolioPL * adjustedProgress);
        const pointReturnPct = totalHistoricalValue > 0 ? ((pointValue - totalHistoricalValue) / totalHistoricalValue) * 100 : 0;
        
        chartPoints.push({
          date: pointDate.toISOString().split('T')[0],
          value: pointValue,
          returnPct: pointReturnPct
        });
      }

      setChartData(chartPoints);

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user.portfolio, timeRange, customStartDate, getDateRange]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Prepare chart data for Chart.js
  const chartJsData = useMemo(() => {
    const labels = chartData.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString();
    });

    const dataValues = chartData.map(point => 
      viewMode === 'value' ? point.value : point.returnPct
    );

    const isPositive = totalReturnPct >= 0;

    return {
      labels,
      datasets: [
        {
          label: viewMode === 'value' ? 'Portfolio Value' : 'Return %',
          data: dataValues,
          borderColor: isPositive ? '#10b981' : '#ef4444',
          backgroundColor: isPositive 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: (ctx: { dataIndex: number }) => {
            // Show dot only on hover
            return hoveredIndex === ctx.dataIndex ? 8 : 0;
          },
          pointBackgroundColor: isPositive ? '#10b981' : '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          borderWidth: 2,
        },
      ],
    };
  }, [chartData, viewMode, totalReturnPct, hoveredIndex]);

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0) {
        const dataIndex = elements[0].index;
        setHoveredIndex(dataIndex);
      } else {
        setHoveredIndex(null);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context: { dataIndex: number }[]) => {
            const dataIndex = context[0].dataIndex;
            const point = chartData[dataIndex];
            if (point) {
              return new Date(point.date).toLocaleDateString();
            }
            return '';
          },
          label: (context: { parsed: { y: number | null } }) => {
            const value = context.parsed.y;
            if (value === null) return '';
            if (viewMode === 'value') {
              return `Portfolio Value: $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
              return `Return: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
            }
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numValue)) return value;
            
            if (viewMode === 'value') {
              return '$' + numValue.toLocaleString();
            } else {
              return numValue.toFixed(1) + '%';
            }
          }
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  }), [viewMode, chartData]);

  // Calculate display values based on hover state
  const displayValues = useMemo(() => {
    if (hoveredIndex !== null && chartData[hoveredIndex]) {
      const hoveredPoint = chartData[hoveredIndex];
      const hoveredValue = hoveredPoint.value;
      const hoveredReturnDollar = hoveredValue - initialPortfolioValue;
      const hoveredReturnPct = initialPortfolioValue > 0 ? ((hoveredValue - initialPortfolioValue) / initialPortfolioValue) * 100 : 0;
      
      return {
        portfolioValue: hoveredValue,
        returnDollar: hoveredReturnDollar,
        returnPct: hoveredReturnPct,
        date: hoveredPoint.date
      };
    }
    
    // Default to current values when not hovering
    return {
      portfolioValue: currentPortfolioValue,
      returnDollar: totalReturnDollar,
      returnPct: totalReturnPct,
      date: getDateRange(timeRange, customStartDate).endDate
    };
  }, [hoveredIndex, chartData, initialPortfolioValue, currentPortfolioValue, totalReturnDollar, totalReturnPct, timeRange, customStartDate, getDateRange]);

  const timeRangeButtons: { label: string; value: TimeRange }[] = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: 'ALL', value: 'ALL' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 ${className}`}>
      {/* Portfolio Summary - Updates dynamically on hover */}
      <div className="mb-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-200">
            ${displayValues.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold transition-all duration-200 ${displayValues.returnPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {displayValues.returnPct >= 0 ? '+' : ''}${Math.abs(displayValues.returnDollar).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-lg font-semibold transition-all duration-200 ${displayValues.returnPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ({displayValues.returnPct >= 0 ? '+' : ''}{displayValues.returnPct.toFixed(2)}%)
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hoveredIndex !== null ? (
            <>Portfolio value on {new Date(displayValues.date).toLocaleDateString()}</>
          ) : (
            <>Portfolio performance since {getDateRange(timeRange, customStartDate).startDate}</>
          )}
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('value')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'value'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Portfolio Value
        </button>
        <button
          onClick={() => setViewMode('return')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            viewMode === 'return'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Return %
        </button>
      </div>

      {/* Chart */}
      <div 
        className="h-64 mb-6"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Line data={chartJsData} options={chartOptions} />
        )}
      </div>

      {/* Time Range Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {timeRangeButtons.map((button) => (
          <button
            key={button.value}
            onClick={() => {
              setTimeRange(button.value);
              setCustomStartDate('');
            }}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              timeRange === button.value && !customStartDate
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {button.label}
          </button>
        ))}
        
        {/* Custom Date Picker */}
        <div className="flex items-center gap-2 ml-4">
          <label htmlFor="customDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom:
          </label>
          <input
            id="customDate"
            type="date"
            value={customStartDate}
            onChange={(e) => {
              setCustomStartDate(e.target.value);
              setTimeRange('ALL'); // Reset time range when custom date is selected
            }}
            max={new Date().toISOString().split('T')[0]}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
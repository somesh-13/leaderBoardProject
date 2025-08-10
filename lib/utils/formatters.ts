/**
 * Formatting Utilities for Portfolio Display Consistency
 * 
 * Ensures identical number formatting between profile pages and leaderboard
 * as specified in the dev doc requirements.
 */

import { FormattedMetric, ReturnColorScheme } from '@/lib/types/leaderboard';

/**
 * Format currency values consistently
 */
export function formatCurrency(
  value: number,
  options: {
    showSign?: boolean;
    compact?: boolean;
    precision?: number;
  } = {}
): FormattedMetric {
  const { showSign = false, compact = false, precision = 2 } = options;
  
  let formattedValue: string;
  let colorScheme: ReturnColorScheme;
  
  // Determine color scheme
  if (value > 0) {
    colorScheme = 'positive';
  } else if (value < 0) {
    colorScheme = 'negative';
  } else {
    colorScheme = 'neutral';
  }
  
  // Format value
  if (compact && Math.abs(value) >= 1000000) {
    formattedValue = `${(value / 1000000).toFixed(1)}M`;
  } else if (compact && Math.abs(value) >= 1000) {
    formattedValue = `${(value / 1000).toFixed(1)}K`;
  } else {
    formattedValue = value.toFixed(precision);
  }
  
  // Add commas for large numbers (if not compact)
  if (!compact && Math.abs(value) >= 1000) {
    formattedValue = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }
  
  return {
    value: formattedValue,
    colorScheme,
    prefix: showSign && value > 0 ? '+' : showSign && value < 0 ? '' : '$',
    suffix: ''
  };
}

/**
 * Format percentage values consistently
 */
export function formatPercentage(
  value: number,
  options: {
    showSign?: boolean;
    precision?: number;
    showPositiveSign?: boolean;
  } = {}
): FormattedMetric {
  const { showSign = true, precision = 2, showPositiveSign = true } = options;
  
  let colorScheme: ReturnColorScheme;
  
  // Determine color scheme
  if (value > 0) {
    colorScheme = 'positive';
  } else if (value < 0) {
    colorScheme = 'negative';
  } else {
    colorScheme = 'neutral';
  }
  
  const formattedValue = Math.abs(value).toFixed(precision);
  let prefix = '';
  
  if (showSign) {
    if (value > 0 && showPositiveSign) {
      prefix = '+';
    } else if (value < 0) {
      prefix = '-';
    }
  }
  
  return {
    value: formattedValue,
    colorScheme,
    prefix,
    suffix: '%'
  };
}

/**
 * Format number values consistently
 */
export function formatNumber(
  value: number,
  options: {
    precision?: number;
    compact?: boolean;
    showSign?: boolean;
  } = {}
): FormattedMetric {
  const { precision = 2, compact = false, showSign = false } = options;
  
  let formattedValue: string;
  let colorScheme: ReturnColorScheme = 'neutral';
  
  // Format value
  if (compact && Math.abs(value) >= 1000000) {
    formattedValue = `${(value / 1000000).toFixed(1)}M`;
  } else if (compact && Math.abs(value) >= 1000) {
    formattedValue = `${(value / 1000).toFixed(1)}K`;
  } else {
    formattedValue = value.toFixed(precision);
  }
  
  // Add commas for large numbers (if not compact)
  if (!compact && Math.abs(value) >= 1000) {
    formattedValue = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }
  
  let prefix = '';
  if (showSign && value > 0) {
    prefix = '+';
  }
  
  return {
    value: formattedValue,
    colorScheme,
    prefix,
    suffix: ''
  };
}

/**
 * Get Tailwind CSS classes for return color schemes
 */
export function getReturnColorClasses(colorScheme: ReturnColorScheme): {
  text: string;
  background?: string;
  border?: string;
} {
  switch (colorScheme) {
    case 'positive':
      return {
        text: 'text-green-600 dark:text-green-400',
        background: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800'
      };
    case 'negative':
      return {
        text: 'text-red-600 dark:text-red-400',
        background: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800'
      };
    case 'neutral':
    default:
      return {
        text: 'text-gray-600 dark:text-gray-400',
        background: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800'
      };
  }
}

/**
 * Format total return to match profile card display
 * Example: "+212.00%" for positive returns
 */
export function formatTotalReturn(value: number): FormattedMetric {
  return formatPercentage(value, {
    showSign: true,
    precision: 2,
    showPositiveSign: true
  });
}

/**
 * Format day change to match profile card display
 * Example: "+0.50%" and "$156.75"
 */
export function formatDayChange(percentValue: number, dollarValue: number): {
  percent: FormattedMetric;
  dollar: FormattedMetric;
} {
  return {
    percent: formatPercentage(percentValue, {
      showSign: true,
      precision: 2,
      showPositiveSign: true
    }),
    dollar: formatCurrency(dollarValue, {
      showSign: true,
      precision: 2
    })
  };
}

/**
 * Format total value to match profile card display
 * Example: "$31,200.00"
 */
export function formatTotalValue(value: number): FormattedMetric {
  return formatCurrency(value, {
    showSign: false,
    precision: 2
  });
}

/**
 * Format P&L value for leaderboard display
 */
export function formatPnL(value: number, compact: boolean = false): FormattedMetric {
  return formatCurrency(value, {
    showSign: true,
    compact,
    precision: compact ? 1 : 2
  });
}

/**
 * Format win rate for leaderboard display
 */
export function formatWinRate(value: number): FormattedMetric {
  return formatPercentage(value, {
    showSign: false,
    precision: 1,
    showPositiveSign: false
  });
}

/**
 * Format Sharpe ratio for leaderboard display
 */
export function formatSharpe(value: number): FormattedMetric {
  return formatNumber(value, {
    precision: 2,
    compact: false,
    showSign: false
  });
}

/**
 * Format trade count for leaderboard display
 */
export function formatTradeCount(value: number): FormattedMetric {
  return formatNumber(value, {
    precision: 0,
    compact: false,
    showSign: false
  });
}

/**
 * Format average return for leaderboard display
 */
export function formatAverageReturn(value: number): FormattedMetric {
  return formatPercentage(value, {
    showSign: true,
    precision: 1,
    showPositiveSign: true
  });
}

/**
 * Steve's portfolio fixture for testing formatting consistency
 * These values should match the screenshot mentioned in the dev doc
 */
export const STEVE_FIXTURE = {
  totalValue: 31200.00,
  invested: 10000.00,
  totalReturnPct: 212.00,
  dayChangePct: 0.50,
  dayChangeValue: 156.75,
  positions: [
    { symbol: 'META', shares: 15, avgPrice: 275, currentPrice: 769.98, currentValue: 11549.70 },
    // ... other positions would be here in a full fixture
  ]
};

/**
 * Test formatting utilities against Steve's fixture
 */
export function testSteveFormatting(): {
  totalValue: string;
  totalReturn: string;
  dayChangePercent: string;
  dayChangeDollar: string;
} {
  const fixture = STEVE_FIXTURE;
  
  return {
    totalValue: `$${formatTotalValue(fixture.totalValue).value}`,
    totalReturn: `${formatTotalReturn(fixture.totalReturnPct).prefix}${formatTotalReturn(fixture.totalReturnPct).value}%`,
    dayChangePercent: `${formatDayChange(fixture.dayChangePct, fixture.dayChangeValue).percent.prefix}${formatDayChange(fixture.dayChangePct, fixture.dayChangeValue).percent.value}%`,
    dayChangeDollar: `${formatDayChange(fixture.dayChangePct, fixture.dayChangeValue).dollar.prefix}$${formatDayChange(fixture.dayChangePct, fixture.dayChangeValue).dollar.value}`
  };
}

/**
 * Utility to create consistent metric display components
 */
export function createMetricDisplay(metric: FormattedMetric, label?: string) {
  const colorClasses = getReturnColorClasses(metric.colorScheme);
  
  return {
    value: `${metric.prefix || ''}${metric.value}${metric.suffix || ''}`,
    colorClasses,
    label,
    className: colorClasses.text
  };
}
/**
 * Portfolio Demo Page
 * 
 * Demonstrates MongoDB portfolio data fetching functionality
 */

import PortfolioDemo from '@/components/PortfolioDemo';

export default function PortfolioDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortfolioDemo />
    </div>
  );
}

export const metadata = {
  title: 'Portfolio Demo - MongoDB Integration',
  description: 'Demonstration of portfolio data fetching from MongoDB',
};
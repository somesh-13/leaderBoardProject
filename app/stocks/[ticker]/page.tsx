import StockDetailClient from './StockDetailClient'

interface StockDetailPageProps {
  params: {
    ticker: string
  }
}

export default function StockDetailPage({ params }: StockDetailPageProps) {
  return <StockDetailClient ticker={params.ticker.toUpperCase()} />
}

export function generateMetadata({ params }: StockDetailPageProps) {
  const ticker = params.ticker.toUpperCase()
  return {
    title: `${ticker} Stock Details | Trading Leaderboard`,
    description: `View detailed information, charts, and analysis for ${ticker} stock.`
  }
}
import StockDetailClient from './StockDetailClient'

interface StockDetailPageProps {
  params: Promise<{
    ticker: string
  }>
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const resolvedParams = await params;
  return <StockDetailClient ticker={resolvedParams.ticker.toUpperCase()} />
}

export async function generateMetadata({ params }: StockDetailPageProps) {
  const resolvedParams = await params;
  const ticker = resolvedParams.ticker.toUpperCase()
  return {
    title: `${ticker} Stock Details | Trading Leaderboard`,
    description: `View detailed information, charts, and analysis for ${ticker} stock.`
  }
}
import StockDetailClient from './StockDetailClient'

interface StockDetailPageProps {
  params: Promise<{
    ticker: string
  }>
}

export default async function StockDetailPage({ params }: StockDetailPageProps) {
  const { ticker } = await params
  return <StockDetailClient ticker={ticker.toUpperCase()} />
}

export async function generateMetadata({ params }: StockDetailPageProps) {
  const { ticker: rawTicker } = await params
  const ticker = rawTicker.toUpperCase()
  return {
    title: `${ticker} Stock Details | Trading Leaderboard`,
    description: `View detailed information, charts, and analysis for ${ticker} stock.`
  }
}
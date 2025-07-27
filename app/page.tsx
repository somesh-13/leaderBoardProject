import Link from 'next/link'
import TierBadge from '@/components/TierBadge'

export default function Home() {
  const mockStats = {
    topUser: { username: 'Matt', tier: 'S' as const, return: 45.2 }
  }

  const marketAssets = [
    { name: 'S&P 500', symbol: 'SPX', value: 4783.45, change: 1.2, type: 'Index' },
    { name: 'NASDAQ', symbol: 'IXIC', value: 15234.78, change: -0.8, type: 'Index' },
    { name: 'NIFTY 50', symbol: 'NSEI', value: 19674.25, change: 0.5, type: 'Index' },
    { name: 'Bitcoin', symbol: 'BTC', value: 43250.00, change: 2.8, type: 'Crypto' },
    { name: 'Ethereum', symbol: 'ETH', value: 2640.75, change: -1.2, type: 'Crypto' },
    { name: 'Gold', symbol: 'XAU', value: 2012.30, change: 0.3, type: 'Commodity' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Compete, Trade, Win!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Test your trading strategies against the best investors in our gamified stock trading platform. 
          Climb the tiers, perfect your approach, and dominate the leaderboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/leaderboard" className="btn-primary text-center">
            View Leaderboard
          </Link>
          <Link href="/terminal" className="btn-secondary text-center">
            Test a Strategy
          </Link>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Top S-Tier User */}
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Top S-Tier Trader
          </h3>
          <div className="mb-2">
            <TierBadge tier={mockStats.topUser.tier} className="mb-2" />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {mockStats.topUser.username}
          </p>
          <p className="text-3xl font-bold text-gain">
            +{mockStats.topUser.return}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Annual Return
          </p>
        </div>

        {/* Market Assets Table */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Market Overview
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Asset</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Change</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                </tr>
              </thead>
              <tbody>
                {marketAssets.map((asset, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</p>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                      {asset.value.toLocaleString()}
                    </td>
                    <td className={`py-3 text-right font-semibold ${
                      asset.change >= 0 ? 'text-gain' : 'text-loss'
                    }`}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.type === 'Index' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        asset.type === 'Crypto' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                        'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {asset.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Tier Rankings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Climb from C to S tier based on your annual returns and trading performance.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Strategy Testing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Test Bollinger Bands, Keltner Channels, and other strategies via our chat terminal.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">User Profiles</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Follow top traders and explore their strategies to improve your own performance.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Trading</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time portfolio tracking with live market data and instant performance updates.
          </p>
        </div>
      </div>
    </div>
  )
}
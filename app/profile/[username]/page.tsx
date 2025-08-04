import ProfileContent from '@/components/profile/ProfileContent'

interface ProfilePageProps {
  params: {
    username: string
  }
}

// Generate static params for known usernames
export async function generateStaticParams() {
  const knownUsernames = ['Matt', 'Amit', 'Steve', 'Tannor', 'Kris', 'TradeMaster', 'StockGuru', 'InvestPro', 'MarketWiz', 'BullRunner']
  
  return knownUsernames.map((username) => ({
    username: username,
  }))
}

// Get user data on the server side
function getUserData(username: string) {
  const users: Record<string, any> = {
    'Matt': {
      username: 'Matt',
      tier: 'S' as const,
      rank: 1,
      totalReturn: 45.2,
      followers: 2340,
      following: 145,
      portfolio: ['RKLB', 'AMZN', 'SOFI', 'ASTS', 'BRK.B', 'CELH', 'OSCR', 'EOG']
    },
    'Amit': {
      username: 'Amit',
      tier: 'S' as const,
      rank: 2,
      totalReturn: 42.8,
      followers: 1890,
      following: 112,
      portfolio: ['PLTR', 'HOOD', 'TSLA', 'AMD', 'JPM', 'NBIS', 'GRAB', 'AAPL']
    },
    'Steve': {
      username: 'Steve',
      tier: 'S' as const,
      rank: 3,
      totalReturn: 39.5,
      followers: 1654,
      following: 98,
      portfolio: ['META', 'MSTR', 'MSFT', 'HIMS', 'AVGO', 'CRWD', 'NFLX', 'CRM']
    },
    'Tannor': {
      username: 'Tannor',
      tier: 'S' as const,
      rank: 4,
      totalReturn: 37.1,
      followers: 1432,
      following: 87,
      portfolio: ['NVDA', 'NU', 'NOW', 'MELI', 'SHOP', 'TTD', 'ASML', 'APP']
    },
    'Kris': {
      username: 'Kris',
      tier: 'S' as const,
      rank: 5,
      totalReturn: 34.7,
      followers: 1287,
      following: 76,
      portfolio: ['UNH', 'GOOGL', 'MRVL', 'AXON', 'ELF', 'ORCL', 'CSCO', 'LLY']
    },
    'TradeMaster': {
      username: 'TradeMaster',
      tier: 'A' as const,
      rank: 6,
      totalReturn: 22.5,
      followers: 1247,
      following: 89,
      portfolio: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AMZN', 'NFLX']
    },
    'StockGuru': {
      username: 'StockGuru',
      tier: 'A' as const,
      rank: 7,
      totalReturn: 18.2,
      followers: 897,
      following: 65,
      portfolio: ['TSLA', 'AAPL', 'MSFT', 'GOOGL']
    },
    'InvestPro': {
      username: 'InvestPro',
      tier: 'A' as const,
      rank: 8,
      totalReturn: 15.7,
      followers: 743,
      following: 52,
      portfolio: ['JNJ', 'PFE', 'UNH', 'ABBV']
    },
    'MarketWiz': {
      username: 'MarketWiz',
      tier: 'B' as const,
      rank: 9,
      totalReturn: 12.4,
      followers: 623,
      following: 48,
      portfolio: ['JPM', 'BAC', 'WFC', 'GS']
    },
    'BullRunner': {
      username: 'BullRunner',
      tier: 'B' as const,
      rank: 10,
      totalReturn: 9.8,
      followers: 556,
      following: 42,
      portfolio: ['MSFT', 'AAPL', 'GOOGL', 'AMZN']
    }
  }
  
  return users[username] || {
    username: username,
    tier: 'B' as const,
    rank: 10,
    totalReturn: 15.0,
    followers: 500,
    following: 50,
    portfolio: ['AAPL', 'MSFT', 'GOOGL']
  }
}

export default function Profile({ params }: ProfilePageProps) {
  const user = getUserData(params.username)

  return <ProfileContent user={user} />
}
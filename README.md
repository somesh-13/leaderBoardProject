# Wall Street Bets - Trading Leaderboard Platform

A comprehensive web-based trading platform inspired by the Wall Street Bets community, featuring real-time portfolio tracking, competitive leaderboards, tiered rankings, and interactive strategy testing tools.

## 🎯 Project Overview

This platform enables traders to:
- Track portfolio performance with real-time stock prices
- Compete on leaderboards with tier-based rankings
- Test trading strategies using technical indicators
- View detailed user profiles with portfolio analytics
- Screen stocks and analyze market data

## ✨ Key Features

### 🏆 Leaderboard System
- **Real-time Rankings**: Portfolio performance calculated using live stock prices from Polygon.io
- **Tier-based Classification**:
  - **S Tier**: Top 5% performers (Returns ≥40%)
  - **A Tier**: Expert traders (Returns ≥30%)
  - **B Tier**: Intermediate traders (Returns ≥20%)
  - **C Tier**: Beginner traders (Returns <20%)
- **Advanced Filtering**:
  - Filter by sector (Technology, Healthcare, Finance, etc.)
  - Filter by specific companies/stocks
  - Filter by asset type (Stocks, ETFs, Options)
  - Filter by performance date range
- **Sorting Options**: Sort by rank, username, return percentage, tier, sector, or portfolio value
- **Hall of Fame**: Visual showcase of top performers with animated tooltips

### 👤 User Profiles
- **Portfolio Overview**: Real-time portfolio value and performance metrics
- **Position Details**: Individual stock positions with current prices, gains/losses
- **Performance Charts**: Visual representation of portfolio performance over time
- **Sector Allocation**: Breakdown of portfolio by sectors
- **Daily Changes**: Real-time day-over-day performance tracking
- **Tier Badges**: Visual tier indicators

### 📊 Market Screener
- Stock screening capabilities
- Real-time market data
- Filter and search functionality

### 💻 Strategy Testing Terminal
- **Interactive Terminal Interface**: Multi-tab terminal for testing multiple strategies
- **Supported Strategies**:
  - Keltner Channels: `run keltner <SYMBOL> <PERIOD> <MULTIPLIER>`
  - Bollinger Bands: `test bollinger <SYMBOL> <PERIOD> <STD_DEV>`
  - Backtesting: `backtest <STRATEGY> <SYMBOL> <DAYS>`
- **Strategy Simulation**: Historical data simulation with performance metrics
- **Command History**: Persistent command history per terminal session
- **Multiple Sessions**: Create and manage multiple terminal tabs

### 🔐 Authentication System
- **NextAuth Integration**: Secure authentication using JWT tokens
- **Credentials Provider**: Email/password authentication
- **MongoDB Adapter**: User session management
- **Role-based Access**: User roles and permissions
- **Protected Routes**: Secure access to user-specific data

### 💾 Data Management
- **MongoDB Database**: Stores user portfolios, positions, and account data
- **Real-time Price Updates**: Automatic price fetching from Polygon.io API
- **Price Caching**: Intelligent caching system for optimized API usage
- **Historical Price Data**: Support for historical price lookups

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Chart.js / React-Chartjs-2**: Data visualization
- **SWR**: Data fetching and caching
- **Zustand**: State management
- **Next Themes**: Dark/light mode support
- **Lucide React**: Icon library
- **Motion**: Animation library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for user and portfolio data
- **NextAuth.js**: Authentication framework
- **Bcryptjs**: Password hashing

### External APIs
- **Polygon.io**: Real-time and historical stock market data
  - Snapshot API for batch price fetching
  - Aggregates API for historical data
  - Last Trade API for current prices

### Infrastructure
- **Netlify**: Deployment platform (configured)
- **GitHub Actions**: CI/CD workflows (optional)

## 📁 Project Structure

```
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── leaderboard/          # Leaderboard API
│   │   ├── portfolio/            # Portfolio data API
│   │   ├── prices/               # Price data API
│   │   └── stocks/               # Stock information API
│   ├── auth/                     # Authentication pages
│   ├── leaderboard/              # Leaderboard page
│   ├── profile/                  # User profile pages
│   ├── screener/                 # Stock screener
│   ├── terminal/                 # Strategy testing terminal
│   ├── layout.tsx               # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── charts/                  # Chart components
│   ├── leaderboard/              # Leaderboard components
│   ├── profile/                  # Profile components
│   ├── providers/                # Context providers
│   └── ui/                       # UI components
│
├── lib/                          # Core libraries
│   ├── data/                     # Static/initial data
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # Business logic services
│   ├── store/                    # State management (Zustand)
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── db.ts                     # MongoDB connection
│   └── polygon.ts                 # Polygon.io API client
│
├── scripts/                      # Utility scripts
│   ├── seedPortfolioData.ts     # Seed database with portfolios
│   ├── updatePortfolioWithRealPrices.ts
│   └── testPolygonIntegration.ts
│
├── public/                       # Static assets
├── auth.ts                       # NextAuth configuration
└── package.json                  # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm** or **yarn**: Package manager
- **MongoDB**: Database instance (local or Atlas)
- **Polygon.io API Key**: For stock market data

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd leaderBoardProject
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/leaderboard
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here

   # Polygon.io API Key
   NEXT_PUBLIC_POLYGON_API_KEY=your-polygon-api-key

   # GitHub MCP (optional)
   GITHUB_PERSONAL_ACCESS_TOKEN=your-github-token
   ```

4. **Database Setup**:
   
   If using MongoDB locally:
   ```bash
   # Start MongoDB service
   mongod
   ```
   
   Or use MongoDB Atlas for cloud database.

5. **Seed Initial Data** (optional):
   ```bash
   npm run seed-portfolios
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📡 API Documentation

### Leaderboard API
```
GET /api/leaderboard
Query Parameters:
  - period: '1D' | '1W' | '1M' | 'ALL' (default: '1D')
  - sort: 'pnl' | 'winRate' | 'sharpe' | 'totalReturnPct' | etc.
  - order: 'asc' | 'desc' (default: 'desc')
  - page: number (default: 1)
  - pageSize: number (default: 25)
  - q: string (username search)
  - sector: string (sector filter)
```

### Portfolio API
```
GET /api/portfolio/[username]
GET /api/portfolio/[username]/snapshot?at=YYYY-MM-DD
```

### Prices API
```
GET /api/prices
GET /api/stock-prices
```

### Authentication API
```
POST /api/auth/signup
POST /api/auth/[...nextauth]
```

## 🎨 Features in Detail

### Portfolio Calculation System
- Real-time price fetching from Polygon.io
- Batch processing for multiple symbols
- Intelligent caching (5-minute TTL)
- Fallback prices for reliability
- Historical price lookups for performance tracking

### Tier Calculation
```typescript
S Tier: totalReturnPercent >= 40%
A Tier: totalReturnPercent >= 30%
B Tier: totalReturnPercent >= 20%
C Tier: totalReturnPercent < 20%
```

### Price Service
- **Current Prices**: Real-time stock prices
- **Historical Prices**: Historical close prices by date
- **Batch Fetching**: Efficient multi-symbol price retrieval
- **Caching**: LRU cache with TTL for performance
- **Rate Limiting**: Built-in rate limiting to respect API limits

## 🔧 Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run seed-portfolios  # Seed database with sample portfolios
npm run test-polygon     # Test Polygon.io integration
npm run update-prices    # Update portfolios with real prices
```

## 🌐 Deployment

### Netlify Deployment
The project is configured for Netlify deployment with `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform:
- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_POLYGON_API_KEY`

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **CSP Headers**: Content Security Policy configured
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: MongoDB driver parameterization

## 📊 Performance Optimizations

- **Price Caching**: 5-minute cache TTL for stock prices
- **Batch API Calls**: Efficient batch processing for multiple symbols
- **SWR Caching**: Client-side data fetching with stale-while-revalidate
- **Leaderboard Caching**: 60-second cache for leaderboard calculations
- **Static Generation**: Pre-rendered pages where possible

## 🧪 Testing

```bash
npm run test-polygon           # Test Polygon.io integration
npm run test-portfolio-service # Test portfolio service
```

## 📝 Code Organization

- **Services**: Business logic in `lib/services/`
- **Hooks**: Reusable React hooks in `lib/hooks/`
- **Types**: TypeScript definitions in `lib/types/`
- **Utils**: Utility functions in `lib/utils/`
- **Store**: Global state in `lib/store/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- **Polygon.io** for providing comprehensive stock market data APIs
- **Next.js Team** for the excellent framework
- **Wall Street Bets Community** for inspiration

## 📞 Support

For issues and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**

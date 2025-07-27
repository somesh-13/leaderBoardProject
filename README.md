# Stock Trading Game

A web-based stock trading game inspired by the FIFA Companion App, featuring a leaderboard, tiered rankings, strategy testing via a chat terminal, and user profiles with tokenized investment options.

## Features

### 🏆 Leaderboard
- Displays ranked users based on portfolio returns
- Filters for technology, companies, or assets
- **Tier System**: S (Top 5%), A (≥15%), B (10-15%), C (0-10%)
- Real-time updates using stock data APIs

### 👤 User Profiles
- Portfolio overview with return percentage and tier
- Trading strategies with technical indicators
- Follow users and invest in their strategies

### 💬 Chat Terminal
- Interactive terminal for testing trading strategies
- Commands: `run keltner TSLA 20 2`, `test bollinger AAPL 20 2`
- Historical data simulation and results

### 📊 Strategy Simulation
- Keltner Channels (EMA ± ATR)
- Bollinger Bands (SMA ± std dev)
- Visual charts and performance metrics

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI**: Dark mode support, responsive design
- **Charts**: Chart.js integration
- **Theme**: next-themes for dark/light mode

## Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd stock-trading-game
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Add your GitHub token for MCP integration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## GitHub MCP Integration

This project includes GitHub MCP (Model Context Protocol) integration for enhanced development workflow:

### Setup
1. Create a GitHub Personal Access Token at https://github.com/settings/tokens
2. Required scopes: `repo`, `read:user`, `read:org`
3. Add token to `.env` file as `GITHUB_PERSONAL_ACCESS_TOKEN`

### Configuration
The MCP configuration is in `.claude_mcp_config.json` and enables:
- Repository management
- Issue tracking
- Pull request workflows
- Code review automation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (Home)
│   ├── leaderboard/
│   ├── profile/
│   └── terminal/
├── components/
│   ├── Navbar.tsx
│   ├── TierBadge.tsx
│   └── providers/
└── public/
```

## Features Overview

### 🎯 Tier System
- **S Tier**: Gold badge, top 5% performers
- **A Tier**: Silver badge, ≥15% returns
- **B Tier**: Bronze badge, 10-15% returns
- **C Tier**: Blue badge, 0-10% returns

### 📱 Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Responsive tables and cards
- Touch-friendly terminal interface

### 🌙 Dark Mode
- System preference detection
- Smooth theme transitions
- Consistent color scheme
- Accessible contrast ratios
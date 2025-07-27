# Stock Trading Game

A web-based stock trading game inspired by the FIFA Companion App, featuring a leaderboard, tiered rankings, strategy testing via a chat terminal, and user profiles with tokenized investment options. Users can filter by technologies, companies, or assets, view top strategies, and simulate trades using technical indicators like Keltner Channels and Bollinger Bands.

## Features

### 1. Leaderboard

- Displays ranked users based on portfolio returns.
- Filters for technology (e.g., tech, healthcare), companies (e.g., Apple, Tesla), or assets (stocks, ETFs).
- **Tier System**:
  - **S Tier**: Top 5% of investors by annual return.
  - **A Tier**: Investors with returns ≥15% (exceeding S&P 500 significantly).
  - **B Tier**: Investors with returns ≥10% but &lt;15%.
  - **C Tier**: Investors with returns between 0% and 4.5% (aligned with bond market performance).
- Updates in real-time using stock data APIs (e.g., yfinance, Alpha Vantage).

### 2. User Profiles

- Each user has a profile showing hteir portfolio, return percentage, tier, and trading strategies.
- Strategies include technical indicators (e.g., Keltner Channel, Bollinger Bands) with parameters like period or multiplier.
- Option to “follow” a user or invest in their strategy via tokenized funds (future blockchain integration).

### 3. Chat Terminal

- Interactive terminal for testing trading strategies.
- Commands like `run keltner TSLA 20 2` (20-day EMA, 2x ATR) or `test bollinger AAPL 20 2` (20-day SMA, 2x std dev).
- Returns simulated trade results based on historical data.
- Supports combining strategies (e.g., Keltner + Bollinger).

### 4. Strategy Simulation

- Users can simulate trades using Keltner Channels (EMA ± ATR) or Bollinger Bands (SMA ± std dev).
- Historical data pulled via API to compute hypothetical returns.
- Visual charts display strategy performance.

### 5. Tokenized Investment 

- Users can invest in top performers’ strategies via tokenized funds.
- Future integration with Ethereum for smart contract-based fractional ownership.

## UI Design

### 1. Home Page

- **Layout**: Clean, mobile-first design with a top navbar (Home, Leaderboard, Profile, Terminal).
- **Content**: Welcome banner with app tagline (“Compete, Trade, Win!”). Quick stats: top S-tier user, market summary (S&P 500, Nasdaq). Call-to-action buttons for “View Leaderboard” and “Test a Strategy.”
- **Style**: Dark theme with vibrant accents (green for gains, red for losses). Responsive grid for stats.

### 2. Leaderboard Page

- **Layout**: Full-width table with columns for Rank, Username, Return %, Tier, and Filters (dropdowns for tech, company, asset).
- **Content**: Tier badges (S, A, B, C) with distinct colors (gold, silver, bronze, blue). Click a username to visit their profile.
- **Style**: Minimalist, with hover effects on rows. Mobile view stacks filters above the table.

### 3. User Profile Page

- **Layout**: Two-column layout. Left: User info (username, tier, return %). Right: Portfolio summary and strategy list.
- **Content**: Line chart of portfolio performance. List of strategies with details (e.g., “Keltner Channel, 20-day, 2x ATR”). “Follow” or “Invest” buttons.
- **Style**: Card-based design for strategies. Chart uses Chart.js for interactivity.

### 4. Chat Terminal Page

- **Layout**: Full-screen terminal interface with a command input field at the bottom and output area above.
- **Content**: Displays command history and results (e.g., simulated trade outcomes, charts). Supports commands like `run keltner TSLA 20 2` or `test bollinger AAPL 20 2`.
- **Style**: Monospace font, dark background, green text for outputs. Responsive for mobile with scrollable output.

## Technical Stack

- **Backend**: Python with Django/Flask for user management, portfolio tracking, and API integration.
- **Frontend**: React Native for a FIFA Companion App-like interface, with Chart.js for visualizations.
- **APIs**: yfinance or Alpha Vantage for stock data; Ethereum for tokenized funds (future).
- **Database**: PostgreSQL for storing user data, portfolios, and strategies.
- **Libraries**: Pandas for Keltner Channel/Bollinger Band calculations, scikit-learn for strategy optimization.

## Setup Instructions

1. Clone the repository: `git clone <repo-url>`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Set up PostgreSQL database and update `settings.py` with credentials.
4. Run migrations: `python manage.py migrate` (Django) or equivalent for Flask.
5. Start the server: `python manage.py runserver` (Django) or `flask run`.
6. For frontend, install React Native dependencies: `npm install`.
7. Run the frontend: `npm start`.

## Future Enhancements

- Real-time notifications for tier changes or market events.
- Machine learning-based strategy suggestions.
- Full Ethereum integration for tokenized investments.
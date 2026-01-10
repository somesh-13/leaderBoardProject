# Environment Variables Quick Reference

This document provides a quick reference for all environment variables used in the Trading Leaderboard application.

## Required Variables

### NEXT_PUBLIC_POLYGON_API_KEY
- **Purpose**: Polygon.io API key for fetching stock prices, historical data, and news
- **Get it from**: https://polygon.io/pricing (Free tier available)
- **Used in**: 
  - Stock price fetching
  - Historical price data
  - Stock news feed
  - Market screener
- **Example**: `NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key_here`

### DATABASE_URL
- **Purpose**: Database connection string
- **Format**: Depends on your database provider (PostgreSQL, MySQL, etc.)
- **Example**: `DATABASE_URL=postgresql://user:password@localhost:5432/dbname`

### NEXTAUTH_SECRET
- **Purpose**: Secret key for NextAuth.js authentication
- **Generate**: Run `openssl rand -base64 32` in terminal
- **Example**: `NEXTAUTH_SECRET=your_generated_secret_here`

### NEXTAUTH_URL
- **Purpose**: Base URL for your application
- **Development**: `NEXTAUTH_URL=http://localhost:3000`
- **Production**: `NEXTAUTH_URL=https://yourdomain.com`

## Optional Variables

### NEWS_API_KEY
- **Purpose**: NewsAPI.org API key for fetching stock news (fallback option)
- **Get it from**: https://newsapi.org/register
- **Note**: The app works fine without this if you have Polygon.io configured
- **Used in**: News tab as a fallback when Polygon.io is not available
- **Example**: `NEWS_API_KEY=your_newsapi_key_here`

## Setup Instructions

1. **Create `.env.local` file** in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in your actual values**:
   ```bash
   # Edit .env.local with your preferred editor
   nano .env.local
   # or
   code .env.local
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Environment File Locations

- `.env.local.example` - Template file (committed to git)
- `.env.local` - Your actual config (ignored by git, not committed)
- `.env.production` - Production-specific variables (if needed)

## Security Best Practices

✅ **DO**:
- Keep `.env.local` file private and never commit it
- Use strong, unique values for secrets
- Rotate API keys periodically
- Use environment variables in CI/CD pipelines
- Set proper CORS and API restrictions

❌ **DON'T**:
- Commit `.env.local` to version control
- Share API keys publicly
- Use development keys in production
- Hardcode sensitive values in source code

## Verifying Your Setup

### Check if variables are loaded:

Create a test page or add to an existing API route:

```typescript
// For server-side variables
console.log('Polygon Key exists:', !!process.env.NEXT_PUBLIC_POLYGON_API_KEY)
console.log('News Key exists:', !!process.env.NEWS_API_KEY)

// For client-side variables (only NEXT_PUBLIC_* variables)
console.log('Polygon Key (client):', !!process.env.NEXT_PUBLIC_POLYGON_API_KEY)
```

### Test specific features:

1. **Stock prices**: Visit `/screener` - stocks should load
2. **Historical data**: Visit any stock detail page - chart should display
3. **News feed**: Visit stock detail page → "Latest News" tab
4. **Authentication**: Try signing up or logging in

## Troubleshooting

### "API key not configured" errors

1. Verify `.env.local` exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart development server after changes
4. Ensure no spaces around `=` in .env file

### Variables not loading

```bash
# Restart the dev server
npm run dev

# Or force restart
killall node && npm run dev
```

### Production deployment

For Netlify, Vercel, or other platforms:
1. Add environment variables in the platform's dashboard
2. Don't include `NEXT_PUBLIC_` prefix in platform settings for server-only vars
3. Redeploy after changing variables

## API Key Limits

### Polygon.io (Free Tier)
- 5 API calls per minute
- Limited historical data
- Basic market data

### NewsAPI.org (Free Tier)
- 100 requests per day
- Development use only
- Limited to recent articles

### Recommendations
- Cache API responses when possible
- Implement rate limiting in your API routes
- Consider upgrading for production use
- Monitor your API usage regularly

## Summary Table

| Variable | Required | Public | Purpose |
|----------|----------|--------|---------|
| `NEXT_PUBLIC_POLYGON_API_KEY` | ✅ Yes | ✅ Yes | Stock data & news |
| `DATABASE_URL` | ✅ Yes | ❌ No | Database connection |
| `NEXTAUTH_SECRET` | ✅ Yes | ❌ No | Auth encryption |
| `NEXTAUTH_URL` | ✅ Yes | ❌ No | App base URL |
| `NEWS_API_KEY` | ⚠️ Optional | ❌ No | News fallback |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-side only.

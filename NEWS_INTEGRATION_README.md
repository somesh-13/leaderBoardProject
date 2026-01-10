# News Integration for Stock Detail Page

## Overview

The stock detail page now includes a "Latest News" tab that displays recent news articles related to the stock ticker. The news feature automatically fetches the ticker from the URL and displays relevant articles.

## Features

- **Automatic Ticker Detection**: The news API automatically fetches news for the ticker from the URL
- **Multiple News Sources**: 
  - Primary: Polygon.io (already integrated in the app)
  - Fallback: NewsAPI.org (optional)
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Updates**: News articles are cached for 5 minutes to balance freshness and API usage
- **Rich Article Display**:
  - Article title and description
  - Source name
  - Publication time (relative format: "2 hours ago", "Yesterday", etc.)
  - Article images (when available)
  - Direct links to full articles

## Setup Instructions

### Option 1: Using Polygon.io (Recommended - Already Configured)

If you already have a Polygon.io API key configured, the news feature will work automatically using Polygon's news endpoint.

**No additional configuration needed!** ✅

### Option 2: Using NewsAPI.org (Optional Fallback)

If you want to use NewsAPI.org as an additional source:

1. **Get a free API key**:
   - Visit https://newsapi.org/register
   - Sign up for a free account
   - Copy your API key

2. **Add to environment variables**:
   - Create or edit `.env.local` file in the project root
   - Add the following line:
     ```
     NEWS_API_KEY=your_newsapi_key_here
     ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## Usage

### For Users

1. Navigate to any stock detail page (e.g., `/stocks/AAPL`)
2. Click on the "Latest News" tab
3. Browse recent news articles about the stock
4. Click on any article to read the full story on the source website

### For Developers

#### API Endpoint

```typescript
GET /api/news/[ticker]
```

**Response Format**:
```typescript
{
  articles: Array<{
    id: string
    title: string
    description: string
    url: string
    image_url?: string
    published_at: string
    source: string
  }>,
  ticker: string
}
```

#### NewsTab Component

```typescript
import NewsTab from '@/components/NewsTab'

<NewsTab ticker="AAPL" />
```

**Props**:
- `ticker` (string, required): The stock ticker symbol

## Architecture

### API Route (`/app/api/news/[ticker]/route.ts`)

- Extracts ticker from URL parameters
- Checks for NEWS_API_KEY or NEXT_PUBLIC_POLYGON_API_KEY
- Fetches news from available API
- Transforms and normalizes data from different sources
- Returns standardized news article format
- Implements 5-minute caching

### NewsTab Component (`/components/NewsTab.tsx`)

- Client-side component for displaying news
- Handles loading, error, and empty states
- Formats relative timestamps
- Responsive card layout with images
- External link handling with security attributes

## Error Handling

The news feature includes robust error handling:

- **Missing API Key**: Shows informative message instead of breaking
- **API Errors**: Gracefully displays error state with helpful message
- **No Articles**: Shows "No News Available" state
- **Image Loading Errors**: Hides broken images automatically
- **Network Issues**: Displays error message and suggests retry

## Caching Strategy

- News articles are cached for **5 minutes** using Next.js `revalidate`
- Reduces API calls while keeping content reasonably fresh
- Balances API rate limits with user experience

## Customization

### Adjust Number of Articles

In `/app/api/news/[ticker]/route.ts`:

```typescript
const limit = 10 // Change this value (default: 10)
```

### Change Cache Duration

```typescript
next: { revalidate: 300 } // Change to desired seconds (default: 300 = 5 minutes)
```

### Style Customization

The NewsTab component uses Tailwind CSS classes. Modify `/components/NewsTab.tsx` to customize appearance.

## API Providers Comparison

| Feature | Polygon.io | NewsAPI.org |
|---------|-----------|-------------|
| Free Tier | ✅ Yes | ✅ Yes |
| Rate Limit | 5 calls/min | 100 calls/day |
| Article Images | ✅ Yes | ✅ Yes |
| Historical News | ✅ Yes | Limited |
| Already Integrated | ✅ Yes | ❌ No |
| **Recommended** | ✅ | - |

## Troubleshooting

### News not loading?

1. Check if `NEXT_PUBLIC_POLYGON_API_KEY` is set in `.env.local`
2. Verify the API key is valid
3. Check browser console for error messages
4. Ensure you haven't exceeded API rate limits

### Getting API rate limit errors?

- Polygon.io free tier: 5 requests per minute
- Consider upgrading your API plan for higher limits
- The 5-minute cache helps minimize API calls

### Articles showing "No description available"?

Some news sources don't provide descriptions. This is normal and expected.

## Future Enhancements

Potential improvements for future versions:

- [ ] Sentiment analysis for news articles
- [ ] Filter by news category (earnings, analyst ratings, general)
- [ ] Search within news articles
- [ ] Save/bookmark favorite articles
- [ ] Email alerts for breaking news
- [ ] Integration with more news providers

## Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are correctly set
3. Review the API provider's documentation
4. Check API usage/quota in your provider dashboard

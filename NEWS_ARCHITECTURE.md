# News Integration Architecture Diagram

## Component Flow

```
User Navigation
     │
     ▼
┌─────────────────────────────────────┐
│   /stocks/[ticker]                  │
│   (Stock Detail Page)               │
│                                     │
│   ┌─────────────────────────────┐  │
│   │  StockDetailClient          │  │
│   │  • Manages tab state        │  │
│   │  • ticker: "AAPL"           │  │
│   └─────────────────────────────┘  │
│             │                       │
│             ├─ Overview Tab         │
│             ├─ DCF Valuation Tab    │
│             └─ Latest News Tab      │
│                      │              │
└──────────────────────┼──────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   NewsTab      │
              │   Component    │
              │  ticker="AAPL" │
              └────────────────┘
                       │
                       │ fetch('/api/news/AAPL')
                       │
                       ▼
              ┌────────────────┐
              │   API Route    │
              │ /api/news/     │
              │   [ticker]     │
              └────────────────┘
                       │
                       ├─ Extract ticker from URL
                       ├─ Check for API keys
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌────────────────┐          ┌────────────────┐
│  Polygon.io    │          │  NewsAPI.org   │
│   (Primary)    │          │   (Fallback)   │
│                │          │                │
│ • Stock news   │          │ • General news │
│ • Company news │          │ • Query-based  │
│ • Images       │          │ • Images       │
└────────────────┘          └────────────────┘
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Transform &   │
              │   Normalize    │
              │     Data       │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Cache for     │
              │  5 minutes     │
              │  (Next.js)     │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  JSON Response │
              │   {articles}   │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   NewsTab      │
              │   Renders      │
              │   Articles     │
              └────────────────┘
                       │
                       ▼
                ┌──────────┐
                │   User   │
                │  Clicks  │
                │ Article  │
                └──────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Opens in new   │
              │   tab/window   │
              └────────────────┘
```

## Data Flow

### Request Flow
```
1. User clicks "Latest News" tab
   └─> activeTab = 'news'
   
2. StockDetailClient renders <NewsTab ticker="AAPL" />
   
3. NewsTab useEffect triggers
   └─> fetch('/api/news/AAPL')
   
4. API Route receives request
   └─> Extracts ticker from params
   └─> Checks environment variables
   
5. Makes API call to news provider
   └─> Polygon.io (if NEXT_PUBLIC_POLYGON_API_KEY exists)
   └─> NewsAPI.org (if NEWS_API_KEY exists as fallback)
   
6. Transform API response
   └─> Normalize to common format
   └─> Map fields (title, description, url, etc.)
   
7. Return JSON response
   └─> Cache for 5 minutes (Next.js revalidate)
   
8. NewsTab receives data
   └─> Updates state with articles[]
   └─> Renders article cards
```

### Component Hierarchy
```
page.tsx (Server Component)
  │
  ├─ Extracts ticker from URL params
  └─ Passes to StockDetailClient
          │
          └─ StockDetailClient (Client Component)
                  │
                  ├─ Overview Tab
                  │   ├─ Price Chart
                  │   ├─ Revenue Chart
                  │   └─ Statistics
                  │
                  ├─ DCF Valuation Tab
                  │   └─ DCFValuation Component
                  │
                  └─ Latest News Tab
                      └─ NewsTab Component
                          ├─ Loading State
                          ├─ Error State
                          ├─ Empty State
                          └─ Article Cards
                              ├─ Image
                              ├─ Title
                              ├─ Description
                              ├─ Source
                              └─ Timestamp
```

## File Structure
```
/Users/someshdubey/Documents/technoWiz_Somesh/leaderBoardProject/
│
├── app/
│   ├── stocks/
│   │   └── [ticker]/
│   │       ├── page.tsx             → Server Component, extracts ticker
│   │       └── StockDetailClient.tsx → Client Component, manages tabs
│   │
│   └── api/
│       └── news/
│           └── [ticker]/
│               └── route.ts          → News API endpoint
│
├── components/
│   └── NewsTab.tsx                   → News display component
│
├── .env.local.example                → Environment template
└── .env.local                        → Your actual config (not in git)
```

## State Management

### StockDetailClient State
```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'dcf' | 'news'>('overview')
// Manages which tab is currently displayed
```

### NewsTab State
```typescript
const [articles, setArticles] = useState<NewsArticle[]>([])
// Stores fetched news articles

const [loading, setLoading] = useState(true)
// Controls loading skeleton display

const [error, setError] = useState<string | null>(null)
// Stores error messages if API fails
```

## API Response Types

### News API Route Response
```typescript
{
  articles: NewsArticle[],
  ticker: string
}
```

### NewsArticle Interface
```typescript
interface NewsArticle {
  id: string           // Unique identifier
  title: string        // Article headline
  description: string  // Article summary
  url: string         // Link to full article
  image_url?: string  // Optional article image
  published_at: string // ISO timestamp
  source: string      // Publisher name
}
```

## Caching Strategy

### Next.js Cache
```typescript
fetch(url, {
  next: { revalidate: 300 } // 5 minutes
})
```

**Benefits:**
- Reduces API calls (stays within rate limits)
- Faster response times for repeated requests
- Balances freshness with performance

**Cache Key:** Based on URL path `/api/news/[ticker]`

## Error Handling Levels

```
1. Component Level (NewsTab.tsx)
   ├─ Network errors
   ├─ API response errors
   └─ Display user-friendly messages

2. API Route Level (route.ts)
   ├─ Missing API keys → Return empty array + message
   ├─ API failures → Return 500 + error details
   └─ Data transformation errors → Caught and logged

3. UI Level
   ├─ Loading state → Skeleton loaders
   ├─ Error state → Error card with icon
   ├─ Empty state → "No news" message
   └─ Image errors → Hide broken images
```

## Security Considerations

### Environment Variables
```
✅ Server-side only: NEWS_API_KEY
✅ Public (prefixed): NEXT_PUBLIC_POLYGON_API_KEY
❌ Never in code: API keys hardcoded
❌ Never in git: .env.local file
```

### External Links
```typescript
<a 
  href={article.url}
  target="_blank"
  rel="noopener noreferrer"  // Prevents security vulnerabilities
>
```

## Performance Optimizations

1. **Image Lazy Loading**
   - Images load only when visible
   - Broken images hidden automatically

2. **Caching**
   - 5-minute server-side cache
   - Reduces API calls by ~96% (assuming 1 call per 5 minutes vs per page load)

3. **Error Boundaries**
   - Failed API calls don't crash the page
   - Graceful degradation to error state

4. **Responsive Loading**
   - Skeleton loaders prevent layout shift
   - Users see progress immediately

## Testing Scenarios

### ✅ Happy Path
```
User → Stock Page → News Tab → Articles Load → Click Article → Opens in New Tab
```

### ⚠️ Error Paths
```
1. No API Key Configured
   → Shows message: "News API may not be configured"

2. API Rate Limit Exceeded
   → Shows error: "Unable to Load News"
   → Cached data still served for 5 minutes

3. Invalid Ticker
   → Returns empty articles array
   → Shows: "No News Available"

4. Network Failure
   → Shows error state
   → Suggests troubleshooting

5. Image Load Failure
   → Hides image, shows article without it
```

---

## Quick Reference

### Adding News API Key

**Option 1: Polygon.io (Recommended)**
```bash
# Already configured if you have stock prices working
NEXT_PUBLIC_POLYGON_API_KEY=pk_xxxxx
```

**Option 2: NewsAPI.org**
```bash
NEWS_API_KEY=xxxxx
```

### Testing Locally
```bash
# 1. Ensure API key is in .env.local
# 2. Restart dev server
npm run dev

# 3. Visit a stock page
# http://localhost:3000/stocks/AAPL

# 4. Click "Latest News" tab
```

### Monitoring API Usage
- **Polygon.io**: https://polygon.io/dashboard
- **NewsAPI.org**: https://newsapi.org/account

---

**Architecture Version**: 1.0  
**Last Updated**: December 14, 2025

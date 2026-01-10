import { NextRequest, NextResponse } from 'next/server'

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  image_url?: string
  published_at: string
  source: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    const polygonApiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
    const newsApiKey = process.env.NEWS_API_KEY

    // Try Polygon.io first (Primary source - already configured in the app)
    if (polygonApiKey) {
      try {
        const limit = 10
        const response = await fetch(
          `https://api.polygon.io/v2/reference/news?ticker=${ticker.toUpperCase()}&limit=${limit}&apiKey=${polygonApiKey}`,
          {
            next: { revalidate: 300 } // Cache for 5 minutes
          }
        )

        if (response.ok) {
          const data = await response.json()
          
          // Transform Polygon news data to our format
          const articles: NewsItem[] = (data.results || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || item.summary || 'No description available',
            url: item.article_url,
            image_url: item.image_url,
            published_at: item.published_utc,
            source: item.publisher?.name || item.author || 'Unknown'
          }))

          console.log(`✅ Fetched ${articles.length} news articles for ${ticker} from Polygon.io`)

          return NextResponse.json({
            articles,
            ticker: ticker.toUpperCase(),
            source: 'polygon.io'
          })
        } else {
          console.warn(`⚠️ Polygon API returned ${response.status} for ${ticker}`)
        }
      } catch (polygonError) {
        console.error('Polygon.io news fetch error:', polygonError)
        // Continue to fallback
      }
    }

    // Fallback: Try using NewsAPI.org if available
    if (newsApiKey) {
      try {
        const newsApiResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(ticker + ' stock')}&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
          {
            next: { revalidate: 300 } // Cache for 5 minutes
          }
        )

        if (newsApiResponse.ok) {
          const newsData = await newsApiResponse.json()

          // Transform NewsAPI data to our format
          const articles: NewsItem[] = (newsData.articles || []).map((item: any, index: number) => ({
            id: item.url || `article-${index}`,
            title: item.title,
            description: item.description || 'No description available',
            url: item.url,
            image_url: item.urlToImage,
            published_at: item.publishedAt,
            source: item.source?.name || 'Unknown'
          }))

          console.log(`✅ Fetched ${articles.length} news articles for ${ticker} from NewsAPI.org`)

          return NextResponse.json({
            articles,
            ticker: ticker.toUpperCase(),
            source: 'newsapi.org'
          })
        }
      } catch (newsApiError) {
        console.error('NewsAPI.org fetch error:', newsApiError)
      }
    }

    // No API keys configured or all APIs failed
    console.warn('⚠️ No news API keys configured or all APIs failed')
    return NextResponse.json({
      articles: [],
      ticker: ticker.toUpperCase(),
      message: 'No news API configured. Please add NEXT_PUBLIC_POLYGON_API_KEY or NEWS_API_KEY to .env.local'
    })

  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch news',
        articles: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

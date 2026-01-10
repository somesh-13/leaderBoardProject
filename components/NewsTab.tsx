'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Calendar, AlertCircle, Newspaper } from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  image_url?: string
  published_at: string
  source: string
}

interface NewsTabProps {
  ticker: string
}

export default function NewsTab({ ticker }: NewsTabProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/news/${ticker}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data = await response.json()
        
        if (data.error) {
          setError(data.message || 'Failed to load news')
        } else {
          setArticles(data.articles || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news')
        console.error('Error fetching news:', err)
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchNews()
    }
  }, [ticker])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load News
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            News API may not be configured or the service is temporarily unavailable.
          </p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Newspaper className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No News Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are currently no news articles available for {ticker}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        >
          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Newspaper className="h-3 w-3" />
                    <span>{article.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <ExternalLink className="h-3 w-3" />
                    <span>Read more</span>
                  </div>
                </div>
              </div>
              {article.image_url && (
                <div className="w-32 h-24 flex-shrink-0">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface StockLinkProps {
  ticker: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export default function StockLink({ ticker, children, className = '', disabled = false }: StockLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    router.push(`/stocks/${ticker.toUpperCase()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      router.push(`/stocks/${ticker.toUpperCase()}`)
    }
  }

  if (disabled) {
    return <span className={className}>{children}</span>
  }

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded ${className}`}
      aria-label={`View details for ${ticker}`}
    >
      {children}
    </span>
  )
}
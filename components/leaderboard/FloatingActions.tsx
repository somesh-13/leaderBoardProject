'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, Filter, RotateCcw } from 'lucide-react'

interface FloatingActionsProps {
  onOpenFilters: () => void
  onResetFilters: () => void
}

export default function FloatingActions({ onOpenFilters, onResetFilters }: FloatingActionsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 md:hidden">
      <div className="flex flex-col gap-3">
        {/* Back to Top Button */}
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-6 w-6" />
          </button>
        )}

        {/* Filter Button */}
        <button
          onClick={onOpenFilters}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Open filters"
        >
          <Filter className="h-6 w-6" />
        </button>

        {/* Reset Filters Button */}
        <button
          onClick={onResetFilters}
          className="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Reset filters"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
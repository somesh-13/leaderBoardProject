'use client'

import { useEffect } from 'react'

export default function CSPScript() {
  useEffect(() => {
    // Only in development, add a more permissive CSP
    if (process.env.NODE_ENV === 'development') {
      const meta = document.createElement('meta')
      meta.httpEquiv = 'Content-Security-Policy'
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data: https:;"
      
      // Remove existing CSP meta if any
      const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
      if (existing) {
        existing.remove()
      }
      
      document.head.appendChild(meta)
    }
  }, [])

  return null
}
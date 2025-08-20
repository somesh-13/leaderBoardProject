import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wall Street Bets',
  description: 'Compete, Trade, Win! A web-based trading platform inspired by the Wall Street Bets community with leaderboards and strategy testing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:; img-src 'self' data: https: api.dicebear.com; connect-src 'self' https://api.polygon.io; object-src 'none'; base-uri 'self';"
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
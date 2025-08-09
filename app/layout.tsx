import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Navbar from '@/components/Navbar'
import CSPScript from './csp-script'

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
      <body className={inter.className}>
        <CSPScript />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
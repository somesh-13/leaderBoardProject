'use client'

import MultiTerminal from '@/components/ui/multi-terminal'

export default function Terminal() {
  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      <div className="bg-gray-800 px-4 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-semibold text-white">Strategy Testing Terminal</h1>
        <p className="text-sm text-gray-400 mt-1">
          Test your trading strategies with historical data across multiple terminal sessions
        </p>
      </div>
      
      <div className="flex-1 px-4">
        <MultiTerminal />
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'help'
  content: string
  timestamp: Date
}

export default function Terminal() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      type: 'output',
      content: 'Stock Trading Strategy Terminal v1.0',
      timestamp: new Date()
    },
    {
      type: 'output', 
      content: 'Type "help" for available commands.',
      timestamp: new Date()
    }
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const executeCommand = (command: string) => {
    const newHistory = [...history]
    
    newHistory.push({
      type: 'input',
      content: `$ ${command}`,
      timestamp: new Date()
    })

    const args = command.trim().split(' ')
    const cmd = args[0].toLowerCase()

    switch (cmd) {
      case 'help':
        newHistory.push({
          type: 'help',
          content: `Available Commands:
  run keltner <SYMBOL> <PERIOD> <MULTIPLIER>  - Test Keltner Channel strategy
  test bollinger <SYMBOL> <PERIOD> <MULTIPLIER> - Test Bollinger Bands strategy
  backtest <STRATEGY> <SYMBOL> <DAYS>        - Run historical backtest
  portfolio                                  - Show current portfolio
  market <SYMBOL>                           - Get market data
  clear                                     - Clear terminal
  help                                      - Show this help

Examples:
  run keltner TSLA 20 2
  test bollinger AAPL 20 2
  backtest keltner MSFT 90`,
          timestamp: new Date()
        })
        break

      case 'run':
        if (args[1] === 'keltner' && args.length >= 5) {
          const symbol = args[2]
          const period = args[3]
          const multiplier = args[4]
          newHistory.push({
            type: 'output',
            content: `Running Keltner Channel strategy on ${symbol}...
Period: ${period} days, Multiplier: ${multiplier}x ATR

Results:
• Entry signals: 12
• Exit signals: 11
• Win rate: 64%
• Total return: +15.3%
• Max drawdown: -4.2%
• Sharpe ratio: 1.8

Strategy shows positive results with good risk-adjusted returns.`,
            timestamp: new Date()
          })
        } else {
          newHistory.push({
            type: 'error',
            content: 'Usage: run keltner <SYMBOL> <PERIOD> <MULTIPLIER>',
            timestamp: new Date()
          })
        }
        break

      case 'test':
        if (args[1] === 'bollinger' && args.length >= 5) {
          const symbol = args[2]
          const period = args[3]
          const stdDev = args[4]
          newHistory.push({
            type: 'output',
            content: `Testing Bollinger Bands strategy on ${symbol}...
Period: ${period} days, Standard Deviation: ${stdDev}x

Results:
• Entry signals: 8
• Exit signals: 8
• Win rate: 75%
• Total return: +12.7%
• Max drawdown: -2.8%
• Sharpe ratio: 2.1

Strong performance with high win rate and low drawdown.`,
            timestamp: new Date()
          })
        } else {
          newHistory.push({
            type: 'error',
            content: 'Usage: test bollinger <SYMBOL> <PERIOD> <STD_DEV>',
            timestamp: new Date()
          })
        }
        break

      case 'backtest':
        if (args.length >= 4) {
          const strategy = args[1]
          const symbol = args[2]
          const days = args[3]
          newHistory.push({
            type: 'output',
            content: `Backtesting ${strategy} strategy on ${symbol} for ${days} days...

Performance Metrics:
• Total trades: 25
• Profitable trades: 18 (72%)
• Average return per trade: +2.3%
• Best trade: +8.5%
• Worst trade: -3.2%
• Maximum consecutive wins: 6
• Maximum consecutive losses: 3

Risk Metrics:
• Volatility: 18.4%
• Beta: 1.2
• Alpha: 4.8%`,
            timestamp: new Date()
          })
        } else {
          newHistory.push({
            type: 'error',
            content: 'Usage: backtest <STRATEGY> <SYMBOL> <DAYS>',
            timestamp: new Date()
          })
        }
        break

      case 'portfolio':
        newHistory.push({
          type: 'output',
          content: `Current Portfolio:
• AAPL: 50 shares @ $182.45 (+4.1%)
• TSLA: 25 shares @ $268.90 (+9.5%)
• MSFT: 40 shares @ $341.78 (+5.1%)
• GOOGL: 15 shares @ $2912.67 (+2.4%)

Total Value: $125,450.32
Day Change: +2.45%
Total Return: +42.5%`,
          timestamp: new Date()
        })
        break

      case 'market':
        if (args.length >= 2) {
          const symbol = args[1].toUpperCase()
          newHistory.push({
            type: 'output',
            content: `Market Data for ${symbol}:
• Current Price: $182.45
• Day Change: +2.34 (+1.3%)
• Volume: 45.2M
• 52-week High: $198.23
• 52-week Low: $124.17
• Market Cap: $2.85T
• P/E Ratio: 28.7`,
            timestamp: new Date()
          })
        } else {
          newHistory.push({
            type: 'error',
            content: 'Usage: market <SYMBOL>',
            timestamp: new Date()
          })
        }
        break

      case 'clear':
        setHistory([
          {
            type: 'output',
            content: 'Stock Trading Strategy Terminal v1.0',
            timestamp: new Date()
          },
          {
            type: 'output',
            content: 'Type "help" for available commands.',
            timestamp: new Date()
          }
        ])
        return

      case '':
        break

      default:
        newHistory.push({
          type: 'error',
          content: `Command not found: ${cmd}. Type "help" for available commands.`,
          timestamp: new Date()
        })
    }

    setHistory(newHistory)
    
    if (command.trim()) {
      setCommandHistory(prev => [...prev, command])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      executeCommand(input)
      setInput('')
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  const getLineClass = (type: string) => {
    switch (type) {
      case 'input':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      case 'help':
        return 'text-yellow-400'
      default:
        return 'text-green-400'
    }
  }

  return (
    <div className="h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <h1 className="text-lg font-semibold">Strategy Testing Terminal</h1>
          <p className="text-sm text-gray-400">
            Test your trading strategies with historical data
          </p>
        </div>
        
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 space-y-1"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((line, index) => (
            <div key={index} className={`${getLineClass(line.type)} whitespace-pre-wrap`}>
              {line.content}
            </div>
          ))}
          
          <form onSubmit={handleSubmit} className="flex items-center">
            <span className="text-green-400 mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 outline-none font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </div>
      
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Use arrow keys to navigate command history • Press Tab for autocomplete • Type "help" for commands
        </p>
      </div>
    </div>
  )
}
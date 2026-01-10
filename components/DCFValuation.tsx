'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface DCFValuationProps {
  ticker: string
  currentPrice: number
  companyName: string
}

interface AccordionSectionProps {
  id: string
  title: string
  borderColor: string
  icon: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ id, title, borderColor, icon, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
      <button
        onClick={onToggle}
        className={`w-full p-4 flex justify-between items-center bg-slate-800 hover:bg-slate-700 transition border-l-4 ${borderColor}`}
      >
        <span className="font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 space-y-6 bg-slate-900/50">
          {children}
        </div>
      </div>
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  formatValue: (value: number) => string
  description: string
  colorClass?: string
}

function Slider({ label, value, onChange, min, max, step, formatValue, description, colorClass = '' }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        <span className={`font-mono ${colorClass || 'text-emerald-400'}`}>{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer slider ${colorClass}`}
      />
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  )
}

export default function DCFValuation({ ticker, currentPrice, companyName }: DCFValuationProps) {
  // State for all inputs
  const [aiRevenue, setAiRevenue] = useState(920)
  const [aiMargin, setAiMargin] = useState(80)
  const [btcPrice, setBtcPrice] = useState(95000)
  const [btcMargin, setBtcMargin] = useState(35)
  const [netDebt, setNetDebt] = useState(787)
  const [capex, setCapex] = useState(50)
  const [fedRate, setFedRate] = useState(4.5)
  const [riskPremium, setRiskPremium] = useState(3.5)
  const [terminalMultiple, setTerminalMultiple] = useState(15)
  
  // Accordion states
  const [openSections, setOpenSections] = useState({
    ai: true,
    btc: false,
    cap: false,
    macro: false,
    val: false
  })

  // Calculation results
  const [results, setResults] = useState({
    fairPrice: 0,
    deltaPercent: 0,
    revenues: [0, 0, 0, 0, 0],
    opIncome: [0, 0, 0, 0, 0],
    fcf: [0, 0, 0, 0, 0]
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Constants
  const TAX_RATE = 0.21
  const SHARES_OUTSTANDING = 520
  const ANNUAL_BTC_PRODUCTION = 2200
  const years = [2026, 2027, 2028, 2029, 2030]

  // Calculate DCF whenever inputs change
  useEffect(() => {
    const calculate = () => {
      const totalDiscountRate = fedRate + riskPremium
      const discountRateDecimal = totalDiscountRate / 100
      const btcRev = (btcPrice * ANNUAL_BTC_PRODUCTION) / 1000000
      const currentAiRev = 25

      let totalPV = 0
      const revenues: number[] = []
      const opIncomeArr: number[] = []
      const fcfArr: number[] = []

      years.forEach((year, index) => {
        let rampFactor = 0
        if (year === 2026) rampFactor = 0.33
        else if (year === 2027) rampFactor = 0.66
        else rampFactor = 1.0

        const aiRev = currentAiRev + ((aiRevenue - currentAiRev) * rampFactor)
        const totalRevenue = aiRev + btcRev
        const opIncome = (aiRev * (aiMargin / 100)) + (btcRev * (btcMargin / 100))
        const tax = opIncome > 0 ? opIncome * TAX_RATE : 0
        const fcf = opIncome - tax - capex

        const n = index + 1
        const pv = fcf / Math.pow(1 + discountRateDecimal, n)
        totalPV += pv

        revenues.push(totalRevenue)
        opIncomeArr.push(opIncome)
        fcfArr.push(fcf)
      })

      const finalFCF = fcfArr[fcfArr.length - 1]
      const terminalValue = finalFCF * terminalMultiple
      const terminalPV = terminalValue / Math.pow(1 + discountRateDecimal, 5)

      const enterpriseValue = totalPV + terminalPV
      const equityValue = enterpriseValue - netDebt
      const fairPrice = equityValue / SHARES_OUTSTANDING

      const deltaPercent = ((fairPrice - currentPrice) / currentPrice) * 100

      setResults({
        fairPrice: Math.max(0, fairPrice),
        deltaPercent,
        revenues,
        opIncome: opIncomeArr,
        fcf: fcfArr
      })
    }

    calculate()
  }, [aiRevenue, aiMargin, btcPrice, btcMargin, netDebt, capex, fedRate, riskPremium, terminalMultiple, currentPrice])

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const maxVal = Math.max(...results.revenues) * 1.1
    const padding = 40
    const chartHeight = rect.height - padding * 2
    const chartWidth = rect.width - padding * 2
    const barWidth = (chartWidth / years.length) * 0.4
    const spacing = chartWidth / years.length

    years.forEach((year, i) => {
      const x = padding + (i * spacing) + (spacing / 2)

      // Revenue bar
      const revH = (results.revenues[i] / maxVal) * chartHeight
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.roundRect(x - barWidth, padding + (chartHeight - revH), barWidth * 2, revH, 4)
      ctx.fill()

      // FCF bar
      const fcfH = (results.fcf[i] / maxVal) * chartHeight
      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.roundRect(x - barWidth + 4, padding + (chartHeight - fcfH), barWidth * 2 - 8, fcfH, 4)
      ctx.fill()

      // Year label
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(year.toString(), x, rect.height - 10)
    })
  }, [results])

  const isPositive = results.deltaPercent > 0

  return (
    <div className="w-full">
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
          transition: transform 0.1s;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider.text-yellow-400::-webkit-slider-thumb {
          background: #eab308;
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.6);
        }
        .slider.text-red-400::-webkit-slider-thumb {
          background: #ef4444;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
        }
        .slider.text-blue-400::-webkit-slider-thumb {
          background: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        }
        .slider.text-purple-400::-webkit-slider-thumb {
          background: #a855f7;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 mb-1">
            DCF Valuation Model
          </h2>
          <p className="text-slate-400">Interactive Valuation Engine: From Mining to AI</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-sm text-slate-400">Current Market Price</div>
          <div className="text-2xl font-mono text-blue-400">${currentPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI / H100s */}
          <AccordionSection
            id="ai"
            title="🤖 The H100s (AI Cloud)"
            borderColor="border-emerald-500"
            isOpen={openSections.ai}
            onToggle={() => toggleSection('ai')}
            icon=""
          >
            <Slider
              label="Target 2028 Revenue"
              value={aiRevenue}
              onChange={setAiRevenue}
              min={200}
              max={2000}
              step={50}
              formatValue={(v) => `$${v}M`}
              description="Rent from Hyperscalers (Amazon/Fluidstack)."
              colorClass="text-emerald-400"
            />
            <Slider
              label="AI Operating Margin"
              value={aiMargin}
              onChange={setAiMargin}
              min={40}
              max={95}
              step={5}
              formatValue={(v) => `${v}%`}
              description="Profitability of data center leases."
              colorClass="text-emerald-400"
            />
          </AccordionSection>

          {/* Bitcoin / Hash */}
          <AccordionSection
            id="btc"
            title="₿ The Hash (Bitcoin)"
            borderColor="border-yellow-500"
            isOpen={openSections.btc}
            onToggle={() => toggleSection('btc')}
            icon=""
          >
            <Slider
              label="Bitcoin Price (Avg)"
              value={btcPrice}
              onChange={setBtcPrice}
              min={30000}
              max={200000}
              step={1000}
              formatValue={(v) => `$${v.toLocaleString()}`}
              description="Assumes ~2,200 BTC mined annually."
              colorClass="text-yellow-400"
            />
            <Slider
              label="Mining Margin"
              value={btcMargin}
              onChange={setBtcMargin}
              min={5}
              max={80}
              step={1}
              formatValue={(v) => `${v}%`}
              description="Profit after electricity & difficulty."
              colorClass="text-yellow-400"
            />
          </AccordionSection>

          {/* Balance Sheet */}
          <AccordionSection
            id="cap"
            title="🏦 Balance Sheet"
            borderColor="border-red-500"
            isOpen={openSections.cap}
            onToggle={() => toggleSection('cap')}
            icon=""
          >
            <Slider
              label="Net Debt"
              value={netDebt}
              onChange={setNetDebt}
              min={0}
              max={1500}
              step={10}
              formatValue={(v) => `$${v}M`}
              description="Total Debt minus Cash on hand."
              colorClass="text-red-400"
            />
            <Slider
              label="Annual CAPEX Spend"
              value={capex}
              onChange={setCapex}
              min={10}
              max={300}
              step={10}
              formatValue={(v) => `$${v}M`}
              description="Construction costs per year."
              colorClass="text-red-400"
            />
          </AccordionSection>

          {/* Macro Environment */}
          <AccordionSection
            id="macro"
            title="🏛️ Macro (Fed Rate)"
            borderColor="border-blue-500"
            isOpen={openSections.macro}
            onToggle={() => toggleSection('macro')}
            icon=""
          >
            <Slider
              label="Avg Fed Funds Rate"
              value={fedRate}
              onChange={setFedRate}
              min={0}
              max={10}
              step={0.25}
              formatValue={(v) => `${v.toFixed(2)}%`}
              description="Base interest rate for the next 5 years."
              colorClass="text-blue-400"
            />
            <div className="text-xs text-slate-400 bg-blue-900/20 p-3 rounded">
              <span className="font-bold">Impact:</span> Higher Fed rates increase the cost of capital (Discount Rate), lowering the present value of future cash flows.
            </div>
          </AccordionSection>

          {/* Valuation Settings */}
          <AccordionSection
            id="val"
            title="⚖️ Valuation Settings"
            borderColor="border-purple-500"
            isOpen={openSections.val}
            onToggle={() => toggleSection('val')}
            icon=""
          >
            <Slider
              label="Company Risk Premium"
              value={riskPremium}
              onChange={setRiskPremium}
              min={1}
              max={12}
              step={0.5}
              formatValue={(v) => `${v.toFixed(1)}%`}
              description="Extra return investors demand for holding stock."
              colorClass="text-purple-400"
            />
            <div className="flex justify-between items-center bg-purple-900/20 p-3 rounded border border-purple-500/30">
              <span className="text-sm font-medium text-purple-200">Total Discount Rate</span>
              <span className="font-bold font-mono text-white">{(fedRate + riskPremium).toFixed(2)}%</span>
            </div>
            <Slider
              label="Terminal Multiple"
              value={terminalMultiple}
              onChange={setTerminalMultiple}
              min={5}
              max={30}
              step={1}
              formatValue={(v) => `${v}x`}
              description="Exit multiple on 2030 Cash Flow."
              colorClass="text-purple-400"
            />
          </AccordionSection>

          <div className="text-xs text-slate-500 text-center mt-4">
            Fixed Assumptions: Tax Rate (21%), Shares (520M), Annual BTC (2,200)
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Result */}
          <div className="rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden bg-slate-800 border border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-900 to-yellow-900/10 pointer-events-none"></div>
            
            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2 relative z-10">
              Estimated Fair Share Price
            </h3>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-xl text-emerald-500 font-bold">$</span>
              <span className="text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-lg">
                {results.fairPrice.toFixed(2)}
              </span>
            </div>
            <div
              className={`mt-4 text-sm font-mono px-4 py-1.5 rounded-full border relative z-10 ${
                isPositive
                  ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-900/30 border-red-500/30 text-red-400'
              }`}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(results.deltaPercent).toFixed(1)}% vs Market ($
              {currentPrice.toFixed(2)})
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="rounded-xl p-6 flex flex-col bg-slate-800 border border-slate-700" style={{ height: '320px' }}>
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Cash Flow Forecast (2025 - 2030)</h3>
            <div className="flex-grow relative w-full">
              <canvas ref={canvasRef} className="w-full h-full" style={{ height: '240px' }}></canvas>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-600 rounded-sm"></div> Revenue
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Free Cash Flow
              </div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-xl p-6 overflow-x-auto bg-slate-800 border border-slate-700">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Metric</th>
                  <th className="px-4 py-3 text-right">2026</th>
                  <th className="px-4 py-3 text-right">2028 (Target)</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">2030</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="px-4 py-3 font-medium">Total Revenue</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    ${Math.round(results.revenues[0])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    ${Math.round(results.revenues[2])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    ${Math.round(results.revenues[4])}M
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Operating Income</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    ${Math.round(results.opIncome[0])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    ${Math.round(results.opIncome[2])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-400">
                    ${Math.round(results.opIncome[4])}M
                  </td>
                </tr>
                <tr className="bg-emerald-900/10">
                  <td className="px-4 py-3 font-bold text-emerald-400">Free Cash Flow</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">
                    ${Math.round(results.fcf[0])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-300">
                    ${Math.round(results.fcf[2])}M
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400">
                    ${Math.round(results.fcf[4])}M
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

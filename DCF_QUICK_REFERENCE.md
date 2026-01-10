# DCF Model - Quick Reference Card

## 📊 Updated Features (v2.0)

### New Controls

#### 🏦 Balance Sheet (Expanded)
- **Total Cash** (Green): $0M - $1,500M [Default: $713M]
- **Total Debt** (Red): $0M - $3,000M [Default: $1,500M]
- **Interest Rate** (Red): 0% - 15% [Default: 7.75%]
  - Auto-shows: Annual Interest Payment
- **Net Debt** (Auto): = Total Debt - Total Cash
- **CAPEX** (Red): $10M - $300M [Default: $50M]

#### 📉 Depreciation (NEW!)
- **Annual Depreciation** (Orange): $0M - $400M [Default: $100M]
- Purpose: Non-cash expense added back to FCF

---

## 🧮 Updated Formula

### Free Cash Flow (FCF)
```
FCF = (EBIT - Tax) + Depreciation - CAPEX

Where:
  EBIT = Operating Income
  Tax = EBIT × 21%
  Depreciation = User input
  CAPEX = User input
```

### Valuation
```
1. Present Value = Σ [FCF / (1 + Discount Rate)^n]
2. Terminal Value = Final FCF × Terminal Multiple
3. Enterprise Value = PV + Terminal Value
4. Equity Value = Enterprise Value - Net Debt
5. Share Price = Equity Value / 520M shares
```

---

## 🎨 Color Guide

| Color | Meaning | Example |
|-------|---------|---------|
| 🟢 Green | Assets/Revenue | Cash, AI Revenue |
| 🟡 Gold | Bitcoin | BTC Price, Mining |
| 🔴 Red | Liabilities/Costs | Debt, Interest, CAPEX |
| 🟠 Orange | Non-Cash | Depreciation |
| 🔵 Blue | Macro | Fed Rate |
| 🟣 Purple | Valuation | Risk Premium, Multiple |

---

## ⚡ Quick Tips

1. **Higher Depreciation** → Higher FCF → Higher Valuation
2. **Lower Interest Rate** → Same FCF, Lower Net Debt → Higher Valuation
3. **More Cash** → Lower Net Debt → Higher Equity Value
4. **Higher Debt** → Higher Interest + Higher Net Debt → Lower Valuation

---

## 📈 Common Scenarios

### Bull Case
- ↑ AI Revenue to $1,500M
- ↑ Depreciation to $200M
- ↓ Interest Rate to 5%
- → **Result:** 50%+ upside potential

### Base Case
- Keep defaults
- → **Result:** ~20-30% upside

### Bear Case
- ↓ AI Revenue to $400M
- ↑ Debt to $2,000M
- ↑ Fed Rate to 7%
- → **Result:** Potential overvaluation

---

## 🔢 Default Settings

| Category | Parameter | Default |
|----------|-----------|---------|
| **AI** | Target Revenue 2028 | $920M |
| | Operating Margin | 80% |
| **Bitcoin** | BTC Price | $95,000 |
| | Mining Margin | 35% |
| **Balance** | Total Cash | $713M |
| | Total Debt | $1,500M |
| | Interest Rate | 7.75% |
| | CAPEX | $50M |
| **Non-Cash** | Depreciation | $100M |
| **Macro** | Fed Rate | 4.5% |
| **Valuation** | Risk Premium | 3.5% |
| | Terminal Multiple | 15x |

---

## 🎯 Fixed Assumptions
- Tax Rate: 21%
- Shares Outstanding: 520M
- Annual BTC Production: 2,200
- Projection Years: 2026-2030 (5 years)

---

## 📱 Where to Find It
1. Navigate to any stock page (e.g., `/stocks/AAPL`)
2. Click **"DCF Valuation"** tab
3. All sections collapsed except AI (by default)
4. Click section headers to expand/collapse

---

## 💡 Pro Tips

### Sensitivity Analysis
Test multiple scenarios:
1. Save baseline results
2. Adjust one variable at a time
3. Note impact on fair value
4. Identify key drivers

### Key Drivers (Typical Order)
1. **AI Revenue** (Highest impact)
2. **Depreciation** (Medium-high impact)
3. **Terminal Multiple** (Medium impact)
4. **Net Debt** (Medium impact)
5. **Fed Rate** (Low-medium impact)

### Watch These Ratios
- **Interest Coverage**: EBIT / Annual Interest
  - Healthy: >3x
  - Warning: <2x
- **Debt/Equity**: Compare Net Debt to Market Cap
  - Conservative: <50%
  - Aggressive: >100%

---

## 🐛 Troubleshooting

**Issue:** Fair value shows $0.00
- **Fix:** Check if EBIT is negative, increase revenue or margins

**Issue:** Valuation seems too high
- **Fix:** Increase discount rate or lower terminal multiple

**Issue:** Can't see all controls
- **Fix:** Scroll down or expand accordion sections

---

## 📊 Understanding the Output

### Fair Price Display
```
$XX.XX
▲ +25.5% vs Market ($14.50)  ← Green = Undervalued
▼ -15.2% vs Market ($14.50)  ← Red = Overvalued
```

### Chart
- **Gray bars**: Total Revenue
- **Green bars**: Free Cash Flow
- Years: 2026, 2027, 2028, 2029, 2030

### Table
- Shows 2026, 2028 (target), 2030
- Metrics: Revenue, Operating Income, FCF

---

## 🚀 Version Info
- **Version:** 2.0
- **Updated:** December 14, 2024
- **Component:** `components/DCFValuation.tsx`
- **Lines of Code:** 633
- **Sections:** 6 (AI, Bitcoin, Balance Sheet, Depreciation, Macro, Valuation)

---

**Need Help?** Check the full documentation:
- `DCF_IMPLEMENTATION.md` - Technical details
- `DCF_USER_GUIDE.md` - Step-by-step guide
- `DCF_UPDATE_SUMMARY.md` - What changed
- `DCF_BEFORE_AFTER.md` - Visual comparison

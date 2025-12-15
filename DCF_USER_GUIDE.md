# DCF Valuation Tab - User Guide

## How to Access

1. Navigate to any stock detail page:
   - From the Market Screener (`/screener`), click on any stock ticker
   - Or directly visit: `/stocks/[TICKER]` (e.g., `/stocks/AAPL`, `/stocks/TSLA`)

2. Click on the **"DCF Valuation"** tab at the top of the page

## Interface Overview

### Left Panel: Input Controls (5 Sections)

#### 🤖 AI Cloud Revenue (Emerald Green)
- **Target 2028 Revenue**: Adjust expected revenue from AI/cloud services
- **AI Operating Margin**: Set the profitability margin for data center operations
- *Use Case*: Model scenarios for companies transitioning to AI infrastructure

#### ₿ Bitcoin Mining (Gold/Yellow)
- **Bitcoin Price**: Set average BTC price assumption
- **Mining Margin**: Adjust mining profitability after electricity costs
- *Use Case*: Value companies with cryptocurrency mining operations

#### 🏦 Balance Sheet (Red)
- **Net Debt**: Total debt minus cash on hand
- **Annual CAPEX**: Capital expenditure spending per year
- *Use Case*: Factor in company's debt load and investment requirements

#### 🏛️ Macro Environment (Blue)
- **Fed Funds Rate**: Expected average interest rate over projection period
- *Impact*: Higher rates = higher discount rate = lower present value

#### ⚖️ Valuation Settings (Purple)
- **Company Risk Premium**: Extra return demanded by investors
- **Total Discount Rate**: Automatically calculated (Fed Rate + Risk Premium)
- **Terminal Multiple**: Exit valuation multiple on final year cash flow

### Right Panel: Results

#### 1. Fair Share Price
Large display showing calculated fair value with:
- Dollar amount
- Percentage delta vs. current market price
- Visual indicator (green = undervalued, red = overvalued)

#### 2. Cash Flow Forecast Chart
Interactive canvas chart (2026-2030) showing:
- **Gray bars**: Total Revenue projections
- **Green bars**: Free Cash Flow projections

#### 3. Financial Breakdown Table
Key metrics for years 2026, 2028, and 2030:
- Total Revenue
- Operating Income
- Free Cash Flow

## How to Use

### Scenario Analysis

**Example 1: Bull Case**
- Increase AI Revenue to $1,500M
- Raise AI Margin to 85%
- Set BTC price to $150K
- See how fair value changes

**Example 2: Bear Case**
- Decrease AI Revenue to $400M
- Lower margins to 60%
- Increase net debt to $1,000M
- Raise Fed rate to 6%

**Example 3: Macro Sensitivity**
- Keep revenue/margin constant
- Vary Fed Rate from 2% to 8%
- Observe impact on valuation

### Interactive Features

- **Real-time Calculations**: All changes update instantly
- **Collapsible Sections**: Click section headers to expand/collapse
- **Visual Feedback**: Color-coded sliders match their category
- **Responsive Design**: Works on desktop, tablet, and mobile

## Understanding the Output

### Fair Price Interpretation
- **Positive Delta (Green)**: Model suggests stock is undervalued
- **Negative Delta (Red)**: Model suggests stock is overvalued
- **Example**: "+25.5% vs Market ($14.50)" means model shows 25.5% upside

### DCF Methodology

The calculator uses a standard Discounted Cash Flow model:

1. **Project Cash Flows** (5 years)
   - Revenue growth ramp: 33% (2026), 66% (2027), 100% (2028-2030)
   - Operating income = Revenue × Margin
   - Tax = Operating Income × 21%
   - Free Cash Flow = Operating Income - Tax - CAPEX

2. **Calculate Present Value**
   - Discount each year's FCF by: FCF / (1 + Discount Rate)^n
   - Sum all discounted cash flows

3. **Add Terminal Value**
   - Terminal Value = Final Year FCF × Terminal Multiple
   - Discount back 5 years to present value

4. **Calculate Equity Value**
   - Enterprise Value = Sum of PVs + Terminal PV
   - Equity Value = Enterprise Value - Net Debt
   - Fair Share Price = Equity Value / 520M shares

## Tips for Best Results

1. **Use Multiple Scenarios**: Don't rely on single estimate
2. **Compare to Peers**: Check similar companies' valuations
3. **Sensitivity Analysis**: Test key assumptions
4. **Update Regularly**: Refresh inputs as new data emerges
5. **Consider Limitations**: DCF is one tool among many

## Fixed Assumptions

These parameters are constant in the model:
- **Tax Rate**: 21% (U.S. corporate rate)
- **Shares Outstanding**: 520 million
- **BTC Production**: 2,200 BTC annually
- **Projection Period**: 2026-2030 (5 years)

## Technical Notes

- Chart renders using HTML5 Canvas for performance
- All calculations run client-side (no server calls)
- Values auto-format (M for millions, K for thousands)
- Sliders snap to logical increments for each parameter

---

**Pro Tip**: Bookmark your favorite stocks and check DCF valuations regularly as market conditions change!

// Real historical revenue data for major companies (in millions USD)
// Source: Company financial reports and SEC filings

export interface CompanyRevenueData {
  ticker: string
  companyName: string
  quarterly: Array<{
    year: number
    quarter: number
    revenue: number // in millions
  }>
  yearly: Array<{
    year: number
    revenue: number // in millions
  }>
}

export const REAL_REVENUE_DATA: Record<string, CompanyRevenueData> = {
  'GOOGL': {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 41159 },
      { year: 2020, quarter: 2, revenue: 38297 },
      { year: 2020, quarter: 3, revenue: 46173 },
      { year: 2020, quarter: 4, revenue: 56898 },
      // 2021
      { year: 2021, quarter: 1, revenue: 55314 },
      { year: 2021, quarter: 2, revenue: 61880 },
      { year: 2021, quarter: 3, revenue: 65118 },
      { year: 2021, quarter: 4, revenue: 75325 },
      // 2022
      { year: 2022, quarter: 1, revenue: 68011 },
      { year: 2022, quarter: 2, revenue: 69685 },
      { year: 2022, quarter: 3, revenue: 69092 },
      { year: 2022, quarter: 4, revenue: 76048 },
      // 2023
      { year: 2023, quarter: 1, revenue: 69787 },
      { year: 2023, quarter: 2, revenue: 74604 },
      { year: 2023, quarter: 3, revenue: 76693 },
      { year: 2023, quarter: 4, revenue: 86310 },
      // 2024
      { year: 2024, quarter: 1, revenue: 80539 },
      { year: 2024, quarter: 2, revenue: 84742 },
      { year: 2024, quarter: 3, revenue: 88268 },
    ],
    yearly: [
      { year: 2020, revenue: 182527 },
      { year: 2021, revenue: 257637 },
      { year: 2022, revenue: 282836 },
      { year: 2023, revenue: 307394 },
    ]
  },
  'AAPL': {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 58313 },
      { year: 2020, quarter: 2, revenue: 59685 },
      { year: 2020, quarter: 3, revenue: 64698 },
      { year: 2020, quarter: 4, revenue: 111439 },
      // 2021
      { year: 2021, quarter: 1, revenue: 89584 },
      { year: 2021, quarter: 2, revenue: 81434 },
      { year: 2021, quarter: 3, revenue: 83360 },
      { year: 2021, quarter: 4, revenue: 123945 },
      // 2022
      { year: 2022, quarter: 1, revenue: 97278 },
      { year: 2022, quarter: 2, revenue: 82959 },
      { year: 2022, quarter: 3, revenue: 90146 },
      { year: 2022, quarter: 4, revenue: 117154 },
      // 2023
      { year: 2023, quarter: 1, revenue: 94836 },
      { year: 2023, quarter: 2, revenue: 81797 },
      { year: 2023, quarter: 3, revenue: 89498 },
      { year: 2023, quarter: 4, revenue: 119575 },
      // 2024
      { year: 2024, quarter: 1, revenue: 90753 },
      { year: 2024, quarter: 2, revenue: 85777 },
      { year: 2024, quarter: 3, revenue: 94930 },
    ],
    yearly: [
      { year: 2020, revenue: 294135 },
      { year: 2021, revenue: 378323 },
      { year: 2022, revenue: 387537 },
      { year: 2023, revenue: 385706 },
    ]
  },
  'MSFT': {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 35021 },
      { year: 2020, quarter: 2, revenue: 38033 },
      { year: 2020, quarter: 3, revenue: 37154 },
      { year: 2020, quarter: 4, revenue: 43076 },
      // 2021
      { year: 2021, quarter: 1, revenue: 41706 },
      { year: 2021, quarter: 2, revenue: 46152 },
      { year: 2021, quarter: 3, revenue: 45317 },
      { year: 2021, quarter: 4, revenue: 51728 },
      // 2022
      { year: 2022, quarter: 1, revenue: 49360 },
      { year: 2022, quarter: 2, revenue: 51865 },
      { year: 2022, quarter: 3, revenue: 50122 },
      { year: 2022, quarter: 4, revenue: 52747 },
      // 2023
      { year: 2023, quarter: 1, revenue: 52857 },
      { year: 2023, quarter: 2, revenue: 56189 },
      { year: 2023, quarter: 3, revenue: 56517 },
      { year: 2023, quarter: 4, revenue: 62020 },
      // 2024
      { year: 2024, quarter: 1, revenue: 61858 },
      { year: 2024, quarter: 2, revenue: 64727 },
      { year: 2024, quarter: 3, revenue: 65585 },
    ],
    yearly: [
      { year: 2020, revenue: 153284 },
      { year: 2021, revenue: 184903 },
      { year: 2022, revenue: 204094 },
      { year: 2023, revenue: 227583 },
    ]
  },
  'TSLA': {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 5985 },
      { year: 2020, quarter: 2, revenue: 6036 },
      { year: 2020, quarter: 3, revenue: 8771 },
      { year: 2020, quarter: 4, revenue: 10744 },
      // 2021
      { year: 2021, quarter: 1, revenue: 10389 },
      { year: 2021, quarter: 2, revenue: 11958 },
      { year: 2021, quarter: 3, revenue: 13757 },
      { year: 2021, quarter: 4, revenue: 17719 },
      // 2022
      { year: 2022, quarter: 1, revenue: 18756 },
      { year: 2022, quarter: 2, revenue: 16934 },
      { year: 2022, quarter: 3, revenue: 21454 },
      { year: 2022, quarter: 4, revenue: 24318 },
      // 2023
      { year: 2023, quarter: 1, revenue: 23329 },
      { year: 2023, quarter: 2, revenue: 24927 },
      { year: 2023, quarter: 3, revenue: 23350 },
      { year: 2023, quarter: 4, revenue: 25167 },
      // 2024
      { year: 2024, quarter: 1, revenue: 21301 },
      { year: 2024, quarter: 2, revenue: 25500 },
      { year: 2024, quarter: 3, revenue: 25182 },
    ],
    yearly: [
      { year: 2020, revenue: 31536 },
      { year: 2021, revenue: 53823 },
      { year: 2022, revenue: 81462 },
      { year: 2023, revenue: 96773 },
    ]
  },
  'AMZN': {
    ticker: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 75452 },
      { year: 2020, quarter: 2, revenue: 88912 },
      { year: 2020, quarter: 3, revenue: 96145 },
      { year: 2020, quarter: 4, revenue: 125555 },
      // 2021
      { year: 2021, quarter: 1, revenue: 108518 },
      { year: 2021, quarter: 2, revenue: 113080 },
      { year: 2021, quarter: 3, revenue: 110812 },
      { year: 2021, quarter: 4, revenue: 137412 },
      // 2022
      { year: 2022, quarter: 1, revenue: 116444 },
      { year: 2022, quarter: 2, revenue: 121234 },
      { year: 2022, quarter: 3, revenue: 127101 },
      { year: 2022, quarter: 4, revenue: 149204 },
      // 2023
      { year: 2023, quarter: 1, revenue: 127358 },
      { year: 2023, quarter: 2, revenue: 134383 },
      { year: 2023, quarter: 3, revenue: 143083 },
      { year: 2023, quarter: 4, revenue: 169961 },
      // 2024
      { year: 2024, quarter: 1, revenue: 143313 },
      { year: 2024, quarter: 2, revenue: 147977 },
      { year: 2024, quarter: 3, revenue: 158877 },
    ],
    yearly: [
      { year: 2020, revenue: 386064 },
      { year: 2021, revenue: 469822 },
      { year: 2022, revenue: 513983 },
      { year: 2023, revenue: 574785 },
    ]
  },
  'META': {
    ticker: 'META',
    companyName: 'Meta Platforms, Inc.',
    quarterly: [
      // 2020
      { year: 2020, quarter: 1, revenue: 17737 },
      { year: 2020, quarter: 2, revenue: 18687 },
      { year: 2020, quarter: 3, revenue: 21470 },
      { year: 2020, quarter: 4, revenue: 28072 },
      // 2021
      { year: 2021, quarter: 1, revenue: 26171 },
      { year: 2021, quarter: 2, revenue: 29077 },
      { year: 2021, quarter: 3, revenue: 29010 },
      { year: 2021, quarter: 4, revenue: 33671 },
      // 2022
      { year: 2022, quarter: 1, revenue: 27908 },
      { year: 2022, quarter: 2, revenue: 28822 },
      { year: 2022, quarter: 3, revenue: 27714 },
      { year: 2022, quarter: 4, revenue: 32165 },
      // 2023
      { year: 2023, quarter: 1, revenue: 28645 },
      { year: 2023, quarter: 2, revenue: 31999 },
      { year: 2023, quarter: 3, revenue: 34146 },
      { year: 2023, quarter: 4, revenue: 40111 },
      // 2024
      { year: 2024, quarter: 1, revenue: 36455 },
      { year: 2024, quarter: 2, revenue: 39071 },
      { year: 2024, quarter: 3, revenue: 40589 },
    ],
    yearly: [
      { year: 2020, revenue: 85966 },
      { year: 2021, revenue: 117929 },
      { year: 2022, revenue: 116609 },
      { year: 2023, revenue: 134901 },
    ]
  },
  'NVDA': {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    quarterly: [
      // 2020 (Fiscal year 2021)
      { year: 2020, quarter: 1, revenue: 3080 },
      { year: 2020, quarter: 2, revenue: 3866 },
      { year: 2020, quarter: 3, revenue: 4726 },
      { year: 2020, quarter: 4, revenue: 5003 },
      // 2021 (Fiscal year 2022)
      { year: 2021, quarter: 1, revenue: 5661 },
      { year: 2021, quarter: 2, revenue: 6507 },
      { year: 2021, quarter: 3, revenue: 7103 },
      { year: 2021, quarter: 4, revenue: 7643 },
      // 2022 (Fiscal year 2023)
      { year: 2022, quarter: 1, revenue: 8288 },
      { year: 2022, quarter: 2, revenue: 6704 },
      { year: 2022, quarter: 3, revenue: 5931 },
      { year: 2022, quarter: 4, revenue: 6051 },
      // 2023 (Fiscal year 2024)
      { year: 2023, quarter: 1, revenue: 7192 },
      { year: 2023, quarter: 2, revenue: 13507 },
      { year: 2023, quarter: 3, revenue: 18120 },
      { year: 2023, quarter: 4, revenue: 22103 },
      // 2024 (Fiscal year 2025)
      { year: 2024, quarter: 1, revenue: 26044 },
      { year: 2024, quarter: 2, revenue: 30040 },
      { year: 2024, quarter: 3, revenue: 35082 },
    ],
    yearly: [
      { year: 2020, revenue: 16675 },
      { year: 2021, revenue: 26914 },
      { year: 2022, revenue: 26974 },
      { year: 2023, revenue: 60922 },
    ]
  }
}

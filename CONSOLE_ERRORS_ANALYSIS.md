# Console Errors Analysis - Most Common Issues

This document identifies the most common console error patterns found in the leaderboard project codebase, ranked by frequency and impact.

## Error Categories

### 1. Missing Stock Price Data ⚠️ (MOST COMMON)

**Frequency**: Very High - Logged multiple times per page load  
**Impact**: Medium - Falls back to defaults but causes calculation inconsistencies

#### Locations:
- `lib/utils/portfolioCalculations.ts:92-95` - Warning when stock data not found
- `app/api/stock-prices/route.ts:134` - Failed to fetch REAL data, using fallback
- `lib/store/portfolioStore.ts:291` - Could not calculate day change, using fallback
- `lib/services/priceService.ts:66,88` - Failed to fetch current/historical price

#### Error Pattern:
```typescript
// Common pattern found:
const stockData = stockPrices[position.symbol]
if (!stockData) {
  console.warn(`⚠️ No stock data found for ${position.symbol}`)
  return // Skips calculation for this position
}
```

#### Root Causes:
1. Stock symbol not in cache
2. Polygon API failed to return data for symbol
3. Symbol name mismatch (case sensitivity, formatting)
4. API rate limiting preventing price fetch

#### Example Console Output:
```
⚠️ No stock data found for AAPL
❌ Failed to fetch REAL data for TSLA: Returned null
⚠️ Using fallback data for TSLA due to API error
⚠️ Could not calculate day change for MSFT, using fallback
```

---

### 2. Array Operations on Undefined/Null Values 🔴 (HIGH RISK)

**Frequency**: High - Multiple components affected  
**Impact**: High - Can cause runtime crashes

#### Locations:
- `app/profile/[username]/ProfilePageClient.tsx:132-138` - `positions.reduce()` without check
- `app/leaderboard/page.tsx:100,103` - `entry.portfolio.includes()` without verification
- `app/api/portfolio/[username]/snapshot/route.ts:142` - `portfolioData.positions.map()` without null check
- `lib/services/portfolioService.ts:55` - Accessing `portfolioData.positions.length` without validation

#### Error Pattern:
```typescript
// Risky pattern:
const bestPosition = positions.reduce((best, pos) => 
  (pos.returnPct > (best?.returnPct || -Infinity)) ? pos : best, 
  positions[0] // ❌ positions[0] undefined if array is empty
)

// Or:
entry.portfolio.includes(filters.company) // ❌ portfolio might be undefined
```

#### Example Console Output:
```
TypeError: Cannot read property '0' of undefined
TypeError: Cannot read property 'includes' of undefined
TypeError: Cannot read property 'map' of undefined
```

#### Fix Pattern:
```typescript
// Safe pattern:
const bestPosition = positions && positions.length > 0 
  ? positions.reduce((best, pos) => 
      (pos.returnPct > (best?.returnPct || -Infinity)) ? pos : best, 
      positions[0]
    )
  : null

// Or:
entry.portfolio?.includes?.(filters.company) ?? false
```

---

### 3. External API Failures (Polygon.io) 🌐

**Frequency**: Medium-High - External dependency  
**Impact**: Medium - Affects real-time price updates

#### Locations:
- `lib/polygon.ts:108` - Error fetching batch from Polygon API
- `app/api/stock-prices/route.ts:134` - Failed to fetch REAL data for symbol
- `lib/services/priceService.ts:66,88` - Failed to fetch current/historical price
- `app/api/stocks/[ticker]/route.ts:171` - Error fetching from Polygon API

#### Error Pattern:
```typescript
try {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Polygon HTTP ${res.status}: ${errorText}`)
  }
} catch (error) {
  console.error(`❌ Error fetching batch:`, error)
  throw error // Propagates up
}
```

#### Root Causes:
1. Network connectivity issues
2. Polygon API key missing or invalid
3. Rate limiting (too many requests)
4. Invalid symbol ticker
5. API endpoint changes or downtime
6. CORS issues

#### Example Console Output:
```
❌ Error fetching batch: Error: Polygon HTTP 429: Rate limit exceeded
❌ Failed to fetch REAL data for AAPL: NetworkError
❌ Error fetching from Polygon API: TypeError: Failed to fetch
```

---

### 4. MongoDB Connection/Database Errors 💾

**Frequency**: Medium - Database operations  
**Impact**: High - Prevents data loading

#### Locations:
- `lib/db.ts:60` - MongoDB connection failed
- `lib/services/portfolioService.ts:62` - Error fetching portfolio from MongoDB
- `lib/utils/db.ts:43,65,87` - Multiple database operation errors

#### Error Pattern:
```typescript
try {
  await client.connect()
} catch (error) {
  console.error('❌ MongoDB connection failed:', error)
  throw error
}
```

#### Root Causes:
1. MongoDB connection string missing or invalid
2. Database server unavailable
3. Network issues preventing connection
4. Authentication failures
5. Collection doesn't exist
6. Query syntax errors

#### Example Console Output:
```
❌ MongoDB connection failed: MongoServerError: Authentication failed
❌ Error fetching portfolio for username: MongoNetworkError: connection timeout
❌ Error fetching user from database: MongoError: collection not found
```

---

### 5. Missing Null/Undefined Checks 🔍

**Frequency**: Medium - Defensive programming gaps  
**Impact**: Medium-High - Can cause crashes

#### Locations:
- `app/profile/[username]/ProfilePageClient.tsx:141` - `sectorAllocations[0]` without check
- `app/profile/[username]/ProfilePageClient.tsx:132-133` - `positions[0]` when empty
- `app/leaderboard/page.tsx:121-122` - Accessing `calculatedReturn` without check

#### Error Pattern:
```typescript
// Risky:
const primarySectorAllocation = sectorAllocations[0] // ❌ undefined if empty
const sector = primarySectorAllocation?.sector || 'N/A' // Safe but could fail earlier

// Or:
a.calculatedReturn !== undefined ? a.calculatedReturn : a.return // Good pattern
```

#### Example Console Output:
```
TypeError: Cannot read property 'sector' of undefined
TypeError: Cannot read property 'returnPct' of undefined
```

---

### 6. API Response Parsing Errors 📡

**Frequency**: Medium - SWR fetchers and API routes  
**Impact**: Medium - Breaks data flow

#### Locations:
- `lib/hooks/usePortfolio.ts:20-22` - API request failed when `data.success` is false
- `app/profile/[username]/ProfilePageClient.tsx:29-35` - Error handling for missing data
- `app/api/leaderboard/route.ts:145` - Leaderboard API error handling

#### Error Pattern:
```typescript
const data: APIResponse<any> = await response.json()
if (!data.success) {
  throw new Error(data.error || 'API request failed') // ❌ May not have error field
}

if (!data.data) {
  throw new Error('No data received') // ✅ Good check
}
```

#### Root Causes:
1. API returning unexpected structure
2. Error responses not following `APIResponse` format
3. Missing `success` or `data` fields
4. Network timeouts returning incomplete data

#### Example Console Output:
```
Error: API request failed
Error: No data received
TypeError: Cannot read property 'data' of undefined
```

---

### 7. Empty Array Operations 📋

**Frequency**: Low-Medium - Edge cases  
**Impact**: Medium - Breaks calculations

#### Locations:
- `app/profile/[username]/ProfilePageClient.tsx:132-138` - Reduce on empty positions
- `lib/hooks/usePortfolioData.ts:301` - `portfolio.positions.map()` without check

#### Error Pattern:
```typescript
// Risky:
const bestPosition = positions.reduce((best, pos) => 
  pos.returnPct > best.returnPct ? pos : best, 
  positions[0] // ❌ undefined if positions is []
)

// Or:
portfolio.positions.map(p => p.symbol) // ❌ error if positions is undefined
```

#### Example Console Output:
```
TypeError: Reduce of empty array with no initial value
TypeError: Cannot read property 'map' of undefined
```

---

### 8. useEffect Dependency Issues 🔄

**Frequency**: Low - React hooks  
**Impact**: Low-Medium - Performance issues, infinite loops

#### Locations:
- `lib/hooks/usePortfolio.ts:176` - `fetchPortfolio` in dependencies but recreated
- `app/stocks/[ticker]/StockDetailClient.tsx:147` - Complex dependency array

#### Error Pattern:
```typescript
useEffect(() => {
  fetchPortfolio() // Function recreated on every render
  const interval = setInterval(fetchPortfolio, intervalMs)
  return () => clearInterval(interval)
}, [username, intervalMs, fetchPortfolio]) // ❌ fetchPortfolio changes every render
```

#### Root Causes:
1. Functions in dependency arrays that aren't memoized
2. Missing dependencies causing stale closures
3. Unnecessary dependencies causing re-renders

#### Example Console Output:
```
Warning: React Hook useEffect has a missing dependency: 'fetchPortfolio'
Warning: Maximum update depth exceeded
```

---

## Error Frequency Summary

| Rank | Error Type | Frequency | Impact | Console Messages Found |
|------|-----------|-----------|--------|------------------------|
| 1 | Missing Stock Price Data | Very High | Medium | 15+ occurrences |
| 2 | Array Operations on Undefined | High | High | 10+ occurrences |
| 3 | Polygon API Failures | Medium-High | Medium | 8+ occurrences |
| 4 | MongoDB Errors | Medium | High | 6+ occurrences |
| 5 | Null Property Access | Medium | Medium-High | 5+ occurrences |
| 6 | API Response Errors | Medium | Medium | 4+ occurrences |
| 7 | Empty Array Operations | Low-Medium | Medium | 3+ occurrences |
| 8 | useEffect Dependencies | Low | Low-Medium | 2+ occurrences |

## Most Common Console Error Messages

Based on code analysis, these are the most frequently logged errors:

1. **`⚠️ No stock data found for {symbol}`** - Missing stock price data
2. **`❌ Failed to fetch REAL data for {symbol}`** - Polygon API failure
3. **`❌ Error fetching prices via priceService`** - Price service errors
4. **`❌ MongoDB connection failed`** - Database connection issues
5. **`❌ Error fetching portfolio for {username}`** - Portfolio fetch failures
6. **`TypeError: Cannot read property 'X' of undefined`** - Null/undefined access
7. **`TypeError: Cannot read property 'map' of undefined`** - Array operation on undefined
8. **`❌ API Route Error`** - Generic API route failures

## Recommended Fixes Priority

### High Priority (Fix Immediately)
1. ✅ Add null checks before all array operations (`.map()`, `.filter()`, `.reduce()`)
2. ✅ Validate `positions` array exists and has length before operations
3. ✅ Add fallback handling for missing stock data in calculations
4. ✅ Fix MongoDB error handling to prevent cascading failures

### Medium Priority (Fix Soon)
5. ✅ Implement retry logic for Polygon API failures
6. ✅ Add TypeScript strict null checks
7. ✅ Validate API response structure before processing
8. ✅ Add error boundaries in React components

### Low Priority (Fix When Possible)
9. ✅ Review and fix useEffect dependencies
10. ✅ Add comprehensive error logging with context
11. ✅ Implement error tracking/monitoring service
12. ✅ Add unit tests for error scenarios

## Code Examples: Before and After

### Example 1: Array Operations
**Before:**
```typescript
const bestPosition = positions.reduce((best, pos) => 
  (pos.returnPct > (best?.returnPct || -Infinity)) ? pos : best, 
  positions[0]
)
```

**After:**
```typescript
const bestPosition = positions && positions.length > 0
  ? positions.reduce((best, pos) => 
      (pos.returnPct > (best?.returnPct || -Infinity)) ? pos : best, 
      positions[0]
    )
  : null
```

### Example 2: Stock Data Missing
**Before:**
```typescript
const stockData = stockPrices[position.symbol]
const metrics = calculatePositionMetrics(position, stockData, historicalPrice)
```

**After:**
```typescript
const stockData = stockPrices[position.symbol]
if (!stockData) {
  console.warn(`⚠️ No stock data found for ${position.symbol}`)
  // Use fallback or skip this position
  return defaultMetrics
}
const metrics = calculatePositionMetrics(position, stockData, historicalPrice)
```

### Example 3: API Response Validation
**Before:**
```typescript
const data: APIResponse<any> = await response.json()
if (!data.success) {
  throw new Error(data.error || 'API request failed')
}
return data.data
```

**After:**
```typescript
const data: APIResponse<any> = await response.json()
if (!data || typeof data !== 'object') {
  throw new Error('Invalid API response format')
}
if (!data.success) {
  throw new Error(data.error || 'API request failed')
}
if (!data.data) {
  throw new Error('No data received from API')
}
return data.data
```

## Testing Error Scenarios

To verify fixes, test these scenarios:

1. **Missing Stock Data**: Use invalid stock symbol
2. **Empty Arrays**: Test with portfolios that have no positions
3. **API Failures**: Disconnect network or use invalid API key
4. **Database Errors**: Use invalid MongoDB connection string
5. **Null Values**: Pass undefined/null to functions expecting objects
6. **Empty Responses**: Mock API to return empty data

## Conclusion

The most critical issues are:
1. **Missing defensive programming** - Add null/undefined checks everywhere
2. **External API dependencies** - Need better error handling and retries
3. **Array operations** - Always validate arrays before operations
4. **Database resilience** - Better error handling for MongoDB operations

Focus on fixing High Priority items first to prevent the most common runtime errors.


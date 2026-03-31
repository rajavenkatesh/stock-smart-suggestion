---
name: smart-investment-portal
description: Build and maintain the Smart Investment Suggestion Portal - an AI-powered stock analysis and recommendation engine for Indian (NSE/BSE) and US markets.
---

# Smart Investment Suggestion Portal - Development Skill

## Overview
This skill provides comprehensive instructions for building an AI-powered investment suggestion web portal that analyzes stocks from both Indian (NSE/BSE) and US markets, providing actionable buy/sell/hold recommendations with entry prices, targets, and stop-loss levels.

## Architecture

### System Design
```
┌─────────────────────────────────────────────────┐
│              Frontend (Vite + Vanilla JS)         │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  IND Market  │  │  US Market  │  Market Tabs  │
│  └─────────────┘  └─────────────┘               │
│  ┌─────────────────────────────────┐             │
│  │  Long-Term │ Short-Term │ Swing │  Strategy   │
│  └─────────────────────────────────┘             │
│  ┌─────────────────────────────────┐             │
│  │  Stock Cards with AI Analysis   │  Results    │
│  └─────────────────────────────────┘             │
└────────────────────┬────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────┐
│              Backend (Node.js + Express)          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Data     │ │ Analysis │ │ AI Recommendation│ │
│  │ Fetcher  │ │ Engine   │ │ Engine (Gemini)  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└────────────────────┬────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
 Yahoo Finance   Alpha Vantage   Google Gemini AI
```

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5 + CSS3 + Vanilla JS | UI/UX with premium dark theme |
| Build Tool | Vite | Fast HMR, module bundling |
| Backend | Node.js + Express | API proxy, analysis orchestration |
| Data Provider | Yahoo Finance API | Real-time & historical stock data |
| AI Engine | Google Gemini Pro | Intelligent stock analysis & recommendations |
| Charts | Chart.js / Lightweight Charts | Price charts, technical indicators |
| Caching | In-memory (node-cache) | Reduce API calls, improve performance |

### Data Sources & What They Provide
1. **Yahoo Finance API** (via `yahoo-finance2`)
   - Real-time quotes (price, volume, market cap)
   - Historical OHLCV data (Open, High, Low, Close, Volume)
   - Company fundamentals (P/E, EPS, revenue, debt ratios)
   - Dividend history
   - Analyst recommendations

2. **Google Gemini AI**
   - Comprehensive stock analysis combining all data points
   - Sentiment analysis from market conditions
   - Pattern recognition in price movements
   - Risk assessment and recommendation generation

## Analysis Engine Design

### Technical Indicators Computed
| Indicator | Usage | Parameters |
|-----------|-------|------------|
| SMA (Simple Moving Average) | Trend direction | 20, 50, 200 period |
| EMA (Exponential Moving Average) | Trend with recency bias | 12, 26 period |
| RSI (Relative Strength Index) | Overbought/Oversold | 14 period |
| MACD | Trend momentum | 12, 26, 9 |
| Bollinger Bands | Volatility & price extremes | 20 period, 2 std dev |
| ATR (Average True Range) | Volatility measurement | 14 period |
| VWAP | Volume-weighted price | Intraday |
| Support/Resistance | Key price levels | Historical pivots |

### Fundamental Metrics Analyzed
| Metric | What It Tells Us |
|--------|-----------------|
| P/E Ratio | Valuation relative to earnings |
| P/B Ratio | Valuation relative to book value |
| Debt-to-Equity | Financial leverage risk |
| ROE / ROA | Management efficiency |
| Revenue Growth | Business momentum |
| Profit Margins | Operational efficiency |
| Free Cash Flow | Cash generation ability |
| Dividend Yield | Income potential |

### Signal Generation Rules

#### Long-Term Investment (6-12+ months)
- **BUY**: Strong fundamentals + undervalued + positive sector outlook
- **Target**: Based on DCF/peer valuation + 15-25% upside
- **Stop Loss**: 10-15% below entry (wider for volatile stocks)

#### Short-Term Trading (1-4 weeks)
- **BUY**: Technical breakout + volume confirmation + positive momentum
- **Target**: Next resistance level or 5-8% gain
- **Stop Loss**: Below recent support or 3-5%

#### Swing Trade (1-2 weeks, 5-10% target)
- **BUY**: RSI < 40 bouncing + MACD crossover + volume spike
- **Target**: 5-10% from entry
- **Stop Loss**: 2-3% below entry (tight risk management)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suggestions/:market/:strategy` | Get AI-powered stock suggestions |
| GET | `/api/stock/:symbol` | Detailed analysis for a specific stock |
| GET | `/api/stock/:symbol/history` | Historical price data |
| GET | `/api/trending/:market` | Trending stocks in market |
| GET | `/api/health` | Server health check |

### Query Parameters
- `market`: `ind` or `us`
- `strategy`: `long-term`, `short-term`, `swing`
- `limit`: Number of suggestions (default: 10)

## Frontend Pages & Components

### Market Tab Layout
```
┌──────────────────────────────────────────────┐
│  🏦 Smart Investment Portal                   │
│  ┌────────┐ ┌────────┐                        │
│  │🇮🇳 IND  │ │🇺🇸 US   │   Market Selector    │
│  └────────┘ └────────┘                        │
├──────────────────────────────────────────────┤
│  Strategy: [Long-Term] [Short-Term] [Swing]  │
├──────────────────────────────────────────────┤
│  ┌──────────────────────┐ ┌────────────────┐ │
│  │ 📊 Market Overview   │ │ 🔥 Top Picks   │ │
│  │ Nifty/Sensex or      │ │ AI-curated     │ │
│  │ S&P500/Nasdaq         │ │ suggestions    │ │
│  └──────────────────────┘ └────────────────┘ │
├──────────────────────────────────────────────┤
│  Stock Suggestion Cards (scrollable)         │
│  ┌─────────────────────────────────────────┐ │
│  │ RELIANCE / AAPL                          │ │
│  │ ₹2,450 / $175  ▲ 2.3%                   │ │
│  │ Signal: STRONG BUY                       │ │
│  │ Entry: ₹2,420  Target: ₹2,780  SL: ₹2,300│
│  │ ──────────────────────────────────────── │ │
│  │ Why this stock?                          │ │
│  │ ✅ Revenue growth 18% YoY               │ │
│  │ ✅ RSI at 35 (oversold bounce)           │ │
│  │ ✅ Strong institutional buying            │ │
│  │ ⚠️ High P/E but justified by growth      │ │
│  │ ──────────────────────────────────────── │ │
│  │ [View Details] [Add to Watchlist]        │ │
│  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Stock Detail Modal
- Interactive price chart with technical indicators
- Full fundamental analysis breakdown
- AI reasoning explanation (why buy/sell)
- Risk assessment meter
- Comparison with sector peers

## Environment Setup

### Required Environment Variables
```env
GEMINI_API_KEY=your_google_gemini_api_key
PORT=3000
NODE_ENV=development
```

### Installation & Running
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm run start
```

## Important Notes
1. **Disclaimer**: All suggestions are AI-generated and for educational purposes. Not financial advice.
2. **Rate Limiting**: Yahoo Finance has rate limits. Implement caching (5-10 min TTL).
3. **Market Hours**: Indian market (9:15 AM - 3:30 PM IST), US market (9:30 AM - 4:00 PM ET).
4. **Data Freshness**: Show timestamp of last data refresh to users.
5. **Error Handling**: Graceful fallbacks when APIs are unavailable.

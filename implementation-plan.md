Smart Investment Suggestion Portal — Implementation Plan
A full-stack, AI-powered web portal for stock analysis and investment recommendations across Indian (NSE/BSE) and US markets. Combines real-time market data, technical analysis, fundamental analysis, and Google Gemini AI to generate actionable buy/sell/hold signals.

User Review Required
IMPORTANT

Gemini API Key Required: You'll need to provide your Google Gemini API key for AI-powered analysis. The portal will still work without it (technical analysis only), but AI recommendations won't be available.

WARNING

Disclaimer: This portal generates suggestions for educational purposes only. All recommendations are AI-generated and should not be treated as professional financial advice. Always do your own due diligence.

Proposed Changes
Backend — Node.js + Express Server
[NEW] server/index.js
Express server with CORS, caching, error handling, and API routing.

[NEW] server/routes/api.js
REST API endpoints:

GET /api/suggestions/:market/:strategy — AI-generated stock picks
GET /api/stock/:symbol — Detailed single-stock analysis
GET /api/trending/:market — Market overview & trending stocks
[NEW] server/services/dataFetcher.js
Yahoo Finance integration for fetching:

Real-time quotes (price, volume, market cap, P/E, etc.)
Historical OHLCV data (6 months for technical analysis)
Company profile and financial metrics
[NEW] server/services/technicalAnalysis.js
Pure JS technical indicator calculations:

SMA/EMA (20, 50, 200 periods)
RSI (14 period)
MACD (12, 26, 9)
Bollinger Bands
Support/Resistance levels
Signal generation logic (BUY/SELL/HOLD)
[NEW] server/services/aiAnalyzer.js
Google Gemini AI integration:

Sends structured stock data (technical + fundamental) to Gemini
Receives detailed analysis with reasoning
Generates entry, target, and stop-loss prices
Provides pros/cons for each recommendation
[NEW] server/config/stockLists.js
Curated watchlists:

India: Nifty 50 blue-chips + momentum mid-caps (~40 stocks)
US: S&P 500 leaders + high-growth tech/stocks (~40 stocks)
Frontend — Premium Dark-Theme UI
[NEW] index.html
Main HTML with semantic structure, meta tags, Google Fonts (Inter).

[NEW] src/styles/main.css
Design system with:

CSS custom properties (dark theme, gradients, glass effects)
Typography scale, spacing system
Animations & transitions
Responsive grid system
[NEW] src/styles/components.css
Component styles for stock cards, modals, tabs, loading states, badges.

[NEW] src/js/app.js
Main application controller — routing, state management, event handlers.

[NEW] src/js/api.js
HTTP client for backend API communication.

[NEW] src/js/components.js
UI component builders — stock cards, market overview, detail modals.

Configuration
[NEW] package.json
Dependencies and build scripts.

[NEW] vite.config.js
Vite configuration with proxy to backend server.

[NEW] .env.example
Template for environment variables.

Verification Plan
Automated Tests
Run npm run dev and verify server starts on port 3000
Verify Vite dev server starts on port 5173
Test API endpoints via curl
Manual Verification
Browser test: Switch between IND/US market tabs
Verify stock cards render with real data
Test Long-Term, Short-Term, and Swing strategy toggles
Click stock cards to see detailed AI analysis
Verify responsive design on mobile viewport

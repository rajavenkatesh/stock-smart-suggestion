// ─────────────────────────────────────────────
// API Routes — Stock Analysis Endpoints
// ─────────────────────────────────────────────
import { Router } from 'express';
import { INDIAN_STOCKS, US_STOCKS, MARKET_INDICES } from '../config/stockLists.js';
import { getQuote, getHistoricalData, getCompanyDetails, getBatchQuotes } from '../services/dataFetcher.js';
import { analyzeStock, getStrategyTargets } from '../services/technicalAnalysis.js';
import { analyzeWithAI, getMarketSummary } from '../services/aiAnalyzer.js';

const router = Router();

/**
 * GET /api/suggestions/:market/:strategy
 * Returns AI-powered stock suggestions
 */
router.get('/suggestions/:market/:strategy', async (req, res) => {
  try {
    const { market, strategy } = req.params;
    const limit = parseInt(req.query.limit) || 8;

    if (!['ind', 'us'].includes(market)) {
      return res.status(400).json({ error: 'Market must be "ind" or "us"' });
    }
    if (!['long-term', 'short-term', 'swing'].includes(strategy)) {
      return res.status(400).json({ error: 'Strategy must be "long-term", "short-term", or "swing"' });
    }

    const stockList = market === 'ind' ? INDIAN_STOCKS : US_STOCKS;

    // Randomly pick a subset to analyze (to stay within API limits)
    const shuffled = [...stockList].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(limit + 6, stockList.length));

    // Fetch data for selected stocks in parallel
    const analysisPromises = selected.map(async (stock) => {
      try {
        const [quote, history, fundamentals] = await Promise.all([
          getQuote(stock.symbol),
          getHistoricalData(stock.symbol, '6mo'),
          getCompanyDetails(stock.symbol),
        ]);

        if (!quote || !history || history.length < 50) return null;

        const technicalAnalysis = analyzeStock(history);
        if (technicalAnalysis.error) return null;

        const strategyTargets = getStrategyTargets(technicalAnalysis, strategy);

        // Get AI analysis
        const aiAnalysis = await analyzeWithAI({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          quote,
          technicalAnalysis,
          fundamentals,
          strategy,
        });

        return {
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          quote,
          technicalAnalysis,
          strategyTargets,
          fundamentals,
          aiAnalysis,
        };
      } catch (err) {
        console.error(`Failed to analyze ${stock.symbol}:`, err.message);
        return null;
      }
    });

    const results = (await Promise.all(analysisPromises)).filter(Boolean);

    // Sort by recommendation strength
    const sortOrder = { 'STRONG BUY': 5, 'BUY': 4, 'HOLD': 3, 'SELL': 2, 'STRONG SELL': 1 };
    results.sort((a, b) => {
      const aRec = a.aiAnalysis?.recommendation || a.technicalAnalysis.recommendation;
      const bRec = b.aiAnalysis?.recommendation || b.technicalAnalysis.recommendation;
      return (sortOrder[bRec] || 0) - (sortOrder[aRec] || 0);
    });

    res.json({
      market,
      strategy,
      timestamp: new Date().toISOString(),
      count: Math.min(results.length, limit),
      suggestions: results.slice(0, limit),
    });
  } catch (err) {
    console.error('Error generating suggestions:', err);
    res.status(500).json({ error: 'Failed to generate suggestions', message: err.message });
  }
});

/**
 * GET /api/stock/:symbol
 * Detailed analysis for a single stock
 */
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const strategy = req.query.strategy || 'long-term';

    const [quote, history, fundamentals] = await Promise.all([
      getQuote(symbol),
      getHistoricalData(symbol, '1y'),
      getCompanyDetails(symbol),
    ]);

    if (!quote) {
      return res.status(404).json({ error: `Stock ${symbol} not found` });
    }

    const technicalAnalysis = history && history.length >= 50
      ? analyzeStock(history)
      : { error: 'Insufficient data' };

    const strategyTargets = technicalAnalysis.error
      ? null
      : getStrategyTargets(technicalAnalysis, strategy);

    // Find stock info
    const allStocks = [...INDIAN_STOCKS, ...US_STOCKS];
    const stockInfo = allStocks.find((s) => s.symbol === symbol) || { name: quote.name, sector: 'Unknown' };

    const aiAnalysis = await analyzeWithAI({
      symbol,
      name: stockInfo.name,
      sector: stockInfo.sector,
      quote,
      technicalAnalysis,
      fundamentals,
      strategy,
    });

    res.json({
      symbol,
      name: stockInfo.name,
      sector: stockInfo.sector,
      quote,
      technicalAnalysis,
      strategyTargets,
      fundamentals,
      aiAnalysis,
      historicalData: history?.slice(-90), // Last 90 days for charting
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Error analyzing stock ${req.params.symbol}:`, err);
    res.status(500).json({ error: 'Failed to analyze stock', message: err.message });
  }
});

/**
 * GET /api/trending/:market
 * Market overview with index data
 */
router.get('/trending/:market', async (req, res) => {
  try {
    const { market } = req.params;
    if (!['ind', 'us'].includes(market)) {
      return res.status(400).json({ error: 'Market must be "ind" or "us"' });
    }

    const indices = MARKET_INDICES[market];
    const indexQuotes = await getBatchQuotes(indices.map((i) => i.symbol));

    const indexData = indices.map((idx, i) => ({
      ...idx,
      ...indexQuotes[i],
    }));

    // Get market summary from AI
    const marketSummary = await getMarketSummary(market, indexData);

    // Get top movers
    const stockList = market === 'ind' ? INDIAN_STOCKS : US_STOCKS;
    const topSymbols = stockList.slice(0, 15).map((s) => s.symbol);
    const quotes = await getBatchQuotes(topSymbols);

    // Sort by absolute change percent
    const sorted = quotes
      .filter((q) => q && q.changePercent !== undefined)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    const topGainers = sorted.filter((q) => q.changePercent > 0).slice(0, 5);
    const topLosers = sorted.filter((q) => q.changePercent < 0).slice(0, 5);

    res.json({
      market,
      indices: indexData,
      marketSummary,
      topGainers,
      topLosers,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error fetching trending data:', err);
    res.status(500).json({ error: 'Failed to fetch market data', message: err.message });
  }
});

/**
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here',
  });
});

export default router;

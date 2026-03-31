// ─────────────────────────────────────────────
// Data Fetcher — Yahoo Finance Integration
// ─────────────────────────────────────────────
import YahooFinance from 'yahoo-finance2';
import NodeCache from 'node-cache';

const yahooFinance = new YahooFinance();
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 min cache

/**
 * Fetch real-time quote for a symbol
 */
export async function getQuote(symbol) {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const quote = await yahooFinance.quote(symbol);
    const result = {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      avgVolume: quote.averageDailyVolume3Month,
      marketCap: quote.marketCap,
      peRatio: quote.trailingPE || quote.forwardPE,
      forwardPE: quote.forwardPE,
      eps: quote.trailingEps,
      dividend: quote.dividendYield ? (quote.dividendYield * 100) : null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      currency: quote.currency || 'USD',
      exchange: quote.exchange,
    };
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Error fetching quote for ${symbol}:`, err.message);
    return null;
  }
}

/**
 * Fetch historical OHLCV data
 */
export async function getHistoricalData(symbol, period = '6mo') {
  const cacheKey = `history_${symbol}_${period}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '1mo': startDate.setMonth(startDate.getMonth() - 1); break;
      case '3mo': startDate.setMonth(startDate.getMonth() - 3); break;
      case '6mo': startDate.setMonth(startDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      case '2y': startDate.setFullYear(startDate.getFullYear() - 2); break;
      default: startDate.setMonth(startDate.getMonth() - 6);
    }

    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    if (!result || !result.quotes || result.quotes.length === 0) {
      return null;
    }

    const data = result.quotes
      .filter((q) => q.close !== null && q.close !== undefined)
      .map((q) => ({
        date: q.date,
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume,
      }));

    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`Error fetching historical data for ${symbol}:`, err.message);
    return null;
  }
}

/**
 * Fetch company fundamentals / summary
 */
export async function getCompanyDetails(symbol) {
  const cacheKey = `details_${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const [summaryDetail, defaultKeyStatistics, financialData] = await Promise.allSettled([
      yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail'] }),
      yahooFinance.quoteSummary(symbol, { modules: ['defaultKeyStatistics'] }),
      yahooFinance.quoteSummary(symbol, { modules: ['financialData'] }),
    ]);

    const sd = summaryDetail.status === 'fulfilled' ? summaryDetail.value?.summaryDetail : {};
    const ks = defaultKeyStatistics.status === 'fulfilled' ? defaultKeyStatistics.value?.defaultKeyStatistics : {};
    const fd = financialData.status === 'fulfilled' ? financialData.value?.financialData : {};

    const result = {
      // Valuation
      peRatio: sd?.trailingPE,
      forwardPE: sd?.forwardPE,
      pbRatio: ks?.priceToBook,
      pegRatio: ks?.pegRatio,

      // Profitability
      profitMargin: fd?.profitMargins,
      operatingMargin: fd?.operatingMargins,
      returnOnEquity: fd?.returnOnEquity,
      returnOnAssets: fd?.returnOnAssets,

      // Growth
      revenueGrowth: fd?.revenueGrowth,
      earningsGrowth: fd?.earningsGrowth,

      // Financial Health
      debtToEquity: fd?.debtToEquity,
      currentRatio: fd?.currentRatio,
      freeCashflow: fd?.freeCashflow,
      totalRevenue: fd?.totalRevenue,

      // Dividends
      dividendYield: sd?.dividendYield,
      payoutRatio: sd?.payoutRatio,

      // Other
      beta: sd?.beta,
      fiftyTwoWeekHigh: sd?.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: sd?.fiftyTwoWeekLow,
      targetMeanPrice: fd?.targetMeanPrice,
      recommendationMean: fd?.recommendationMean,
      recommendationKey: fd?.recommendationKey,
      numberOfAnalysts: fd?.numberOfAnalystOpinions,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Error fetching company details for ${symbol}:`, err.message);
    return {};
  }
}

/**
 * Batch fetch quotes for multiple symbols
 */
export async function getBatchQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));
  return results
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}

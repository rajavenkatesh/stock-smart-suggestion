// ─────────────────────────────────────────────
// AI Analyzer — Google Gemini Integration
// Provides intelligent stock analysis
// ─────────────────────────────────────────────
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Call Gemini API with structured prompt
 */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null; // Gracefully degrade without AI
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return { rawAnalysis: text };
    }
  } catch (err) {
    console.error('Gemini API call failed:', err.message);
    return null;
  }
}

/**
 * Generate AI-powered stock analysis
 */
export async function analyzeWithAI(stockData) {
  const {
    symbol, name, sector, quote, technicalAnalysis, fundamentals, strategy,
  } = stockData;

  const prompt = `You are a professional stock market analyst and trader with 20+ years of experience in both Indian (NSE/BSE) and US markets. Analyze the following stock and provide investment recommendation.

STOCK: ${name} (${symbol})
SECTOR: ${sector}
STRATEGY: ${strategy} (${strategy === 'long-term' ? '6-12 months' : strategy === 'short-term' ? '1-4 weeks' : '1-2 weeks for 5-10% gain'})

CURRENT MARKET DATA:
- Price: ${quote?.price} ${quote?.currency}
- Day Change: ${quote?.changePercent?.toFixed(2)}%
- Market Cap: ${formatMarketCap(quote?.marketCap)}
- P/E Ratio: ${quote?.peRatio || 'N/A'}
- EPS: ${quote?.eps || 'N/A'}
- 52-Week High: ${quote?.fiftyTwoWeekHigh}
- 52-Week Low: ${quote?.fiftyTwoWeekLow}
- Volume: ${quote?.volume?.toLocaleString()} (Avg: ${quote?.avgVolume?.toLocaleString()})

TECHNICAL ANALYSIS:
- RSI (14): ${technicalAnalysis?.indicators?.rsi}
- MACD: Line=${technicalAnalysis?.indicators?.macd?.line}, Signal=${technicalAnalysis?.indicators?.macd?.signal}
- SMA 20: ${technicalAnalysis?.indicators?.sma?.sma20}
- SMA 50: ${technicalAnalysis?.indicators?.sma?.sma50}
- SMA 200: ${technicalAnalysis?.indicators?.sma?.sma200}
- Bollinger: Upper=${technicalAnalysis?.indicators?.bollingerBands?.upper}, Lower=${technicalAnalysis?.indicators?.bollingerBands?.lower}
- ATR: ${technicalAnalysis?.indicators?.atr}
- Technical Score: ${technicalAnalysis?.score}/10
- Technical Signal: ${technicalAnalysis?.recommendation}
- Support: ${technicalAnalysis?.supportResistance?.support?.join(', ')}
- Resistance: ${technicalAnalysis?.supportResistance?.resistance?.join(', ')}

FUNDAMENTALS:
- Return on Equity: ${fundamentals?.returnOnEquity ? (fundamentals.returnOnEquity * 100).toFixed(1) + '%' : 'N/A'}
- Revenue Growth: ${fundamentals?.revenueGrowth ? (fundamentals.revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
- Profit Margin: ${fundamentals?.profitMargin ? (fundamentals.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
- Debt-to-Equity: ${fundamentals?.debtToEquity || 'N/A'}
- P/B Ratio: ${fundamentals?.pbRatio?.toFixed(2) || 'N/A'}
- Dividend Yield: ${fundamentals?.dividendYield ? (fundamentals.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
- Analyst Target: ${fundamentals?.targetMeanPrice || 'N/A'}
- Analyst Recommendation: ${fundamentals?.recommendationKey || 'N/A'}

Price Performance:
- 1 Day: ${technicalAnalysis?.change1d}%
- 5 Days: ${technicalAnalysis?.change5d}%
- 1 Month: ${technicalAnalysis?.change1m}%
- 3 Months: ${technicalAnalysis?.change3m}%

Respond in this exact JSON format:
{
  "recommendation": "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL",
  "confidence": 0-100,
  "summary": "2-3 sentence executive summary of why you're recommending this action",
  "entryPrice": number,
  "targetPrice": number,
  "stopLoss": number,
  "expectedReturn": "X%",
  "timeFrame": "string",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "positives": ["list of 3-5 key bullish factors"],
  "negatives": ["list of 2-4 key risk factors"],
  "technicalView": "1-2 sentence technical outlook",
  "fundamentalView": "1-2 sentence fundamental outlook",
  "catalysts": ["upcoming events or factors that could drive the price"]
}`;

  const aiResult = await callGemini(prompt);
  return aiResult;
}

/**
 * Generate market overview summary
 */
export async function getMarketSummary(market, indexData) {
  const prompt = `You are a senior market analyst. Provide a brief market summary for the ${market === 'ind' ? 'Indian (NSE/BSE)' : 'US'} stock market based on today's index performance.

Market Indices:
${indexData.map((i) => `${i.name}: ${i.price} (${i.changePercent > 0 ? '+' : ''}${i.changePercent?.toFixed(2)}%)`).join('\n')}

Respond in this exact JSON format:
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "summary": "2-3 sentence market summary",
  "keyDrivers": ["2-3 key market drivers today"],
  "outlook": "1 sentence short-term outlook"
}`;

  return await callGemini(prompt);
}

function formatMarketCap(cap) {
  if (!cap) return 'N/A';
  if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${(cap / 1e6).toFixed(2)}M`;
  return cap.toLocaleString();
}

// ─────────────────────────────────────────────
// Technical Analysis Engine
// Pure JS implementations of key indicators
// ─────────────────────────────────────────────

/**
 * Calculate Simple Moving Average
 */
export function sma(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;
      result.push(parseFloat(avg.toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculate Exponential Moving Average
 */
export function ema(data, period) {
  const result = [];
  const multiplier = 2 / (period + 1);

  // First EMA value is SMA
  let prevEma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < period - 1; i++) result.push(null);
  result.push(parseFloat(prevEma.toFixed(2)));

  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i] - prevEma) * multiplier + prevEma;
    result.push(parseFloat(currentEma.toFixed(2)));
    prevEma = currentEma;
  }
  return result;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function rsi(closes, period = 14) {
  const result = [];
  const gains = [];
  const losses = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Fill nulls for initial period
  for (let i = 0; i < period; i++) result.push(null);

  // First average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));

  // Subsequent values using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function macd(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEma = ema(closes, fastPeriod);
  const slowEma = ema(closes, slowPeriod);

  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (fastEma[i] === null || slowEma[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(parseFloat((fastEma[i] - slowEma[i]).toFixed(4)));
    }
  }

  // Signal line = EMA of MACD line
  const validMacd = macdLine.filter((v) => v !== null);
  const signalLine = ema(validMacd, signalPeriod);

  // Pad signal line to match length
  const padded = [];
  let idx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null) {
      padded.push(null);
    } else {
      padded.push(signalLine[idx] || null);
      idx++;
    }
  }

  // Histogram = MACD - Signal
  const histogram = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] === null || padded[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(parseFloat((macdLine[i] - padded[i]).toFixed(4)));
    }
  }

  return { macdLine, signalLine: padded, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function bollingerBands(closes, period = 20, stdDevMultiplier = 2) {
  const middle = sma(closes, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const avg = middle[i];
      const sqDiffs = slice.map((v) => Math.pow(v - avg, 2));
      const stdDev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / period);
      upper.push(parseFloat((avg + stdDevMultiplier * stdDev).toFixed(2)));
      lower.push(parseFloat((avg - stdDevMultiplier * stdDev).toFixed(2)));
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculate ATR (Average True Range)
 */
export function atr(highs, lows, closes, period = 14) {
  const trueRanges = [highs[0] - lows[0]];

  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  return sma(trueRanges, period);
}

/**
 * Find Support and Resistance Levels
 */
export function findSupportResistance(highs, lows, closes) {
  const recentCloses = closes.slice(-60);
  const recentHighs = highs.slice(-60);
  const recentLows = lows.slice(-60);

  // Find pivot points
  const pivotHighs = [];
  const pivotLows = [];

  for (let i = 2; i < recentHighs.length - 2; i++) {
    if (
      recentHighs[i] > recentHighs[i - 1] &&
      recentHighs[i] > recentHighs[i - 2] &&
      recentHighs[i] > recentHighs[i + 1] &&
      recentHighs[i] > recentHighs[i + 2]
    ) {
      pivotHighs.push(recentHighs[i]);
    }
    if (
      recentLows[i] < recentLows[i - 1] &&
      recentLows[i] < recentLows[i - 2] &&
      recentLows[i] < recentLows[i + 1] &&
      recentLows[i] < recentLows[i + 2]
    ) {
      pivotLows.push(recentLows[i]);
    }
  }

  // Cluster nearby levels
  const clusterLevels = (levels, threshold = 0.02) => {
    if (levels.length === 0) return [];
    levels.sort((a, b) => a - b);
    const clusters = [[levels[0]]];
    for (let i = 1; i < levels.length; i++) {
      const lastCluster = clusters[clusters.length - 1];
      const clusterAvg = lastCluster.reduce((a, b) => a + b, 0) / lastCluster.length;
      if (Math.abs(levels[i] - clusterAvg) / clusterAvg < threshold) {
        lastCluster.push(levels[i]);
      } else {
        clusters.push([levels[i]]);
      }
    }
    return clusters.map((c) => parseFloat((c.reduce((a, b) => a + b, 0) / c.length).toFixed(2)));
  };

  const currentPrice = closes[closes.length - 1];

  const resistanceLevels = clusterLevels(pivotHighs).filter((l) => l > currentPrice);
  const supportLevels = clusterLevels(pivotLows).filter((l) => l < currentPrice);

  return {
    support: supportLevels.slice(-3).reverse(), // Nearest 3 support levels
    resistance: resistanceLevels.slice(0, 3), // Nearest 3 resistance levels
  };
}

/**
 * Generate comprehensive technical analysis
 */
export function analyzeStock(historicalData) {
  if (!historicalData || historicalData.length < 50) {
    return { error: 'Insufficient historical data for analysis' };
  }

  const closes = historicalData.map((d) => d.close);
  const highs = historicalData.map((d) => d.high);
  const lows = historicalData.map((d) => d.low);
  const volumes = historicalData.map((d) => d.volume);

  const currentPrice = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];

  // Calculate all indicators
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, Math.min(200, closes.length - 1));
  const rsiValues = rsi(closes, 14);
  const macdData = macd(closes);
  const bbands = bollingerBands(closes);
  const atrValues = atr(highs, lows, closes, 14);
  const sr = findSupportResistance(highs, lows, closes);

  // Latest values
  const latestRsi = rsiValues[rsiValues.length - 1];
  const latestMacd = macdData.macdLine[macdData.macdLine.length - 1];
  const latestSignal = macdData.signalLine[macdData.signalLine.length - 1];
  const latestHistogram = macdData.histogram[macdData.histogram.length - 1];
  const latestSma20 = sma20[sma20.length - 1];
  const latestSma50 = sma50[sma50.length - 1];
  const latestSma200 = sma200[sma200.length - 1];
  const latestAtr = atrValues[atrValues.length - 1];
  const latestBBUpper = bbands.upper[bbands.upper.length - 1];
  const latestBBLower = bbands.lower[bbands.lower.length - 1];
  const latestBBMiddle = bbands.middle[bbands.middle.length - 1];

  // Volume analysis
  const avgVolume20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];
  const volumeRatio = currentVolume / avgVolume20;

  // Price change percentages
  const change1d = ((currentPrice - prevClose) / prevClose) * 100;
  const change5d = closes.length >= 6 ? ((currentPrice - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 : 0;
  const change1m = closes.length >= 22 ? ((currentPrice - closes[closes.length - 22]) / closes[closes.length - 22]) * 100 : 0;
  const change3m = closes.length >= 66 ? ((currentPrice - closes[closes.length - 66]) / closes[closes.length - 66]) * 100 : 0;

  // ─── Signal Scoring ───
  let score = 0;
  const signals = [];

  // RSI Signal
  if (latestRsi < 30) {
    score += 2;
    signals.push({ indicator: 'RSI', signal: 'OVERSOLD', detail: `RSI at ${latestRsi} — strong bounce potential`, bullish: true });
  } else if (latestRsi < 40) {
    score += 1;
    signals.push({ indicator: 'RSI', signal: 'NEAR OVERSOLD', detail: `RSI at ${latestRsi} — approaching buying zone`, bullish: true });
  } else if (latestRsi > 70) {
    score -= 2;
    signals.push({ indicator: 'RSI', signal: 'OVERBOUGHT', detail: `RSI at ${latestRsi} — likely pullback ahead`, bullish: false });
  } else if (latestRsi > 60) {
    score -= 0.5;
    signals.push({ indicator: 'RSI', signal: 'NEAR OVERBOUGHT', detail: `RSI at ${latestRsi} — caution advised`, bullish: false });
  } else {
    signals.push({ indicator: 'RSI', signal: 'NEUTRAL', detail: `RSI at ${latestRsi} — neutral zone`, bullish: null });
  }

  // MACD Signal
  if (latestMacd !== null && latestSignal !== null) {
    if (latestHistogram > 0 && macdData.histogram[macdData.histogram.length - 2] <= 0) {
      score += 2;
      signals.push({ indicator: 'MACD', signal: 'BULLISH CROSSOVER', detail: 'MACD just crossed above signal line', bullish: true });
    } else if (latestHistogram < 0 && macdData.histogram[macdData.histogram.length - 2] >= 0) {
      score -= 2;
      signals.push({ indicator: 'MACD', signal: 'BEARISH CROSSOVER', detail: 'MACD just crossed below signal line', bullish: false });
    } else if (latestHistogram > 0) {
      score += 1;
      signals.push({ indicator: 'MACD', signal: 'BULLISH', detail: 'MACD above signal line — positive momentum', bullish: true });
    } else {
      score -= 1;
      signals.push({ indicator: 'MACD', signal: 'BEARISH', detail: 'MACD below signal line — negative momentum', bullish: false });
    }
  }

  // Moving Average Signals
  if (latestSma20 && currentPrice > latestSma20) {
    score += 0.5;
    signals.push({ indicator: 'SMA 20', signal: 'ABOVE', detail: `Price above 20-day SMA (${latestSma20})`, bullish: true });
  } else if (latestSma20) {
    score -= 0.5;
    signals.push({ indicator: 'SMA 20', signal: 'BELOW', detail: `Price below 20-day SMA (${latestSma20})`, bullish: false });
  }

  if (latestSma50 && currentPrice > latestSma50) {
    score += 1;
    signals.push({ indicator: 'SMA 50', signal: 'ABOVE', detail: `Price above 50-day SMA (${latestSma50})`, bullish: true });
  } else if (latestSma50) {
    score -= 1;
    signals.push({ indicator: 'SMA 50', signal: 'BELOW', detail: `Price below 50-day SMA (${latestSma50})`, bullish: false });
  }

  if (latestSma200 && currentPrice > latestSma200) {
    score += 1.5;
    signals.push({ indicator: 'SMA 200', signal: 'ABOVE', detail: `Price above 200-day SMA — long-term uptrend`, bullish: true });
  } else if (latestSma200) {
    score -= 1.5;
    signals.push({ indicator: 'SMA 200', signal: 'BELOW', detail: `Price below 200-day SMA — long-term downtrend`, bullish: false });
  }

  // Golden/Death Cross
  if (latestSma50 && latestSma200) {
    if (latestSma50 > latestSma200) {
      score += 1;
      signals.push({ indicator: 'MA Cross', signal: 'GOLDEN CROSS', detail: '50 SMA above 200 SMA — bullish long-term', bullish: true });
    } else {
      score -= 1;
      signals.push({ indicator: 'MA Cross', signal: 'DEATH CROSS', detail: '50 SMA below 200 SMA — bearish long-term', bullish: false });
    }
  }

  // Bollinger Band Signal
  if (currentPrice <= latestBBLower) {
    score += 1.5;
    signals.push({ indicator: 'Bollinger', signal: 'AT LOWER BAND', detail: 'Price at lower Bollinger Band — potential bounce', bullish: true });
  } else if (currentPrice >= latestBBUpper) {
    score -= 1.5;
    signals.push({ indicator: 'Bollinger', signal: 'AT UPPER BAND', detail: 'Price at upper Bollinger Band — potential pullback', bullish: false });
  }

  // Volume Signal
  if (volumeRatio > 1.5 && change1d > 0) {
    score += 1;
    signals.push({ indicator: 'Volume', signal: 'HIGH VOLUME UP', detail: `${volumeRatio.toFixed(1)}x average volume with price up`, bullish: true });
  } else if (volumeRatio > 1.5 && change1d < 0) {
    score -= 1;
    signals.push({ indicator: 'Volume', signal: 'HIGH VOLUME DOWN', detail: `${volumeRatio.toFixed(1)}x average volume with price down`, bullish: false });
  }

  // Generate recommendation
  let recommendation, confidence;
  if (score >= 5) {
    recommendation = 'STRONG BUY';
    confidence = Math.min(95, 70 + score * 3);
  } else if (score >= 2) {
    recommendation = 'BUY';
    confidence = Math.min(85, 55 + score * 5);
  } else if (score >= -1) {
    recommendation = 'HOLD';
    confidence = 50 + Math.abs(score) * 5;
  } else if (score >= -4) {
    recommendation = 'SELL';
    confidence = Math.min(85, 55 + Math.abs(score) * 5);
  } else {
    recommendation = 'STRONG SELL';
    confidence = Math.min(95, 70 + Math.abs(score) * 3);
  }

  // Calculate target & stop loss
  const nearestResistance = sr.resistance[0] || currentPrice * 1.1;
  const nearestSupport = sr.support[0] || currentPrice * 0.9;

  return {
    currentPrice: parseFloat(currentPrice.toFixed(2)),
    change1d: parseFloat(change1d.toFixed(2)),
    change5d: parseFloat(change5d.toFixed(2)),
    change1m: parseFloat(change1m.toFixed(2)),
    change3m: parseFloat(change3m.toFixed(2)),
    recommendation,
    confidence: parseFloat(confidence.toFixed(0)),
    score: parseFloat(score.toFixed(1)),
    indicators: {
      rsi: latestRsi,
      macd: { line: latestMacd, signal: latestSignal, histogram: latestHistogram },
      sma: { sma20: latestSma20, sma50: latestSma50, sma200: latestSma200 },
      bollingerBands: { upper: latestBBUpper, middle: latestBBMiddle, lower: latestBBLower },
      atr: latestAtr,
      volumeRatio: parseFloat(volumeRatio.toFixed(2)),
    },
    supportResistance: sr,
    signals,
    priceTargets: {
      entryPrice: parseFloat(currentPrice.toFixed(2)),
      targetPrice: parseFloat(nearestResistance.toFixed(2)),
      stopLoss: parseFloat(nearestSupport.toFixed(2)),
      riskRewardRatio: parseFloat(((nearestResistance - currentPrice) / (currentPrice - nearestSupport)).toFixed(2)),
    },
  };
}

/**
 * Generate strategy-specific targets
 */
export function getStrategyTargets(analysis, strategy) {
  const { currentPrice, indicators, supportResistance } = analysis;
  const atrVal = indicators.atr || currentPrice * 0.02;

  switch (strategy) {
    case 'long-term':
      return {
        entryPrice: parseFloat(currentPrice.toFixed(2)),
        targetPrice: parseFloat((currentPrice * 1.20).toFixed(2)), // 20% upside
        stopLoss: parseFloat((currentPrice * 0.88).toFixed(2)), // 12% downside
        timeFrame: '6-12 months',
        riskReward: '1:1.67',
      };
    case 'short-term':
      return {
        entryPrice: parseFloat(currentPrice.toFixed(2)),
        targetPrice: parseFloat((currentPrice + atrVal * 3).toFixed(2)),
        stopLoss: parseFloat((currentPrice - atrVal * 1.5).toFixed(2)),
        timeFrame: '1-4 weeks',
        riskReward: '1:2',
      };
    case 'swing':
      return {
        entryPrice: parseFloat(currentPrice.toFixed(2)),
        targetPrice: parseFloat((currentPrice * 1.07).toFixed(2)), // 7% upside
        stopLoss: parseFloat((currentPrice * 0.97).toFixed(2)), // 3% downside
        timeFrame: '1-2 weeks',
        riskReward: '1:2.33',
      };
    default:
      return analysis.priceTargets;
  }
}

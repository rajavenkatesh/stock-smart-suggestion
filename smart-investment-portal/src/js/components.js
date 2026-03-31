// ─────────────────────────────────────────────
// UI Components — Build DOM elements for the portal
// ─────────────────────────────────────────────

/**
 * Format currency based on market
 */
export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return 'N/A';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format large numbers (market cap, volume, etc.)
 */
export function formatLargeNumber(num) {
  if (!num) return 'N/A';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}%`;
}

/**
 * Get CSS class for recommendation
 */
function getRecClass(rec) {
  if (!rec) return 'hold';
  return rec.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Arrow SVG for up/down
 */
function arrowSvg(up) {
  if (up) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
}

/**
 * Build Index Card
 */
export function buildIndexCard(data) {
  const isUp = (data.changePercent || data.change) >= 0;
  const div = document.createElement('div');
  div.className = `index-card ${isUp ? 'up' : 'down'}`;
  div.innerHTML = `
    <div class="index-name">${data.name || data.symbol}</div>
    <div class="index-price">${Number(data.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
    <div class="index-change ${isUp ? 'up' : 'down'}">
      ${arrowSvg(isUp)} ${formatPercent(data.changePercent)}
    </div>
  `;
  return div;
}

/**
 * Build Market Sentiment Block
 */
export function buildMarketSentiment(summary) {
  if (!summary) {
    return `
      <div class="sentiment-header">
        <span class="sentiment-badge neutral">Analyzing</span>
        <span style="font-size: var(--font-size-sm); color: var(--text-tertiary);">AI Market Analysis</span>
      </div>
      <p class="sentiment-text">Market sentiment analysis is being computed. This requires AI to be configured.</p>
    `;
  }

  const sentimentClass = (summary.sentiment || 'neutral').toLowerCase();
  return `
    <div class="sentiment-header">
      <span class="sentiment-badge ${sentimentClass}">${summary.sentiment || 'NEUTRAL'}</span>
      <span style="font-size: var(--font-size-sm); color: var(--text-tertiary);">🤖 AI Market Analysis</span>
    </div>
    <p class="sentiment-text">${summary.summary || 'No summary available.'}</p>
    ${summary.keyDrivers ? `
      <div class="sentiment-drivers">
        ${summary.keyDrivers.map(d => `<span class="driver-tag">${d}</span>`).join('')}
      </div>
    ` : ''}
    ${summary.outlook ? `<p class="sentiment-text" style="margin-top: var(--space-3); font-style: italic; color: var(--text-tertiary);">📈 ${summary.outlook}</p>` : ''}
  `;
}

/**
 * Build Mover Row
 */
export function buildMoverRow(data) {
  const isUp = data.changePercent >= 0;
  const div = document.createElement('div');
  div.className = 'mover-row';
  div.innerHTML = `
    <div>
      <div class="mover-name">${data.name || data.symbol}</div>
      <div class="mover-symbol">${data.symbol}</div>
    </div>
    <div class="mover-change ${isUp ? 'up' : 'down'}">${formatPercent(data.changePercent)}</div>
  `;
  return div;
}

/**
 * Build Stock Card
 */
export function buildStockCard(stock, index = 0) {
  const { symbol, name, sector, quote, technicalAnalysis, strategyTargets, aiAnalysis } = stock;
  const rec = aiAnalysis?.recommendation || technicalAnalysis?.recommendation || 'HOLD';
  const confidence = aiAnalysis?.confidence || technicalAnalysis?.confidence || 50;
  const currency = quote?.currency || 'USD';
  const isUp = (quote?.changePercent || 0) >= 0;

  const targets = {
    entry: aiAnalysis?.entryPrice || strategyTargets?.entryPrice || quote?.price,
    target: aiAnalysis?.targetPrice || strategyTargets?.targetPrice,
    stopLoss: aiAnalysis?.stopLoss || strategyTargets?.stopLoss,
  };

  // Get display symbol (remove .NS, .BO suffixes for cleaner display)
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '');

  const card = document.createElement('div');
  card.className = `stock-card ${getRecClass(rec)}`;
  card.style.animationDelay = `${index * 0.08}s`;
  card.dataset.symbol = symbol;

  // Build factors (positives/negatives)
  let factorsHtml = '';
  if (aiAnalysis?.positives) {
    const topFactors = aiAnalysis.positives.slice(0, 3);
    factorsHtml = `<div class="card-factors">
      ${topFactors.map(f => `<div class="factor-item"><span class="factor-icon positive">✅</span>${f}</div>`).join('')}
      ${aiAnalysis.negatives?.[0] ? `<div class="factor-item"><span class="factor-icon warning">⚠️</span>${aiAnalysis.negatives[0]}</div>` : ''}
    </div>`;
  } else if (technicalAnalysis?.signals) {
    const topSignals = technicalAnalysis.signals.filter(s => s.bullish !== null).slice(0, 3);
    factorsHtml = `<div class="card-factors">
      ${topSignals.map(s => `<div class="factor-item"><span class="factor-icon ${s.bullish ? 'positive' : 'negative'}">${s.bullish ? '✅' : '⚠️'}</span>${s.detail}</div>`).join('')}
    </div>`;
  }

  // Top signal chips
  let signalChipsHtml = '';
  if (technicalAnalysis?.signals) {
    const chips = technicalAnalysis.signals.slice(0, 4).map(s => {
      const cls = s.bullish === true ? 'bullish' : s.bullish === false ? 'bearish' : 'neutral';
      return `<span class="signal-chip ${cls}">${s.indicator}: ${s.signal}</span>`;
    });
    signalChipsHtml = `<div class="card-signals">${chips.join('')}</div>`;
  }

  card.innerHTML = `
    <div class="card-header">
      <div class="card-stock-info">
        <div class="card-symbol">${displaySymbol}</div>
        <div class="card-name">${name}</div>
        <div class="card-sector">${sector}</div>
      </div>
      <span class="rec-badge ${getRecClass(rec)}">${rec}</span>
    </div>

    <div class="card-price-section">
      <span class="card-price">${formatCurrency(quote?.price, currency)}</span>
      <span class="card-change ${isUp ? 'up' : 'down'}">
        ${arrowSvg(isUp)}
        ${formatPercent(quote?.changePercent)}
      </span>
    </div>

    <div class="card-targets">
      <div class="target-item entry">
        <div class="target-label">Entry</div>
        <div class="target-value">${formatCurrency(targets.entry, currency)}</div>
      </div>
      <div class="target-item target">
        <div class="target-label">Target</div>
        <div class="target-value">${formatCurrency(targets.target, currency)}</div>
      </div>
      <div class="target-item stoploss">
        <div class="target-label">Stop Loss</div>
        <div class="target-value">${formatCurrency(targets.stopLoss, currency)}</div>
      </div>
    </div>

    ${aiAnalysis?.summary ? `
      <div class="card-analysis">
        <p class="card-analysis-text">${aiAnalysis.summary}</p>
      </div>
    ` : ''}

    ${factorsHtml}
    ${signalChipsHtml}

    <div class="confidence-section">
      <div class="confidence-header">
        <span class="confidence-label">AI Confidence</span>
        <span class="confidence-value">${confidence}%</span>
      </div>
      <div class="confidence-bar">
        <div class="confidence-fill" style="width: ${confidence}%"></div>
      </div>
    </div>

    <div class="card-footer">
      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-label">Mkt Cap</span>
          <span class="meta-value">${formatLargeNumber(quote?.marketCap)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">P/E</span>
          <span class="meta-value">${quote?.peRatio ? quote.peRatio.toFixed(1) : 'N/A'}</span>
        </div>
      </div>
      <span class="card-action">Details →</span>
    </div>
  `;

  return card;
}

/**
 * Build Detail Modal Content
 */
export function buildModalContent(data) {
  const { symbol, name, sector, quote, technicalAnalysis, strategyTargets, fundamentals, aiAnalysis } = data;
  const rec = aiAnalysis?.recommendation || technicalAnalysis?.recommendation || 'HOLD';
  const confidence = aiAnalysis?.confidence || technicalAnalysis?.confidence || 50;
  const currency = quote?.currency || 'USD';
  const isUp = (quote?.changePercent || 0) >= 0;
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '');

  const targets = {
    entry: aiAnalysis?.entryPrice || strategyTargets?.entryPrice || quote?.price,
    target: aiAnalysis?.targetPrice || strategyTargets?.targetPrice,
    stopLoss: aiAnalysis?.stopLoss || strategyTargets?.stopLoss,
    expectedReturn: aiAnalysis?.expectedReturn || (strategyTargets ? `${(((strategyTargets.targetPrice - strategyTargets.entryPrice) / strategyTargets.entryPrice) * 100).toFixed(1)}%` : 'N/A'),
  };

  const riskLevel = aiAnalysis?.riskLevel || 'MEDIUM';

  return `
    <!-- Header -->
    <div class="modal-stock-header">
      <div class="modal-stock-title">
        <div class="modal-symbol">${displaySymbol}</div>
        <div class="modal-name">${name}</div>
        <span class="modal-sector-badge">${sector}</span>
      </div>
      <div class="modal-price-block">
        <div class="modal-price">${formatCurrency(quote?.price, currency)}</div>
        <div class="modal-change ${isUp ? 'up' : 'down'}">
          ${arrowSvg(isUp)} ${formatPercent(quote?.changePercent)} today
        </div>
        <div style="margin-top: var(--space-3);">
          <span class="rec-badge ${getRecClass(rec)}" style="font-size: var(--font-size-sm); padding: var(--space-2) var(--space-4);">${rec}</span>
        </div>
      </div>
    </div>

    <!-- AI Summary -->
    ${aiAnalysis?.summary ? `
      <div class="modal-section">
        <div class="ai-summary-block">
          <div class="ai-summary-title">🤖 AI Analysis Summary</div>
          <p class="ai-summary-text">${aiAnalysis.summary}</p>
          ${aiAnalysis.technicalView ? `<p class="ai-summary-text" style="margin-top: var(--space-2);"><strong>Technical:</strong> ${aiAnalysis.technicalView}</p>` : ''}
          ${aiAnalysis.fundamentalView ? `<p class="ai-summary-text" style="margin-top: var(--space-2);"><strong>Fundamental:</strong> ${aiAnalysis.fundamentalView}</p>` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Price Targets -->
    <div class="modal-section">
      <div class="modal-section-title">🎯 Price Targets</div>
      <div class="modal-targets-grid">
        <div class="modal-target-card entry">
          <div class="modal-target-label">Entry Price</div>
          <div class="modal-target-value">${formatCurrency(targets.entry, currency)}</div>
        </div>
        <div class="modal-target-card target">
          <div class="modal-target-label">Target Price</div>
          <div class="modal-target-value">${formatCurrency(targets.target, currency)}</div>
        </div>
        <div class="modal-target-card stoploss">
          <div class="modal-target-label">Stop Loss</div>
          <div class="modal-target-value">${formatCurrency(targets.stopLoss, currency)}</div>
        </div>
        <div class="modal-target-card return">
          <div class="modal-target-label">Expected Return</div>
          <div class="modal-target-value">${targets.expectedReturn}</div>
        </div>
      </div>
    </div>

    <!-- Risk Level -->
    <div class="modal-section">
      <div class="modal-section-title">⚖️ Risk Assessment</div>
      <div class="risk-meter">
        <span style="font-size: var(--font-size-sm); color: var(--text-tertiary); min-width: 80px;">Risk Level</span>
        <div class="risk-bar-container">
          <div class="risk-bar-fill ${riskLevel.toLowerCase()}"></div>
        </div>
        <span class="risk-label ${riskLevel.toLowerCase()}">${riskLevel}</span>
      </div>
    </div>

    <!-- Performance -->
    ${technicalAnalysis && !technicalAnalysis.error ? `
      <div class="modal-section">
        <div class="modal-section-title">📊 Price Performance</div>
        <div class="performance-grid">
          <div class="perf-item">
            <div class="perf-period">1 Day</div>
            <div class="perf-value ${technicalAnalysis.change1d >= 0 ? 'up' : 'down'}">${formatPercent(technicalAnalysis.change1d)}</div>
          </div>
          <div class="perf-item">
            <div class="perf-period">5 Days</div>
            <div class="perf-value ${technicalAnalysis.change5d >= 0 ? 'up' : 'down'}">${formatPercent(technicalAnalysis.change5d)}</div>
          </div>
          <div class="perf-item">
            <div class="perf-period">1 Month</div>
            <div class="perf-value ${technicalAnalysis.change1m >= 0 ? 'up' : 'down'}">${formatPercent(technicalAnalysis.change1m)}</div>
          </div>
          <div class="perf-item">
            <div class="perf-period">3 Months</div>
            <div class="perf-value ${technicalAnalysis.change3m >= 0 ? 'up' : 'down'}">${formatPercent(technicalAnalysis.change3m)}</div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Pros & Cons -->
    ${aiAnalysis?.positives || aiAnalysis?.negatives ? `
      <div class="modal-section">
        <div class="modal-section-title">📋 Key Factors</div>
        <div class="pros-cons-grid">
          <div class="pros-column">
            <div class="pros-title">✅ Bullish Factors</div>
            ${(aiAnalysis.positives || []).map(p => `<div class="pro-item"><span>•</span> ${p}</div>`).join('')}
          </div>
          <div class="cons-column">
            <div class="cons-title">⚠️ Risk Factors</div>
            ${(aiAnalysis.negatives || []).map(n => `<div class="con-item"><span>•</span> ${n}</div>`).join('')}
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Catalysts -->
    ${aiAnalysis?.catalysts ? `
      <div class="modal-section">
        <div class="modal-section-title">🚀 Upcoming Catalysts</div>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
          ${aiAnalysis.catalysts.map(c => `<span class="driver-tag" style="padding: var(--space-2) var(--space-3);">${c}</span>`).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Technical Indicators -->
    ${technicalAnalysis?.indicators ? `
      <div class="modal-section">
        <div class="modal-section-title">📈 Technical Indicators</div>
        <div class="indicators-grid">
          <div class="indicator-card">
            <div class="indicator-name">RSI (14)</div>
            <div class="indicator-value" style="color: ${technicalAnalysis.indicators.rsi < 30 ? 'var(--color-bullish)' : technicalAnalysis.indicators.rsi > 70 ? 'var(--color-bearish)' : 'var(--text-primary)'}">
              ${technicalAnalysis.indicators.rsi || 'N/A'}
            </div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">MACD</div>
            <div class="indicator-value">${technicalAnalysis.indicators.macd?.line || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">SMA 20</div>
            <div class="indicator-value">${technicalAnalysis.indicators.sma?.sma20 || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">SMA 50</div>
            <div class="indicator-value">${technicalAnalysis.indicators.sma?.sma50 || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">SMA 200</div>
            <div class="indicator-value">${technicalAnalysis.indicators.sma?.sma200 || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">ATR</div>
            <div class="indicator-value">${technicalAnalysis.indicators.atr || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">Volume Ratio</div>
            <div class="indicator-value">${technicalAnalysis.indicators.volumeRatio ? technicalAnalysis.indicators.volumeRatio + 'x' : 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">BB Upper</div>
            <div class="indicator-value">${technicalAnalysis.indicators.bollingerBands?.upper || 'N/A'}</div>
          </div>
          <div class="indicator-card">
            <div class="indicator-name">BB Lower</div>
            <div class="indicator-value">${technicalAnalysis.indicators.bollingerBands?.lower || 'N/A'}</div>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Technical Signals -->
    ${technicalAnalysis?.signals ? `
      <div class="modal-section">
        <div class="modal-section-title">🔔 Signal Breakdown</div>
        <div class="signals-list">
          ${technicalAnalysis.signals.map(s => {
            const cls = s.bullish === true ? 'bullish' : s.bullish === false ? 'bearish' : 'neutral';
            return `
              <div class="signal-row">
                <span class="signal-indicator-name">${s.indicator}</span>
                <span class="signal-badge ${cls}">${s.signal}</span>
                <span class="signal-detail">${s.detail}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Fundamentals -->
    ${fundamentals ? `
      <div class="modal-section">
        <div class="modal-section-title">🏢 Fundamental Analysis</div>
        <div class="fundamentals-grid">
          ${buildFundamentalCard('P/E Ratio', fundamentals.peRatio?.toFixed(1))}
          ${buildFundamentalCard('Forward P/E', fundamentals.forwardPE?.toFixed(1))}
          ${buildFundamentalCard('P/B Ratio', fundamentals.pbRatio?.toFixed(2))}
          ${buildFundamentalCard('PEG Ratio', fundamentals.pegRatio?.toFixed(2))}
          ${buildFundamentalCard('ROE', fundamentals.returnOnEquity ? (fundamentals.returnOnEquity * 100).toFixed(1) + '%' : null)}
          ${buildFundamentalCard('ROA', fundamentals.returnOnAssets ? (fundamentals.returnOnAssets * 100).toFixed(1) + '%' : null)}
          ${buildFundamentalCard('Profit Margin', fundamentals.profitMargin ? (fundamentals.profitMargin * 100).toFixed(1) + '%' : null)}
          ${buildFundamentalCard('Rev Growth', fundamentals.revenueGrowth ? (fundamentals.revenueGrowth * 100).toFixed(1) + '%' : null)}
          ${buildFundamentalCard('Debt/Equity', fundamentals.debtToEquity?.toFixed(1))}
          ${buildFundamentalCard('Current Ratio', fundamentals.currentRatio?.toFixed(2))}
          ${buildFundamentalCard('Div Yield', fundamentals.dividendYield ? (fundamentals.dividendYield * 100).toFixed(2) + '%' : null)}
          ${buildFundamentalCard('Beta', fundamentals.beta?.toFixed(2))}
          ${buildFundamentalCard('Analyst Target', fundamentals.targetMeanPrice ? formatCurrency(fundamentals.targetMeanPrice, currency) : null)}
          ${buildFundamentalCard('Analyst Rating', fundamentals.recommendationKey?.toUpperCase())}
          ${buildFundamentalCard('Total Revenue', fundamentals.totalRevenue ? formatLargeNumber(fundamentals.totalRevenue) : null)}
          ${buildFundamentalCard('Free Cash Flow', fundamentals.freeCashflow ? formatLargeNumber(fundamentals.freeCashflow) : null)}
        </div>
      </div>
    ` : ''}

    <!-- Support & Resistance -->
    ${technicalAnalysis?.supportResistance ? `
      <div class="modal-section">
        <div class="modal-section-title">📐 Support & Resistance Levels</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
          <div>
            <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-bullish); margin-bottom: var(--space-2);">Support Levels</div>
            ${technicalAnalysis.supportResistance.support.length > 0
              ? technicalAnalysis.supportResistance.support.map((s, i) =>
                `<div style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bullish-bg); border-radius: var(--radius-sm); margin-bottom: var(--space-1); font-family: var(--font-mono); font-size: var(--font-size-sm);">
                  <span style="color: var(--text-tertiary);">S${i + 1}</span>
                  <span style="color: var(--color-bullish); font-weight: 600;">${formatCurrency(s, currency)}</span>
                </div>`
              ).join('')
              : '<span style="font-size: var(--font-size-xs); color: var(--text-muted);">No clear support levels identified</span>'
            }
          </div>
          <div>
            <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-bearish); margin-bottom: var(--space-2);">Resistance Levels</div>
            ${technicalAnalysis.supportResistance.resistance.length > 0
              ? technicalAnalysis.supportResistance.resistance.map((r, i) =>
                `<div style="display: flex; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bearish-bg); border-radius: var(--radius-sm); margin-bottom: var(--space-1); font-family: var(--font-mono); font-size: var(--font-size-sm);">
                  <span style="color: var(--text-tertiary);">R${i + 1}</span>
                  <span style="color: var(--color-bearish); font-weight: 600;">${formatCurrency(r, currency)}</span>
                </div>`
              ).join('')
              : '<span style="font-size: var(--font-size-xs); color: var(--text-muted);">No clear resistance levels identified</span>'
            }
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Confidence -->
    <div class="modal-section">
      <div class="modal-section-title">🎯 AI Confidence Score</div>
      <div class="confidence-section">
        <div class="confidence-header">
          <span class="confidence-label">Overall Confidence</span>
          <span class="confidence-value">${confidence}%</span>
        </div>
        <div class="confidence-bar" style="height: 8px;">
          <div class="confidence-fill" style="width: ${confidence}%"></div>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <div style="margin-top: var(--space-6); padding: var(--space-4); background: var(--color-neutral-bg); border: 1px solid var(--color-neutral-border); border-radius: var(--radius-md);">
      <p style="font-size: var(--font-size-xs); color: var(--text-tertiary); line-height: 1.5;">
        ⚠️ <strong style="color: var(--color-neutral);">Disclaimer:</strong> This analysis is AI-generated for educational purposes only. It is not financial advice. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.
      </p>
    </div>
  `;
}

function buildFundamentalCard(name, value) {
  return `
    <div class="fundamental-card">
      <div class="fundamental-name">${name}</div>
      <div class="fundamental-value">${value || 'N/A'}</div>
    </div>
  `;
}

/**
 * Build skeleton loading cards
 */
export function buildSkeletonCards(count = 4) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card" style="animation: fadeIn 0.3s ease forwards; animation-delay: ${i * 0.1}s; opacity: 0;">
        <div class="skeleton skeleton-line short" style="height: 20px;"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-line long" style="height: 30px; margin-bottom: var(--space-5);"></div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div class="skeleton" style="height: 50px; border-radius: var(--radius-md);"></div>
          <div class="skeleton" style="height: 50px; border-radius: var(--radius-md);"></div>
          <div class="skeleton" style="height: 50px; border-radius: var(--radius-md);"></div>
        </div>
        <div class="skeleton skeleton-line long"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    `;
  }
  return html;
}

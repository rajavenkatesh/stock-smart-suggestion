// ─────────────────────────────────────────────
// API Client — Communicates with backend
// ─────────────────────────────────────────────

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API request failed: ${endpoint}`, err);
    throw err;
  }
}

/**
 * Check API health
 */
export async function checkHealth() {
  return request('/health');
}

/**
 * Get stock suggestions for a market and strategy
 * @param {'ind'|'us'} market
 * @param {'long-term'|'short-term'|'swing'} strategy
 * @param {number} limit
 */
export async function getSuggestions(market, strategy, limit = 8) {
  return request(`/suggestions/${market}/${strategy}?limit=${limit}`);
}

/**
 * Get detailed analysis for a specific stock
 * @param {string} symbol
 * @param {string} strategy
 */
export async function getStockDetail(symbol, strategy = 'long-term') {
  return request(`/stock/${encodeURIComponent(symbol)}?strategy=${strategy}`);
}

/**
 * Get trending data and market overview
 * @param {'ind'|'us'} market
 */
export async function getTrending(market) {
  return request(`/trending/${market}`);
}

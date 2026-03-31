// ─────────────────────────────────────────────
// App Controller — Main application logic
// ─────────────────────────────────────────────
import { checkHealth, getSuggestions, getStockDetail, getTrending } from './api.js';
import {
  buildIndexCard,
  buildMarketSentiment,
  buildMoverRow,
  buildStockCard,
  buildModalContent,
  buildSkeletonCards,
} from './components.js';

class SmartInvestApp {
  constructor() {
    // State
    this.currentMarket = 'ind';
    this.currentStrategy = 'long-term';
    this.suggestionsData = null;
    this.isLoading = false;

    // DOM elements
    this.els = {
      apiStatus: document.getElementById('api-status'),
      btnRefresh: document.getElementById('btn-refresh'),
      indicesGrid: document.getElementById('indices-grid'),
      marketSentiment: document.getElementById('market-sentiment'),
      topGainers: document.getElementById('top-gainers'),
      topLosers: document.getElementById('top-losers'),
      loadingState: document.getElementById('loading-state'),
      stockCardsGrid: document.getElementById('stock-cards-grid'),
      emptyState: document.getElementById('empty-state'),
      suggestionsTitle: document.getElementById('suggestions-title'),
      suggestionsDesc: document.getElementById('suggestions-desc'),
      dataTimestamp: document.getElementById('data-timestamp'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalContent: document.getElementById('modal-content'),
      modalClose: document.getElementById('modal-close'),
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.checkApiHealth();
    this.loadTrending();
    this.loadSuggestions();
  }

  bindEvents() {
    // Market tabs
    document.querySelectorAll('.market-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const market = tab.dataset.market;
        if (market === this.currentMarket) return;

        document.querySelectorAll('.market-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentMarket = market;
        this.loadTrending();
        this.loadSuggestions();
      });
    });

    // Strategy tabs
    document.querySelectorAll('.strategy-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const strategy = tab.dataset.strategy;
        if (strategy === this.currentStrategy) return;

        document.querySelectorAll('.strategy-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentStrategy = strategy;
        this.loadSuggestions();
      });
    });

    // Refresh
    this.els.btnRefresh.addEventListener('click', () => {
      this.els.btnRefresh.classList.add('spinning');
      setTimeout(() => this.els.btnRefresh.classList.remove('spinning'), 1000);
      this.loadTrending();
      this.loadSuggestions();
    });

    // Modal close
    this.els.modalClose.addEventListener('click', () => this.closeModal());
    this.els.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.els.modalOverlay) this.closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  // ─── API Health ───
  async checkApiHealth() {
    try {
      const health = await checkHealth();
      this.els.apiStatus.classList.add('connected');
      this.els.apiStatus.classList.remove('error');
      const statusText = this.els.apiStatus.querySelector('.status-text');
      if (health.geminiConfigured) {
        statusText.textContent = 'AI Connected';
      } else {
        statusText.textContent = 'Connected (No AI)';
      }
    } catch {
      this.els.apiStatus.classList.add('error');
      this.els.apiStatus.classList.remove('connected');
      this.els.apiStatus.querySelector('.status-text').textContent = 'Offline';
    }
  }

  // ─── Load Market Overview ───
  async loadTrending() {
    this.els.indicesGrid.innerHTML = '';
    this.els.topGainers.innerHTML = '<div class="skeleton skeleton-line long"></div>'.repeat(3);
    this.els.topLosers.innerHTML = '<div class="skeleton skeleton-line long"></div>'.repeat(3);
    this.els.marketSentiment.innerHTML = buildMarketSentiment(null);

    try {
      const data = await getTrending(this.currentMarket);

      // Render indices
      this.els.indicesGrid.innerHTML = '';
      if (data.indices) {
        data.indices.forEach((idx) => {
          this.els.indicesGrid.appendChild(buildIndexCard(idx));
        });
      }

      // Render sentiment
      this.els.marketSentiment.innerHTML = buildMarketSentiment(data.marketSummary);

      // Render movers
      this.els.topGainers.innerHTML = '';
      this.els.topLosers.innerHTML = '';

      if (data.topGainers) {
        data.topGainers.forEach((g) => {
          this.els.topGainers.appendChild(buildMoverRow(g));
        });
      }
      if (data.topLosers) {
        data.topLosers.forEach((l) => {
          this.els.topLosers.appendChild(buildMoverRow(l));
        });
      }

      if (!data.topGainers?.length) {
        this.els.topGainers.innerHTML = '<p style="font-size:var(--font-size-xs);color:var(--text-muted);padding:var(--space-3);">No data available</p>';
      }
      if (!data.topLosers?.length) {
        this.els.topLosers.innerHTML = '<p style="font-size:var(--font-size-xs);color:var(--text-muted);padding:var(--space-3);">No data available</p>';
      }
    } catch (err) {
      console.error('Failed to load trending:', err);
      this.els.indicesGrid.innerHTML = '<p style="color:var(--text-muted);font-size:var(--font-size-sm);padding:var(--space-4);">Failed to load market data. Check server connection.</p>';
      this.els.topGainers.innerHTML = '';
      this.els.topLosers.innerHTML = '';
    }
  }

  // ─── Load Stock Suggestions ───
  async loadSuggestions() {
    if (this.isLoading) return;
    this.isLoading = true;

    const marketLabel = this.currentMarket === 'ind' ? '🇮🇳 Indian Market' : '🇺🇸 US Market';
    const strategyLabels = {
      'long-term': 'Long-Term Investment',
      'short-term': 'Short-Term Trading',
      'swing': 'Swing Trade (5-10%)',
    };

    this.els.suggestionsTitle.textContent = `${marketLabel} — ${strategyLabels[this.currentStrategy]} Picks`;
    this.els.suggestionsDesc.textContent = 'Analyzing stocks with AI — this may take a moment...';

    // Show loading
    this.els.loadingState.style.display = 'flex';
    this.els.stockCardsGrid.style.display = 'none';
    this.els.emptyState.style.display = 'none';

    try {
      const data = await getSuggestions(this.currentMarket, this.currentStrategy, 8);
      this.suggestionsData = data;

      this.els.loadingState.style.display = 'none';

      if (!data.suggestions || data.suggestions.length === 0) {
        this.els.emptyState.style.display = 'flex';
        this.els.suggestionsDesc.textContent = 'No suggestions found. Try refreshing.';
      } else {
        this.els.stockCardsGrid.style.display = 'grid';
        this.els.stockCardsGrid.innerHTML = '';

        data.suggestions.forEach((stock, i) => {
          const card = buildStockCard(stock, i);
          card.addEventListener('click', () => this.openStockDetail(stock.symbol));
          this.els.stockCardsGrid.appendChild(card);
        });

        this.els.suggestionsDesc.textContent = `${data.count} stocks analyzed • Updated ${new Date(data.timestamp).toLocaleTimeString()}`;
        this.els.dataTimestamp.textContent = `Last updated: ${new Date(data.timestamp).toLocaleTimeString()}`;
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      this.els.loadingState.style.display = 'none';
      this.els.emptyState.style.display = 'flex';
      this.els.suggestionsDesc.textContent = 'Failed to load suggestions. Check server connection.';
    }

    this.isLoading = false;
  }

  // ─── Open Stock Detail Modal ───
  async openStockDetail(symbol) {
    this.els.modalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; padding: var(--space-16);">
        <div class="loading-spinner" style="margin-bottom: var(--space-6);">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">Loading detailed analysis...</p>
      </div>
    `;
    this.els.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      // First check if we have data from suggestions
      let stockData = this.suggestionsData?.suggestions?.find((s) => s.symbol === symbol);

      // If not found or need fresh data, fetch from API
      if (!stockData) {
        stockData = await getStockDetail(symbol, this.currentStrategy);
      }

      this.els.modalContent.innerHTML = buildModalContent(stockData);
    } catch (err) {
      console.error('Failed to load stock detail:', err);
      this.els.modalContent.innerHTML = `
        <div style="text-align: center; padding: var(--space-16);">
          <div style="font-size: 3rem; margin-bottom: var(--space-4);">❌</div>
          <h3 style="color: var(--text-secondary); margin-bottom: var(--space-2);">Failed to load details</h3>
          <p style="color: var(--text-tertiary); font-size: var(--font-size-sm);">${err.message}</p>
        </div>
      `;
    }
  }

  closeModal() {
    this.els.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Initialize app
const app = new SmartInvestApp();

// Expose globally for inline handlers
window.app = app;

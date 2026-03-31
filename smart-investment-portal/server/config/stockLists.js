// ─────────────────────────────────────────────
// Stock Universe — Curated lists for IND & US
// ─────────────────────────────────────────────

export const INDIAN_STOCKS = [
  // Nifty 50 Blue Chips
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy / Conglomerate' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT Services' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'FMCG' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom' },
  { symbol: 'ITC.NS', name: 'ITC Limited', sector: 'FMCG / Hotels' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro', sector: 'Infrastructure' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank', sector: 'Banking' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', sector: 'Paints / Chemicals' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Automobile' },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Consumer Goods' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma', sector: 'Pharmaceuticals' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'Financial Services' },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'IT Services' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies', sector: 'IT Services' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', sector: 'Cement' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Automobile' },
  { symbol: 'NTPC.NS', name: 'NTPC', sector: 'Power' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corp', sector: 'Power' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Metals & Mining' },
  { symbol: 'ONGC.NS', name: 'ONGC', sector: 'Oil & Gas' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', sector: 'Metals & Mining' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', sector: 'Conglomerate' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra', sector: 'IT Services' },
  { symbol: 'DRREDDY.NS', name: "Dr Reddy's Labs", sector: 'Pharmaceuticals' },
  { symbol: 'DIVISLAB.NS', name: "Divi's Laboratories", sector: 'Pharmaceuticals' },
  // Momentum Mid-caps
  { symbol: 'TRENT.NS', name: 'Trent (Zara India)', sector: 'Retail' },
  { symbol: 'ZOMATO.NS', name: 'Zomato', sector: 'Food Tech' },
  { symbol: 'POLICYBZR.NS', name: 'PB Fintech', sector: 'Fintech' },
  { symbol: 'DMART.NS', name: 'Avenue Supermarts (DMart)', sector: 'Retail' },
  { symbol: 'HAL.NS', name: 'Hindustan Aeronautics', sector: 'Defence' },
  { symbol: 'DIXON.NS', name: 'Dixon Technologies', sector: 'Electronics' },
  { symbol: 'PERSISTENT.NS', name: 'Persistent Systems', sector: 'IT Services' },
  { symbol: 'IRFC.NS', name: 'IRFC', sector: 'Railways / Finance' },
  { symbol: 'JIOFIN.NS', name: 'Jio Financial Services', sector: 'Financial Services' },
  { symbol: 'PAYTM.NS', name: 'One 97 Communications', sector: 'Fintech' },
];

export const US_STOCKS = [
  // Magnificent 7 + Tech Leaders
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce / Cloud' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Social Media / AI' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'EV / Energy' },
  // Semiconductors & AI
  { symbol: 'AMD', name: 'AMD Inc.', sector: 'Semiconductors' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Semiconductors' },
  { symbol: 'INTC', name: 'Intel Corp.', sector: 'Semiconductors' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'AI / Data Analytics' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'SaaS / CRM' },
  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Pharmaceuticals' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Pharmaceuticals' },
  // Finance
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Banking' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Payments' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Payments' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Investment Banking' },
  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail' },
  { symbol: 'COST', name: 'Costco Wholesale', sector: 'Retail' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Beverages' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Beverages / Snacks' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Sportswear' },
  { symbol: 'SBUX', name: 'Starbucks Corp.', sector: 'Restaurant' },
  // Industrial / Energy
  { symbol: 'BA', name: 'Boeing Co.', sector: 'Aerospace' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'XOM', name: 'ExxonMobil', sector: 'Energy' },
  // Growth
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Streaming' },
  { symbol: 'UBER', name: 'Uber Technologies', sector: 'Ride-sharing / Delivery' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Cloud Data' },
  { symbol: 'SQ', name: 'Block Inc.', sector: 'Fintech' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'E-Commerce Platform' },
  { symbol: 'COIN', name: 'Coinbase', sector: 'Crypto / Fintech' },
  { symbol: 'SOFI', name: 'SoFi Technologies', sector: 'Fintech' },
  { symbol: 'CRWD', name: 'CrowdStrike', sector: 'Cybersecurity' },
  { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Cloud / CDN' },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Cybersecurity' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Travel' },
];

export const MARKET_INDICES = {
  ind: [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
  ],
  us: [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^DJI', name: 'Dow Jones' },
  ],
};

You are a senior quantitative trader, AI engineer, and software architect.

Design and build a production-grade "Smart Investment Suggestion Portal" for Indian and US stock markets with the following requirements:

1. The system must analyze:
   - Historical price data (OHLC, volume)
   - Fundamental data (PE, EPS, revenue, debt)
   - Technical indicators (RSI, MACD, EMA, VWAP)
   - Market sentiment (news, social signals)
   - Institutional activity (FII/DII, insider trading)

2. The platform must generate:
   - Buy / Sell signals
   - Entry price
   - Target price
   - Stop-loss
   - Confidence score (% probability)
   - Risk level (Low / Medium / High)

3. Support:
   - Long-term investing (3+ years)
   - Short-term trading (days to weeks)
   - Swing trading (5–10% targets)

4. Must provide:
   - Clear explanation for each recommendation
   - Positive and negative factors
   - Backtesting results

5. Architecture must include:
   - Data ingestion pipelines (real-time + batch)
   - Feature engineering layer
   - ML model layer (prediction + classification)
   - Rule-based trading engine
   - API layer
   - Frontend dashboard

6. AI/ML requirements:
   - Use ensemble models (XGBoost, LSTM, Transformer)
   - Reinforcement learning for trade optimization
   - NLP for sentiment analysis

7. Tech stack:
   - Backend: Python (FastAPI)
   - Data: PostgreSQL + Redis + S3
   - ML: PyTorch / TensorFlow
   - Frontend: React / Next.js
   - Infra: Kubernetes + Docker
   - CI/CD: GitHub Actions

8. The system must scale for:
   - 10,000+ stocks
   - Real-time updates
   - Multi-region deployment

9. Provide:
   - Architecture diagram
   - Data flow
   - Model pipeline
   - API design
   - UI structure

10. Ensure:
   - Explainability (SHAP / feature importance)
   - Risk management
   - No overfitting

Output:
- Step-by-step implementation plan
- Modular architecture
- Code structure
- Sample APIs
- Sample UI layout

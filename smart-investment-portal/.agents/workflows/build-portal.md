---
description: How to build and run the Smart Investment Suggestion Portal from scratch
---

# Build the Smart Investment Portal

## Prerequisites
- Node.js 18+ installed
- Google Gemini API key (from Google AI Studio)
- Internet connection for stock data APIs

## Step-by-step Build Process

### 1. Initialize the Project
// turbo
```bash
cd smart-investment-portal && npm init -y
```

### 2. Install Backend Dependencies
```bash
npm install express cors yahoo-finance2 node-cache dotenv helmet compression
```

### 3. Install Dev Dependencies
```bash
npm install -D vite concurrently nodemon
```

### 4. Create Environment File
Create `.env` in the project root:
```env
GEMINI_API_KEY=your_key_here
PORT=3000
```

### 5. Build the Backend
Create the following files in order:
1. `server/index.js` - Express server entry point
2. `server/routes/api.js` - API route handlers
3. `server/services/dataFetcher.js` - Yahoo Finance data fetching service
4. `server/services/technicalAnalysis.js` - Technical indicator calculations
5. `server/services/aiAnalyzer.js` - Gemini AI integration for stock analysis
6. `server/config/stockLists.js` - Curated stock lists for IND/US markets

### 6. Build the Frontend
Create the following files:
1. `index.html` - Main HTML structure
2. `src/styles/main.css` - Design system & global styles
3. `src/styles/components.css` - Component-specific styles
4. `src/js/app.js` - Main application logic
5. `src/js/api.js` - API client service
6. `src/js/charts.js` - Chart rendering
7. `src/js/components.js` - UI component builders

### 7. Configure Build Scripts
Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"nodemon server/index.js\" \"vite\"",
    "build": "vite build",
    "start": "node server/index.js",
    "server": "nodemon server/index.js"
  }
}
```

### 8. Start Development Server
// turbo
```bash
npm run dev
```

### 9. Verify
- Open http://localhost:5173 in browser
- Check both IND and US market tabs
- Verify stock suggestions load
- Test switching between Long-Term, Short-Term, and Swing strategies
- Click a stock card to see detailed analysis

## Troubleshooting

### Yahoo Finance API Issues
- If rate limited, increase cache TTL in `server/services/dataFetcher.js`
- Some Indian stock symbols need `.NS` (NSE) or `.BO` (BSE) suffix

### Gemini API Issues
- Ensure GEMINI_API_KEY is set correctly in `.env`
- Check Google AI Studio for API quota
- Fallback analysis will work without AI (technical only)

### Port Conflicts
- Backend defaults to port 3000, frontend to 5173
- Change in `.env` and `vite.config.js` if needed

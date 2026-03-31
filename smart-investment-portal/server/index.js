// ─────────────────────────────────────────────
// Express Server — Smart Investment Portal
// ─────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());

// ─── API Routes ───
app.use('/api', apiRoutes);

// ─── Serve static files in production ───
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n🚀 Smart Investment Portal API running on http://localhost:${PORT}`);
  console.log(`📊 Gemini AI: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? '✅ Configured' : '⚠️  Not configured (set GEMINI_API_KEY in .env)'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;

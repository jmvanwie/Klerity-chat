// ✅ server.js — Main Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load env file
dotenv.config({ path: path.resolve(__dirname, '.env-klerity') });

import chatRouter from './routes/chat.js';

const app = express();
const port = process.env.PORT || 3001;

// ✅ Allowed Origins
const allowedOrigins = [
  'https://klerity-chat.firebaseapp.com',
  'https://klerity-chat.web.app',
  'http://localhost:5173'
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ Manual Preflight Response (IMPORTANT!)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(200);
});

// ✅ Middleware
app.use(express.json());

// ✅ Routes
app.use('/api/chat', chatRouter);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ Klerity backend is live.');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Klerity backend running at http://localhost:${port}`);
});

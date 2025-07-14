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

// ✅ Handle preflight
app.options('*', cors());

// ✅ CORS Setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  
}));

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
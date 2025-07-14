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

const allowedOrigins = [
  'https://klerity-chat.firebaseapp.com',
  'https://klerity-chat.web.app',
  'http://localhost:5173'
];

const app = express();
const port = process.env.PORT || 3001;

// ✅ CORS Middleware (must come before routes)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// ✅ Handle preflight
app.options('*', cors());

// ✅ Middleware
app.use(express.json());

// ✅ Routes
import chatRouter from './routes/chat.js';
app.use('/api/chat', chatRouter);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ Klerity backend is live.');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Klerity backend running at http://localhost:${port}`);
});

/// ✅ Load modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load env
dotenv.config({ path: path.resolve(__dirname, '.env-klerity') });

// ✅ Create app
const app = express();
const port = process.env.PORT || 3001;

// ✅ CORS Configuration
const allowedOrigins = [
  'https://klerity-chat.firebaseapp.com',
  'https://klerity-chat.web.app',
  'http://localhost:5173'
];

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

// ✅ Middleware
app.use(express.json());

// ✅ Routes
import chatRouter from './routes/chat.js';
app.use('/api/chat', chatRouter);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ Klerity backend is live.');
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Klerity backend running at http://localhost:${port}`);
});
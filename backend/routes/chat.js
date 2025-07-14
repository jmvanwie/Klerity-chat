
// ✅ routes/chat.js — Route for chat
import express from 'express';
import { handleChat } from '../controllers/aiController.js';

const router = express.Router();
router.post('/', handleChat);

export default router;
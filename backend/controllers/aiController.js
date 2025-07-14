// ✅ controllers/aiController.js — Logic to handle AI messages
import { GoogleGenerativeAI } from '@google/generative-ai';
import { performSearch } from '../utils/searchTool.js'; // Optional: if using real-time search

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const handleChat = async (req, res) => {
  try {
    const { history = [], message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message in request.' });
    }

    let finalMessage = message;

    // Optional: If using real-time search data for certain topics
    const searchKeywords = ["news", "latest", "reports", "uap", "sightings", "events"];
    const needsSearch = searchKeywords.some(k =>
      message.toLowerCase().includes(k)
    );

    if (needsSearch) {
      const searchResults = await performSearch(message); // make sure this utility exists
      finalMessage = `Use the following real-time info to answer the question.\n\n**Live Data:**\n${searchResults}\n\n**User's Query:** ${message}`;
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
};
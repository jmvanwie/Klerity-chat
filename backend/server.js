import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// A mock search tool function. In a real application, this would
// make an API call to a service like the Google Search API.
const performSearch = async (query) => {
  console.log(`Searching the web for: ${query}`);
  // Mock results for demonstration
  if (query.toLowerCase().includes("uap")) {
    return `
      **Source: Local News Outlet, Sarasota Herald-Tribune, July 2025**
      "Multiple residents in Southwest Florida, particularly in the Naples and Fort Myers areas, reported seeing a string of unusual, silent, fast-moving lights in a triangular formation. The sightings occurred over two nights. The local FAA office has stated they have no official comment at this time, but are reviewing radar data."

      **Source: Public Forum, UFOsOverFlorida.com, July 2025**
      "User 'skywatcher88' posted a blurry video of the SWFL lights, speculating they could be a new type of drone or military craft. Other users chimed in with similar sightings, noting the objects made no sound."

      **Source: AARO (All-domain Anomaly Resolution Office) Press Briefing Snippet, July 2025**
      "When asked about the recent Florida sightings, the AARO spokesperson stated, 'We are aware of the reports and are collecting data. We encourage the public to report any unusual aerial phenomena through official channels.'"
    `;
  }
  return "No relevant information found in a mock search.";
};

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/chat', async (req, res) => {
  try {
    const { history, message } = req.body;
    let finalMessage = message;

    // Check if the query should trigger a web search
    const lowerCaseMessage = message.toLowerCase();
    const searchKeywords = ["news", "latest", "reports", "uap", "sightings", "events"];
    const needsSearch = searchKeywords.some(keyword => lowerCaseMessage.includes(keyword));

    if (needsSearch) {
      console.log("Search-enabled query detected. Fetching live data...");
      const searchResults = await performSearch(message);
      // Prepend the search results as context for the AI
      finalMessage = `Based on the following real-time information, please synthesize a comprehensive answer to the user's query.\n\n**Live Data:**\n${searchResults}\n\n**User's Query:** ${message}`;
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    const text = response.text();
    
    res.send({ response: text });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).send({ error: 'Failed to process your request.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

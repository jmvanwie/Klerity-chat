// ✅ controllers/aiController.js — Logic to handle AI messages
import { GoogleGenerativeAI } from '@google/generative-ai';
import { performSearch } from '../utils/searchTool.js'; // Optional: if using real-time search

// No changes to initialization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

export const handleChat = async (req, res) => {
  try {
    const { history = [], message: combinedMessage } = req.body;

    if (!combinedMessage) {
      return res.status(400).json({ error: 'Missing message in request.' });
    }

    // --- 💡 NEW LOGIC: Separate System Instructions from User Message ---
    // We split the prompt that the frontend created.
    // The part BEFORE "---" is our system instructions.
    // The part AFTER "---" is the actual user query.
    const promptParts = combinedMessage.split('\n\n---\n\n');
    let systemInstruction = '';
    let userMessage = '';

    if (promptParts.length > 1) {
        systemInstruction = promptParts[0];
        userMessage = promptParts[1];
    } else {
        // Fallback if the separator isn't found
        userMessage = combinedMessage;
    }
    // --- End of New Logic ---

    // Optional: If using real-time search data for certain topics
    const searchKeywords = ["news", "latest", "reports", "uap", "sightings", "events"];
    const needsSearch = searchKeywords.some(k =>
      userMessage.toLowerCase().includes(k)
    );

    // This variable will hold the final message sent to the AI
    let finalMessage = userMessage; 

    if (needsSearch) {
      const searchResults = await performSearch(userMessage); // make sure this utility exists
      finalMessage = `Use the following real-time info to answer the question.\n\n**Live Data:**\n${searchResults}\n\n**User's Query:** ${userMessage}`;
    }

    // --- 💡 UPDATED MODEL CALL: Include System Instruction ---
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // This is the key change: we provide the instructions here.
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });
    // Now we only send the user's clean message.
    const result = await chat.sendMessage(finalMessage); 
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
};
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

    // --- Separate System Instructions from User Message ---
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
    
    // --- 💡 NEW LOGIC: Create a more forceful prompt ---
    // This reinforces the system instructions for better compliance.
    let finalMessage = userMessage; // Default message
    
    // Check if a specific task module was applied by looking for the "**Task:" marker
    const hasSpecificInstructions = systemInstruction.toLowerCase().includes('**task:');

    if (hasSpecificInstructions) {
        // This new prompt explicitly tells the AI to follow the system rules for the user's request.
        finalMessage = `Adhering strictly to the persona and rules defined in the system prompt, address the following user request. The formatting and structural requirements are non-negotiable.

User Request: "${userMessage}"`;
    }
    // --- End of New Logic ---

    // Optional: If using real-time search data for certain topics
    const searchKeywords = ["news", "latest", "reports", "uap", "sightings", "events"];
    const needsSearch = searchKeywords.some(k =>
      userMessage.toLowerCase().includes(k)
    );

    if (needsSearch) {
      const searchResults = await performSearch(userMessage); // make sure this utility exists
      // We inject the search results but keep the forceful instructions.
      finalMessage = `Use the following real-time info to answer the question.\n\n**Live Data:**\n${searchResults}\n\n**Instructions & User's Query:**\n${finalMessage}`;
    }

    // --- UPDATED MODEL CALL: Include System Instruction ---
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // The system instruction still sets the overall persona and rules.
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });
    // Now we send the more direct, forceful message.
    const result = await chat.sendMessage(finalMessage); 
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
};

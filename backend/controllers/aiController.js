// ✅ controllers/aiController.js — Logic to handle AI messages
import { GoogleGenerativeAI } from '@google/generative-ai';
import { performSearch } from '../utils/searchTool.js'; // Optional: if using real-time search

// No changes to initialization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

// --- 💡 NEW HELPER FUNCTION: Sleep for a specified duration ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        userMessage = combinedMessage;
    }
    
    // --- Create a more forceful prompt with a one-shot example ---
    let finalMessage = userMessage; 
    const hasSpecificInstructions = systemInstruction.toLowerCase().includes('**task:');

    if (hasSpecificInstructions) {
        let specificReminder = '';
        if (systemInstruction.toLowerCase().includes('recipe recommendations')) {
            specificReminder = `
You MUST present the answer using the following self-contained card format for each recipe. This is non-negotiable.

**Recipe Title**: [Title of the Recipe]
**Health Benefit**: [Brief, clear health benefit]
**Ingredients**:
- [Ingredient 1]
- [Ingredient 2]
**Instructions**:
1. [Step 1]
2. [Step 2]

Now, generate 2-3 diverse recipe cards based on the user's request using this exact structure. Do not deviate from this format.`;
        }
        
        finalMessage = `Strictly follow the persona and rules in the system prompt. ${specificReminder}

User Request: "${userMessage}"`;
    }
    
    // Optional: Real-time search logic
    const searchKeywords = ["news", "latest", "reports", "uap", "sightings", "events"];
    const needsSearch = searchKeywords.some(k => userMessage.toLowerCase().includes(k));

    if (needsSearch) {
      const searchResults = await performSearch(userMessage);
      finalMessage = `Use the following real-time info to answer the question.\n\n**Live Data:**\n${searchResults}\n\n**Instructions & User's Query:**\n${finalMessage}`;
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });

    // --- 💡 NEW RETRY LOGIC ---
    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await chat.sendMessage(finalMessage); 
            const response = await result.response;
            const text = response.text();
            return res.json({ response: text }); // Success, send response and exit
        } catch (err) {
            lastError = err;
            // Check if it's a 503 error, otherwise fail immediately
            if (err.status === 503) {
                console.warn(`⚠️ Attempt ${i + 1} failed with 503. Retrying in ${i + 1} second(s)...`);
                await sleep((i + 1) * 1000); // Wait 1s, then 2s, then 3s
            } else {
                // Not a retriable error, so break the loop
                throw err; 
            }
        }
    }
    // If all retries failed, throw the last error caught
    throw lastError;
    // --- End of Retry Logic ---

  } catch (err) {
    console.error("❌ Backend Error after retries:", err);
    res.status(500).json({ error: 'Failed to process your request after multiple attempts.' });
  }
};

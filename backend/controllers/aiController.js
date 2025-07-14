// ✅ controllers/aiController.js — Logic to handle AI messages
import { GoogleGenerativeAI } from '@google/generative-ai';
import { performSearch } from '../utils/searchTool.js'; // Optional: if using real-time search

// No changes to initialization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

// --- HELPER FUNCTION: Sleep for a specified duration ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- HELPER FUNCTION: Logic to call the AI model with retries ---
const callGenerativeModel = async (modelName, systemInstruction, history, finalMessage) => {
    const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });
    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await chat.sendMessage(finalMessage); 
            const response = await result.response;
            const text = response.text();
            return { response: text }; // Success, return response
        } catch (err) {
            lastError = err;
            if (err.status === 503) {
                console.warn(`⚠️ Model ${modelName}: Attempt ${i + 1} failed with 503. Retrying in ${i + 1} second(s)...`);
                await sleep((i + 1) * 1000);
            } else {
                throw err; // Not a retriable error
            }
        }
    }
    // If all retries failed, throw the last error
    throw lastError;
};


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
            // 💡 FINAL CHANGE: Explicitly command the use of newline characters (\n)
            specificReminder = `
You MUST present the answer using the following self-contained card format for each recipe. This is non-negotiable. Use '\\n' for all line breaks to ensure proper formatting.

**Recipe Title**: [Title of the Recipe]\\n
**Health Benefit**: [Brief, clear health benefit]\\n
**Ingredients**:\\n
- [Ingredient 1]\\n
- [Ingredient 2]\\n
**Instructions**:\\n
1. [Step 1]\\n
2. [Step 2]\\n

Now, generate 2-3 diverse recipe cards based on the user's request. Ensure all bolding and line breaks (\\n) are present in the final text output.`;
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

    // --- FALLBACK LOGIC ---
    try {
        // First, try the primary model
        console.log("Attempting to use primary model: gemini-1.5-flash");
        const result = await callGenerativeModel("gemini-1.5-flash", systemInstruction, history, finalMessage);
        return res.json(result);
    } catch (err) {
        // If the primary model fails with a 503 error after all retries, try the fallback
        if (err.status === 503) {
            console.error("❌ Primary model failed after all retries. Switching to fallback model.");
            try {
                // Now, try the fallback model
                console.log("Attempting to use fallback model: gemini-1.0-pro");
                const fallbackResult = await callGenerativeModel("gemini-1.0-pro", systemInstruction, history, finalMessage);
                return res.json(fallbackResult);
            } catch (fallbackErr) {
                // If the fallback also fails, then we report the final error
                throw fallbackErr;
            }
        } else {
            // If the error was not a 503, throw it immediately
            throw err;
        }
    }
    // --- End of Fallback Logic ---

  } catch (err) {
    console.error("❌ Backend Error after all fallbacks:", err);
    res.status(500).json({ error: 'The AI service is currently unavailable. Please try again later.' });
  }
};

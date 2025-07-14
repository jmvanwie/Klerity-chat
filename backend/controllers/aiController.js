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
        userMessage = combined.message;
    }
    
    // --- Create a more forceful prompt with a one-shot example ---
    let finalMessage = userMessage; 
    const hasSpecificInstructions = systemInstruction.toLowerCase().includes('**task:');

    if (hasSpecificInstructions) {
        let specificReminder = '';
        if (systemInstruction.toLowerCase().includes('recipe recommendations')) {
            // 💡 FINAL ATTEMPT: The most direct instruction possible.
            specificReminder = `
You will provide 2-3 recipes. Your entire response MUST follow the exact format of the example below. Do NOT include any introductory text, concluding text, or any other conversational text. Your output must be ONLY a series of recipe cards. This is a non-negotiable rule.

--- EXAMPLE START ---
**Recipe Title**: Lemon Herb Roasted Chicken
**Health Benefit**: An excellent source of lean protein, which is crucial for muscle repair and growth.
**Ingredients**:
- 1 whole chicken (about 4 lbs)
- 1 lemon, halved
- 4 sprigs of fresh rosemary
- 4 sprigs of fresh thyme
- 2 tablespoons olive oil
- Salt and black pepper to taste
**Instructions**:
1. Preheat oven to 425°F (220°C).
2. Pat the chicken dry with paper towels. Place herbs and lemon halves inside the chicken cavity.
3. Rub the outside of the chicken with olive oil and season generously with salt and pepper.
4. Roast for 1 hour to 1 hour 15 minutes, or until the juices run clear.
5. Let it rest for 10 minutes before carving.
--- EXAMPLE END ---

Now, generate the response for the user's request using this exact structure.`;
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

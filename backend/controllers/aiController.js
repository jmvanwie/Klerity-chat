// ✅ controllers/aiController.js — Refactored to use modular utilities
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Import your new utility modules ---
import { formatRules } from '../utils/formatRules.js';
import { buildSystemPrompt } from '../utils/systemPromptBuilder.js';
import { buildFinalMessage } from '../utils/messagebuilder.js'; 
import { validateResponse } from '../utils/responseValidator.js';

// No changes to initialization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

const AUTHORIZED_USERS = [
    'justin.vanwie@example.com',
    // Add any other authorized email addresses here
];
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
    throw lastError;
};


export const handleChat = async (req, res) => {
  try {
    // ✅ FIX: Make the controller more defensive against missing data from the frontend.
    const { history = [], message } = req.body;
    const taskTypeKey = req.body.taskTypeKey || 'default'; // Use 'default' if not provided.

    if (!message) {
      return res.status(400).json({ error: 'Missing message in request.' });
    }

    // --- NEW MODULAR LOGIC ---
    
    // 1. Build the System Prompt using the new builder and format rules
    const instructions = formatRules[taskTypeKey] || '';
    const systemInstruction = buildSystemPrompt(taskTypeKey, instructions);

    // 2. Build the Final Message to send to the AI
    const finalMessage = buildFinalMessage(taskTypeKey, message);
    
    // --- End of New Logic ---

    // --- FALLBACK LOGIC (Now uses the modular prompts) ---
    let result;
    try {
        console.log(`Attempting to use primary model: gemini-1.5-flash for task: ${taskTypeKey}`);
        result = await callGenerativeModel("gemini-1.5-flash", systemInstruction, history, finalMessage);
    } catch (err) {
        if (err.status === 503) {
            console.error("❌ Primary model failed. Switching to fallback model.");
            console.log(`Attempting to use fallback model: gemini-1.0-pro for task: ${taskTypeKey}`);
            result = await callGenerativeModel("gemini-1.0-pro", systemInstruction, history, finalMessage);
        } else {
            throw err; // Re-throw non-retriable errors
        }
    }
    
    // --- NEW: Validate the response ---
    const validation = validateResponse(taskTypeKey, result.response);
    if (!validation.valid) {
        console.warn(`⚠️ Validation FAILED for task [${taskTypeKey}]: ${validation.error}`);
        // For now, we log the error but still send the response.
        // In the future, you could retry or send a different message.
    } else {
        console.log(`✅ Validation PASSED for task [${taskTypeKey}].`);
    }

    return res.json(result);

  } catch (err) {
    console.error("❌ Backend Error after all fallbacks:", err);
    res.status(500).json({ error: 'The AI service is currently unavailable. Please try again later.' });
  }
};
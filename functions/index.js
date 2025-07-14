const functions = require("firebase-functions");
const axios = require("axios");

// --- YOUR ORIGINAL PROMPT ENGINEERING LOGIC (with one small fix) ---
const taskModules = {
    recipes: `**Task: Recipe Recommendations**\n- **Non-negotiable format:** Present each recipe as a self-contained card.\n- **Structure:** Each card MUST have these exact bolded headings: **Recipe Title**, **Health Benefit**, **Ingredients**, **Instructions**.\n- **Action First:** Do not ask for preferences first. Immediately provide 2-3 diverse recipe cards.\n- **Follow-up:** After providing the recipes, you may ask a single follow-up question about preferences.`,
    finance: `**Task: Market Trends & Finance**\n- Summarize current or historical trends using simple, accessible language.\n- Include relevant metrics (e.g., inflation rates, price changes, volume trends, stock movements).\n- When possible, incorporate charts or bullet-point breakdowns.\n- Analyze buyer behavior and volume patterns using publicly available data.\n- Provide predictive insights based on historical performance, macroeconomic indicators, or statistical trend models.\n- Compare simple investment strategies (e.g., index funds, growth stocks, bonds) when relevant.\n- Mention basic risk profiles (low, moderate, high) to help users understand potential outcomes.\n- Explain “why it matters” in the context of personal finance or investment strategy.`,
    homework: `**Task: Homework Help**\n- Break down explanations into simple, step-by-step reasoning.\n- Tailor depth based on grade level if provided (elementary, middle, high school).\n- Use analogies or examples to support understanding.\n- Offer multiple ways to explain difficult topics if possible.`,
    news: `**Task: Current Events & News Summaries**\n- Synthesize information from your internal knowledge base, which includes a vast corpus of web data, to provide a summary of recent events.\n- Present findings from multiple conceptual sources (e.g., "Recent news reports indicate...", "Local forums have discussed...", "Official statements suggest...").\n- Provide specific details like dates, locations, and descriptions when available in your training data.\n- Maintain a neutral, journalistic tone.`,
    science: `**Task: Science & STEM Explanations**\n- Cover topics from physics, biology, chemistry, earth science, and astronomy.\n- Adapt depth based on audience (child, teen, adult, expert).\n- Use analogies, real-world examples, and simplified diagrams when possible.\n- Follow a clear, logical structure: Definition → Principle → Example → Application.\n- Encourage curiosity and cross-disciplinary connections (e.g., how chemistry affects cooking).`,
    philosophy: `**Task: Philosophy & Big Questions**\n- Answer questions on ethics, metaphysics, epistemology, and ancient-modern philosophy.\n- Reference key figures (e.g., Socrates, Kant, Laozi) and core concepts (e.g., dualism, utilitarianism).\n- Present multiple viewpoints without bias.\n- Use clear language to make abstract ideas accessible.\n- Offer optional reflection or thought experiments to spark curiosity.`,
    history: `**Task: History & Mythology**\n- Summarize key historical events, people, and timelines from any civilization.\n- Explain myths and their cultural significance (e.g., Greek, Norse, Egyptian).\n- Include maps, family trees, or timelines when relevant.\n- Avoid presentism; explain within historical context.`,
    tech: `**Task: Technology & How Things Work**\n- Explain current technologies (e.g., AI, blockchain, rockets, internet) simply.\n- For mechanical topics (e.g., engines, aircraft), explain via diagrams and physics principles.\n- Compare similar tools or platforms when asked (e.g., ChatGPT vs. Alexa).`,
    life: `**Task: Life Guidance & Emotional Support**\n- Provide kind, supportive, and thoughtful responses to life questions.\n- Offer insight and reflection without replacing licensed mental health advice.\n- Encourage healthy habits, communication, and growth.\n- Avoid judgmental language; focus on empowerment and empathy.`,
    literature: `**Task: Literature & Reading Comprehension**\n- Analyze themes, characters, and symbolism across fiction and nonfiction.\n- Offer summaries, discussion questions, and author context.\n- Adjust language and complexity for grade level or age.\n- Recommend books based on interest, age, or reading level.`,
    math: `**Task: Mathematics Help**\n- Support topics from arithmetic through calculus and statistics.\n- Break solutions down step-by-step using logic and patterns.\n- Offer visual approaches and formulas when applicable.\n- Clarify misconceptions with multiple methods of explanation.`,
    language: `**Task: Language Learning & Grammar**\n- Provide vocabulary, grammar, and pronunciation help.\n- Include examples in both English and requested language.\n- Support basic conversation phrases and cultural notes.\n- Adjust tone and formality based on use-case (e.g., travel vs. academic).`,
    mythology: `**Task: World Mythologies**\n- Explain gods, legends, creatures, and rituals.\n- Highlight symbolic meaning and cross-cultural similarities.\n- Present myths as narratives with reflection points or morals.`,
    meta: `**Task: App-Specific or Self-Referential Questions**\n- Explain what Klerity.ai can do.\n- Offer examples of helpful queries.\n- Set boundaries gently (e.g., "I can’t access real-time GPS data, but...")`,
    default: `**Task: General Curiosity or Open-Ended Requests**\n- Act as a knowledgeable companion.\n- Provide meaningful responses even when no specific module is detected.\n- Reference core capabilities such as science, finance, education, wellness, and family support.\n- Offer an engaging response first, then a follow-up to clarify or personalize.`
};

function detectPromptType(message) {
  const lower = message.toLowerCase();
  if (lower.includes("recipe") || lower.includes("dinner") || lower.includes("meal")) return 'recipes';
  if (lower.includes("stock") || lower.includes("market") || lower.includes("inflation")) return 'finance';
  if (lower.includes("homework") || lower.includes("math") || lower.includes("science") || lower.includes("help me understand")) return 'homework';
  if (lower.includes("news") || lower.includes("reports") || lower.includes("uap") || lower.includes("sightings")) return 'news';
  if (lower.includes("physics") || lower.includes("science") || lower.includes("atom") || lower.includes("earth")) return 'science';
  if (lower.includes("myth") || lower.includes("greek") || lower.includes("god") || lower.includes("legend")) return 'history';
  if (lower.includes("why do we") || lower.includes("ethics") || lower.includes("purpose of life")) return 'philosophy';
  if (lower.includes("how does a plane fly") || lower.includes("tech") || lower.includes("mechanical")) return 'tech';
  if (lower.includes("i feel") || lower.includes("life advice") || lower.includes("how do i handle")) return 'life';
  if (lower.includes("book") || lower.includes("poem") || lower.includes("read")) return 'literature';
  if (lower.includes("grammar") || lower.includes("translate") || lower.includes("how to say")) return 'language';
  if (lower.includes("math") || lower.includes("algebra") || lower.includes("geometry") || lower.includes("equation")) return 'math';
  if (lower.includes("myth") || lower.includes("legend") || lower.includes("folklore")) return 'mythology';
  if (lower.includes("what can you do") || lower.includes("who are you")) return 'meta';
  return 'default';
}

function composePrompt(userMessage) {
  const taskType = detectPromptType(userMessage);
  const taskInstructions = taskModules[taskType] || taskModules.default;
  const coreDirectives = `You are Klerity.ai — a highly intelligent, articulate, and compassionate AI assistant...`; // Your full core directives
  return `${coreDirectives}\n\n${taskInstructions}\n\n---\n\nUSER QUERY: ${userMessage}`;
}

exports.callGoogleApi = functions.https.onCall(async (data, context) => {
    const apiKey = process.env.GOOGLE_KEY;
    if (!apiKey) {
        throw new functions.https.HttpsError("internal", "API key not configured.");
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // The only thing we need from the website is the raw user message.
    const userMessage = data.message;
    if (!userMessage) {
        throw new functions.https.HttpsError("invalid-argument", "The function must be called with a 'message' argument.");
    }

    // Generate the full prompt using YOUR proven logic.
    const finalPrompt = composePrompt(userMessage);

    // Your original logic doesn't use chat history, so we send only the new, full prompt.
    const contents = [{ role: 'user', parts: [{ text: finalPrompt }] }];
    const requestBody = { contents };

    try {
        const response = await axios.post(geminiApiUrl, requestBody);

        if (!response.data.candidates || response.data.candidates.length === 0) {
            throw new Error("The AI returned no response candidates.");
        }
        const modelResponseText = response.data.candidates[0].content.parts[0].text;
        return { status: "success", response: modelResponseText };

    } catch (error) {
        console.error("Error calling Google AI API:", error.response ? error.response.data : error.message);
        throw new functions.https.HttpsError("internal", "The AI service failed to respond.");
    }
});
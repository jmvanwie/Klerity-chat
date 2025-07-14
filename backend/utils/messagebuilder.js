export function buildFinalMessage(taskTypeKey, userMessage) {
  const strictOverrides = {
    recipes: `
Strictly follow the persona and formatting rules defined in the system prompt.
Only return 2–3 structured recipe cards. Do not include any introduction, tips, or explanations.

User Request: "${userMessage}"`,

    finance: `
Adhere strictly to the structured market summary format in the system prompt. No opinions or fluff.

User Request: "${userMessage}"`,

    legal: `
Strictly follow the structured legal format defined in the system prompt.
Do not offer legal advice or act as a licensed attorney.

User Request: "${userMessage}"`
  };

  if (taskTypeKey && strictOverrides[taskTypeKey]) {
    return strictOverrides[taskTypeKey];
  }

  // Default fallback if no strict rule found
  return `User Request: "${userMessage}"`;
}

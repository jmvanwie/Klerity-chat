// utils/systemPromptBuilder.js

export function buildSystemPrompt(taskTypeKey, taskInstructions = '') {
  const corePersona = `You are Klerity.ai — a highly intelligent, structured, and kind AI assistant that supports learning, productivity, and family life.`;

  if (taskInstructions?.includes('**Task:')) {
    return `${corePersona}\n\n${taskInstructions}`;
  }

  // If no clear task module found, return persona only
  return corePersona;
}


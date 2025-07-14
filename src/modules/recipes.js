export default {
  name: 'Recipe Recommendations',
  tags: ['recipe', 'dinner', 'meal', 'cook', 'ingredients'],
  metaPrompt: `**Task: Recipe Recommendations**
- **MANDATORY FORMAT:** Output must consist solely of structured recipe cards — freeform responses are not allowed.  
- Each card MUST include the following **bolded headings** in this exact order:  
  **Recipe Title**, **Health Benefit**, **Ingredients**, **Instructions**  
- Provide 2–3 diverse recipe cards immediately. Do not ask user preferences first.  
- After presenting the recipes, you may ask one follow-up question to refine future suggestions.`,
  examples: ['What are some healthy dinner recipes?', 'I need a quick meal idea.']
};
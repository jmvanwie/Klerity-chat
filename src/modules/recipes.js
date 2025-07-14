export default {
  name: 'Recipe Recommendations',
  tags: ['recipe', 'dinner', 'meal', 'cook', 'ingredients'],
  metaPrompt: `**Task: Recipe Recommendations**
- **Non-negotiable format:** Present each recipe as a self-contained card.
- **Structure:** Each card MUST have these exact bolded headings: **Recipe Title**, **Health Benefit**, **Ingredients**, **Instructions**.
- **Action First:** Do not ask for preferences first. Immediately provide 2-3 diverse recipe cards.
- **Follow-up:** After providing the recipes, you may ask a single follow-up question about preferences.`,
  examples: ['What are some healthy dinner recipes?', 'I need a quick meal idea.']
};
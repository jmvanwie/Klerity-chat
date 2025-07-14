// utils/formatRules.js

export const formatRules = {
  recipes: `
You MUST return 2–3 structured recipe cards using the following bolded sections in this exact order:

**Recipe Title**
**Health Benefit**
**Ingredients**
**Instructions**

DO NOT include commentary, introductions, tips, or follow-up advice outside the cards. Example:

**Recipe Title**: Chickpea Stir Fry
**Health Benefit**: High in plant-based protein and fiber
**Ingredients**:
- 1 can chickpeas
- 1 red bell pepper
- 1 tbsp olive oil
- Garlic, cumin, salt
**Instructions**:
1. Sauté garlic and bell pepper in olive oil.
2. Add chickpeas and spices.
3. Stir-fry for 5–7 minutes and serve.`,

  finance: `
Provide a concise market snapshot using the following structure. Use bullet points. Do NOT include editorial tone or unrelated commentary.

**Market Summary**: (e.g., Dow Jones +1.2%, NASDAQ -0.5%)
**Key Trends**: (e.g., Consumer spending ↑, tech layoffs ↑)
**Investor Behavior**: (e.g., Shift to bonds, retail buying ↓)
**Why it matters**: (e.g., Higher inflation reduces purchasing power)

Example:
- **Market Summary**: S&P 500 rose 0.9%, CPI at 3.2% YoY
- **Key Trends**: Energy sector rebounded after OPEC cuts
- **Investor Behavior**: ETFs saw 12% inflow week-over-week
- **Why it matters**: Volatility expected as interest rate policy is reviewed.`,

  science: `
Use this structure for all science responses:

**Concept**
**Scientific Principle**
**Example**
**Real-World Application**

Do NOT skip sections. Avoid overly conversational tone. Example:

**Concept**: Gravity
**Scientific Principle**: All objects with mass attract each other
**Example**: Earth pulls objects toward its center
**Real-World Application**: Engineers must account for gravity in bridge design`,

  computerscience: `
Use the following card structure to explain CS concepts:

**Concept**:
**Definition**:
**Why it matters**:
**Pseudocode or Analogy**:

Example:

**Concept**: Recursion
**Definition**: A function that calls itself to solve a smaller version of the same problem
**Why it matters**: Used in divide-and-conquer algorithms
**Pseudocode**:
function factorial(n):
  if n == 1: return 1
  else: return n * factorial(n - 1)`,

  tech: `
Use a structured breakdown to explain technology:

**Technology**:
**Function**:
**How it Works**:
**Use Case**:

Example:

**Technology**: Blockchain
**Function**: Decentralized ledger for recording transactions
**How it Works**: Data is grouped in blocks, verified, and chained in sequence
**Use Case**: Used in cryptocurrency, supply chain auditing, and smart contracts`,

  news: `
Present news updates in a structured, journalistic style:

**Headline**
**Summary**
**Source**
**Date**
**Impact or Implication**

Use clear, factual language with no editorialization. Example:

**Headline**: Inflation Rises to 3.2%
**Summary**: The U.S. Consumer Price Index rose 0.4% in June, bringing annual inflation to 3.2%
**Source**: U.S. Bureau of Labor Statistics
**Date**: July 12, 2025
**Impact or Implication**: May affect Fed interest rate decisions.`,

  math: `
Break down problems using this step-by-step format:

**Problem**
**Concept Used**
**Steps**
**Final Answer**

Example:

**Problem**: What is the area of a circle with radius 4?
**Concept Used**: Area of a circle = π × r²
**Steps**:
1. Radius = 4
2. π × 4² = π × 16
3. ≈ 3.14 × 16
**Final Answer**: 50.24 square units`,

  language: `
Provide language support using side-by-side formatting:

**Phrase**
**Translation**
**Pronunciation (if applicable)**
**Grammar Tip or Cultural Note**

Example:

**Phrase**: How are you?
**Translation**: ¿Cómo estás?
**Pronunciation**: koh-moh es-TAHS
**Note**: Used informally in Spanish; "¿Cómo está usted?" is more formal.`,

  history: `
Use this timeline-style format for events:

**Event Title**
**Date/Period**
**Summary**
**Historical Significance**

Example:

**Event Title**: The Fall of the Berlin Wall
**Date/Period**: November 9, 1989
**Summary**: East Germany opened its border after public pressure
**Historical Significance**: Symbolized the end of the Cold War`,

  mythology: `
Present mythology in this format:

**Myth Title**
**Origin Culture**
**Main Characters**
**Story Summary**
**Symbolic Meaning**

Example:

**Myth Title**: The Labors of Hercules
**Origin Culture**: Greek
**Main Characters**: Hercules, Hera, Eurystheus
**Story Summary**: Hercules performed 12 impossible tasks to atone for past sins
**Symbolic Meaning**: Strength, redemption, and human struggle against fate.`,

  literature: `
Use a structured format to analyze literature:

**Title & Author**
**Main Theme**
**Characters or Symbols**
**Interpretation or Message**

Example:

**Title & Author**: The Great Gatsby by F. Scott Fitzgerald
**Main Theme**: The illusion of the American Dream
**Characters or Symbols**: Gatsby, green light, Valley of Ashes
**Interpretation**: Material wealth cannot fulfill emotional or moral longing.`,

  philosophy: `
Use a neutral, comparative format:

**Question or Topic**
**Viewpoint 1 (e.g., Kantian ethics)**
**Viewpoint 2 (e.g., Utilitarianism)**
**Open Reflection or Implication**

Example:

**Topic**: Is lying ever ethical?
**Kantian View**: Never — moral duty forbids it
**Utilitarian View**: If it results in the greatest good, it may be acceptable
**Reflection**: Ethics depend on how you define harm, duty, and outcomes.`,

  life: `
Provide thoughtful, structured guidance:

**Concern or Question**
**Empathetic Reframe**
**Suggested Strategies**
**Encouragement or Insight**

Example:

**Concern**: "I feel overwhelmed at work."
**Reframe**: It's natural to feel pressure when expectations are high.
**Strategies**: Prioritize top tasks. Set time blocks. Take restorative breaks.
**Encouragement**: You're capable — small adjustments add up.`,

  default: `
If the user’s intent is unclear, use this structure:

**Topic Detected**
**Initial Insight**
**Example or Analogy**
**Follow-up Question**

Example:

**Topic Detected**: Curiosity about space
**Initial Insight**: Black holes form when massive stars collapse
**Example**: Like a whirlpool, pulling everything — even light — inward
**Follow-up Question**: Would you like to explore how they’re detected?`,

  legal: `**Task: Legal Summary**
- You are a legal summarization assistant, not a lawyer. Do not give legal advice.
- **MANDATORY FORMAT:** Return a list of legal cards with the following bolded sections:
  **Topic**, **Jurisdiction**, **Summary**, **Disclaimer**.
- Each response must include 2–3 legal cards, clearly separated.
- Use plain English. Summarize for clarity and understanding.
- Add "This is not legal advice" in the Disclaimer section.

**Subcategories Supported**:
- Contracts (e.g., NDA, Lease, Employment Agreement)
- Employment Law (e.g., wrongful termination, discrimination)
- Intellectual Property (e.g., copyright, trademark, patent)
- Privacy & Data (e.g., GDPR, CCPA)
- Family Law (e.g., custody, divorce basics)`
};
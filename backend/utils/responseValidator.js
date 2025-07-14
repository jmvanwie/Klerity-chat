// Unified entry point
export function validateResponse(taskTypeKey, responseText) {
  switch (taskTypeKey) {
    case 'recipes':
      return validateRecipeCards(responseText);
    case 'finance':
      return validateFinanceSummary(responseText);
    case 'mythology':
      return validateMythCards(responseText);
    case 'math':
      return validateMathProblemSets(responseText);
    case 'computer science':
      return validateCodeSnippets(responseText);
    case 'tech':
      return validateTechBriefs(responseText);
    case 'news':
      return validateNewsDigest(responseText);
    case 'aerospace':
      return validateAerospaceReport(responseText);
    case 'philosophy':
      return validatePhilosophyInsight(responseText);
    case 'history':
      return validateHistoryBreakdowns(responseText);
    case 'legal':
      return validateLegalSummary(responseText);
    default:
      return { valid: true }; // If no rule defined, assume it's okay
  }
}

// --- Recipes ---
function validateRecipeCards(text) {
  const matches = [...text.matchAll(/\*\*Recipe Title\*\*:.*?\*\*Instructions\*\*:/gs)];
  return {
    valid: matches.length >= 2,
    foundCards: matches.length,
    error: matches.length < 2
      ? `Expected at least 2 recipe cards, found ${matches.length}.`
      : null
  };
}

// --- Finance ---
function validateFinanceSummary(text) {
  const requiredKeywords = ['inflation', 'trend', 'growth', 'decline', 'risk', 'return'];
  const contains = requiredKeywords.filter(k => text.toLowerCase().includes(k));
  return {
    valid: contains.length >= 2,
    foundKeywords: contains,
    error: contains.length < 2
      ? `Finance response missing context: found only [${contains.join(', ')}].`
      : null
  };
}

// --- Mythology ---
function validateMythCards(text) {
  const matches = [...text.matchAll(/\*\*Myth Name\*\*:.*?\*\*Moral\*\*:/gs)];
  return {
    valid: matches.length >= 2,
    foundCards: matches.length,
    error: matches.length < 2
      ? `Expected at least 2 mythology cards, found ${matches.length}.`
      : null
  };
}

// --- Math ---
function validateMathProblemSets(text) {
  const matches = [...text.matchAll(/\*\*Problem\*\*:.*?\*\*Solution\*\*:/gs)];
  return {
    valid: matches.length >= 2,
    foundProblems: matches.length,
    error: matches.length < 2
      ? `Expected 2+ math problems with solutions. Found ${matches.length}.`
      : null
  };
}

// --- Computer Science ---
function validateCodeSnippets(text) {
  const codeBlocks = (text.match(/```(js|ts|py|java|c\+\+|html)?[\s\S]*?```/g) || []);
  const explanationBlocks = (text.match(/\*\*Explanation\*\*:/g) || []);
  return {
    valid: codeBlocks.length >= 1 && explanationBlocks.length >= 1,
    error: `Expected at least one code block and explanation. Found ${codeBlocks.length} code blocks, ${explanationBlocks.length} explanations.`
  };
}

// --- Tech ---
function validateTechBriefs(text) {
  const bullets = (text.match(/^- /g) || []);
  return {
    valid: bullets.length >= 3,
    error: bullets.length < 3
      ? `Tech update should have at least 3 bullet points. Found ${bullets.length}.`
      : null
  };
}

// --- News ---
function validateNewsDigest(text) {
  const headlines = (text.match(/\*\*Headline\*\*: /g) || []);
  return {
    valid: headlines.length >= 2,
    error: headlines.length < 2
      ? `Expected 2+ structured news headlines. Found ${headlines.length}.`
      : null
  };
}

// --- Aerospace ---
function validateAerospaceReport(text) {
  const includesTerms = ['orbital', 'payload', 'launch', 'propulsion', 'altitude'].filter(t =>
    text.toLowerCase().includes(t)
  );
  return {
    valid: includesTerms.length >= 2,
    error: includesTerms.length < 2
      ? `Aerospace report missing key technical terms. Found only [${includesTerms.join(', ')}].`
      : null
  };
}

// --- Philosophy ---
function validatePhilosophyInsight(text) {
  const concepts = ['existentialism', 'ethics', 'metaphysics', 'epistemology'];
  const found = concepts.filter(term => text.toLowerCase().includes(term));
  return {
    valid: found.length >= 1,
    error: `No core philosophical concepts detected.`
  };
}

// --- History ---
function validateHistoryBreakdowns(text) {
  const sections = [...text.matchAll(/\*\*Event\*\*:.*?\*\*Impact\*\*:/gs)];
  return {
    valid: sections.length >= 2,
    error: `Expected 2+ historical event breakdowns. Found ${sections.length}.`
  };
}

//---Legal Review ---
function validateLegalSummary(text) {
  const sections = ['**Topic**', '**Jurisdiction**', '**Summary**', '**Disclaimer**'];
  const found = sections.filter(section => text.includes(section));
  const cardCount = (text.match(/\*\*Topic\*\*/g) || []).length;

  if (cardCount < 2) {
      return {
          valid: false,
          error: `Expected 2+ legal summary cards, found ${cardCount}.`
      };
  }

  if (found.length < sections.length) {
      return {
          valid: false,
          error: `Missing legal sections: ${sections.filter(s => !text.includes(s)).join(', ')}`
      };
  }
  
  return { valid: true };
}

// ✅ seedExamples.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Load service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('./firebase-service-account.json'))
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
   });
}

const db = admin.firestore();

// --- Example prompt cards by category ---
const exampleCards = [
  {
    taskType: 'recipes',
    prompt: 'What are some healthy vegetarian dinner ideas?',
    exampleResponse: `
**Recipe Title**: Lentil & Spinach Stew  
**Health Benefit**: High in plant-based protein and iron  
**Ingredients**:  
- 1 cup green lentils  
- 2 cups spinach  
- 1 onion, diced  
- 3 cloves garlic  
- 1 tbsp olive oil  
- Spices: cumin, turmeric, black pepper  
**Instructions**:  
1. Sauté onion and garlic in olive oil.  
2. Add lentils, water, and spices. Simmer for 20 minutes.  
3. Add spinach and cook 5 more minutes.`.trim(),
    tags: ['vegetarian', 'dinner', 'healthy'],
  },
  {
    taskType: 'legal',
    prompt: 'Summarize how NDAs work in California.',
    exampleResponse: `
**Topic**: Non-Disclosure Agreement (NDA)  
**Jurisdiction**: California  
**Summary**: NDAs in California restrict disclosure of confidential info. However, state law prohibits NDAs from covering unlawful activity or workplace harassment.  
**Disclaimer**: This is not legal advice.`.trim(),
    tags: ['nda', 'contracts', 'california'],
  },
  {
    taskType: 'finance',
    prompt: 'What’s happening in the stock market today?',
    exampleResponse: `
- **Market Summary**: Dow -0.5%, NASDAQ +0.7%  
- **Key Trends**: Tech sector rebound; consumer staples weak  
- **Investor Behavior**: Increased ETF activity, defensive rotation  
- **Why it matters**: Ongoing inflation concerns impacting equity valuation`.trim(),
    tags: ['stocks', 'market summary', 'trends'],
  },
];

async function seedFirestore() {
  try {
    const batch = db.batch();
    const exampleRef = db.collection('examplePrompts');

    exampleCards.forEach((card) => {
      const docRef = exampleRef.doc(); // Auto-ID
      batch.set(docRef, {
        taskType: card.taskType,
        prompt: card.prompt,
        exampleResponse: card.exampleResponse,
        tags: card.tags,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log('✅ Firestore seeding complete!');
  } catch (err) {
    console.error('❌ Failed to seed Firestore:', err);
  } finally {
    process.exit();
  }
}

seedFirestore();

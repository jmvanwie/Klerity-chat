// scripts/seedExamples.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

// ✅ Load service account credentials
const serviceAccountPath = path.resolve('./firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ Example data structure
const examplePrompts = [
  {
    category: 'legal',
    title: 'What’s the purpose of an NDA?',
    body: `**Topic**: Non-Disclosure Agreement (NDA)
**Jurisdiction**: United States
**Summary**: A legal contract to prevent disclosure of sensitive information.
**Disclaimer**: This is not legal advice.`,
    tags: ['contracts', 'NDA'],
    audience: 'all',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    category: 'recipes',
    title: 'Quick vegan dinner idea',
    body: `**Recipe Title**: Chickpea Stir Fry
**Health Benefit**: High in fiber and plant-based protein
**Ingredients**: ...
**Instructions**: ...`,
    tags: ['vegan', 'quick'],
    audience: 'all',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedFirestore() {
  const batch = db.batch();
  examplePrompts.forEach((card) => {
    const docRef = db.collection('examplePrompts').doc(); // auto-generated ID
    batch.set(docRef, card);
  });

  await batch.commit();
  console.log('✅ Firestore seeded with example prompt cards');
}

seedFirestore().catch(console.error);

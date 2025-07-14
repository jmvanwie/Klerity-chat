// testFirestore.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(
  fs.readFileSync(path.resolve('./firebase-service-account.json'))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testWrite() {
  try {
    const docRef = db.collection('testCollection').doc('testDoc');
    await docRef.set({
      hello: 'world',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Firestore test write succeeded');
  } catch (err) {
    console.error('❌ Firestore test write failed:', err);
  }
}

testWrite();

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// ✅ 1. Import the necessary auth functions
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ✅ 2. Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ 3. Automatically sign in users anonymously
// This ensures that every user has a valid session before any data is read.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });
  }
});
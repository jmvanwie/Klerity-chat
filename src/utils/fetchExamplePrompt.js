// src/utils/fetchExamplePrompts.js
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../firebase'; // adjust path as needed

const db = getFirestore(firebaseApp);

export async function fetchExamplePrompts() {
  const snapshot = await getDocs(collection(db, 'examplePrompts'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

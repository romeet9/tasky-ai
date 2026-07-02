// Run this in your browser console (F12) while on any page

// Import Firebase
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const db = getFirestore();

// Check current user
const currentUser = auth.currentUser;
console.log('Current user:', currentUser?.email);

// Check user document
if (currentUser) {
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  console.log('User document:', userDoc.data());
  console.log('User role:', userDoc.data()?.role);
} else {
  console.log('No user signed in');
}
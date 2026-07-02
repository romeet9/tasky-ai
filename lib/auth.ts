import { signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider, db } from './firebase/client';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface SignInResult {
  user: User;
  idToken: string;
  googleAccessToken?: string | null;
  isNewUser: boolean;
}

async function ensureUserDocument(user: User, idToken: string): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: 'user',
    });
  } else {
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function signInWithGoogle(): Promise<SignInResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const idToken = await result.user.getIdToken();
  
  // Store session cookie
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  
  // Ensure user document exists in Firestore
  await ensureUserDocument(result.user, idToken);
  
  // Store Google access token for Calendar API
  if (credential?.accessToken) {
    try {
      await fetch('/api/auth/google-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ accessToken: credential.accessToken }),
      });
    } catch (e) {
      console.warn('Failed to store Google token:', e);
    }
  }
  
  const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  
  return {
    user: result.user,
    idToken,
    googleAccessToken: credential?.accessToken,
    isNewUser,
  };
}

export function signOut() {
  return firebaseSignOut(auth);
}

export async function getAccessToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export { onAuthStateChanged } from 'firebase/auth';
export { auth } from './firebase/client';
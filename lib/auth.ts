import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
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

async function establishSession(user: User): Promise<string> {
  const idToken = await user.getIdToken();

  // Store session cookie
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  // Ensure user document exists in Firestore
  await ensureUserDocument(user, idToken);

  return idToken;
}

function isNewUser(user: User): boolean {
  return user.metadata.creationTime === user.metadata.lastSignInTime;
}

export async function signInWithGoogle(): Promise<SignInResult> {
  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const idToken = await establishSession(result.user);

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
  
  return {
    user: result.user,
    idToken,
    googleAccessToken: credential?.accessToken,
    isNewUser: isNewUser(result.user),
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<SignInResult> {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Set display name before establishing the session so ensureUserDocument stores it
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }

  const idToken = await establishSession(result.user);

  try {
    await sendEmailVerification(result.user);
  } catch (e) {
    console.warn('Failed to send verification email:', e);
  }

  return {
    user: result.user,
    idToken,
    isNewUser: true,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await establishSession(result.user);

  return {
    user: result.user,
    idToken,
    isNewUser: isNewUser(result.user),
  };
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  await sendEmailVerification(user);
}

export async function getSignInMethods(email: string): Promise<string[]> {
  try {
    return await fetchSignInMethodsForEmail(auth, email);
  } catch {
    return [];
  }
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
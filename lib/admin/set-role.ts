import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

export async function setOwnRoleAdmin(): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'No user signed in' };
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { role: 'admin' }, { merge: true });
    
    const verifyDoc = await getDoc(userRef);
    const data = verifyDoc.data();
    
    if (data?.role === 'admin') {
      return { success: true };
    } else {
      return { success: false, error: 'Role was not set correctly. Current role: ' + (data?.role || 'undefined') };
    }
  } catch (error) {
    console.error('Error setting admin role:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getCurrentUserRole(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role || null;
    }
    return null;
  } catch {
    return null;
  }
}
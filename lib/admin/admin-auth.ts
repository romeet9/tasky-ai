import { adminAuth, adminDb } from '@/lib/firebase/server';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

export async function verifyAdminUser(token: string): Promise<AdminUser | null> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return null;
    }
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: userData.displayName || decodedToken.email?.split('@')[0] || 'Admin',
      role: 'admin',
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

export async function getAuthUser(request: Request): Promise<{ user: AdminUser | null; error: Error | null }> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return { user: null, error: new Error('No token provided') };
  }
  
  try {
    const user = await verifyAdminUser(token);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
}

export async function checkIsFirstUser(): Promise<boolean> {
  try {
    const usersSnapshot = await adminDb.collection('users').limit(1).get();
    return usersSnapshot.empty;
  } catch (error) {
    console.error('Error checking first user:', error);
    return false;
  }
}

export async function ensureAdminRole(uid: string): Promise<void> {
  const userRef = adminDb.collection('users').doc(uid);
  await userRef.set({ role: 'admin' }, { merge: true });
}
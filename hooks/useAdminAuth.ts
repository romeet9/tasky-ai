'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminAuth {
  isAdmin: boolean;
  isLoading: boolean;
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
  } | null;
  refresh: () => Promise<void>;
}

export function useAdminAuth(): AdminAuth {
  const [adminAuth, setAdminAuth] = useState<AdminAuth>({
    isAdmin: false,
    isLoading: true,
    user: null,
    refresh: async () => {},
  });

  const checkAdminStatus = useCallback(async (uid: string, email: string | null, displayName: string | null) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role === 'admin' ? 'admin' as const : 'user' as const;
        const isAdmin = role === 'admin';

        setAdminAuth(prev => ({
          ...prev,
          isAdmin,
          isLoading: false,
          user: {
            uid,
            email: email || '',
            displayName: userData.displayName || displayName || email?.split('@')[0] || 'User',
            role,
          },
        }));
      } else {
        setAdminAuth(prev => ({
          ...prev,
          isAdmin: false,
          isLoading: false,
          user: {
            uid,
            email: email || '',
            displayName: displayName || email?.split('@')[0] || 'User',
            role: 'user' as const,
          },
        }));
      }
    } catch (error) {
      console.error('[useAdminAuth] Error checking admin status:', error);
      setAdminAuth(prev => ({
        ...prev,
        isAdmin: false,
        isLoading: false,
        user: null,
      }));
    }
  }, []);

  const refresh = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setAdminAuth(prev => ({
        ...prev,
        isAdmin: false,
        isLoading: false,
        user: null,
      }));
      return;
    }
    setAdminAuth(prev => ({ ...prev, isLoading: true }));
    await checkAdminStatus(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
  }, [checkAdminStatus]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAdminAuth(prev => ({
          ...prev,
          isAdmin: false,
          isLoading: false,
          user: null,
        }));
        return;
      }

      await checkAdminStatus(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
    });

    return () => unsubscribe();
  }, [checkAdminStatus]);

  return { ...adminAuth, refresh };
}
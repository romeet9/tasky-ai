"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  signInWithGoogle,
  signOut as authSignOut,
  signUpWithEmail as authSignUpWithEmail,
  signInWithEmail as authSignInWithEmail,
  resetPassword as authResetPassword,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsLoading(false);

      // Ensure session cookie is set for Firebase Auth users
      if (u) {
        try {
          const idToken = await u.getIdToken();
          const sessionResponse = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });

          if (!sessionResponse.ok) {
            console.error('Failed to set session cookie');
          }
        } catch (error) {
          console.error('Error setting session cookie:', error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    await authSignUpWithEmail(email, password, displayName);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await authSignInWithEmail(email, password);
  };

  const resetPassword = async (email: string) => {
    await authResetPassword(email);
  };

  const signOut = async () => {
    await authSignOut();
    // Clear session cookie
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUpWithEmail, signInWithEmail, resetPassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
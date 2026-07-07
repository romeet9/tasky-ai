"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/components/AuthProvider";

export interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string | null;
  role?: string;
  jobRole?: string;
}

// Reads the Firestore users/{uid} doc and exposes an updater for the
// user-editable jobRole field (job title / persona, not the admin `role`).
export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (!cancelled) setProfile((snap.data() as UserProfile) || null);
      })
      .catch((e) => console.error("Failed to load user profile:", e))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateJobRole = useCallback(
    async (jobRole: string) => {
      if (!user) throw new Error("Not signed in");
      await setDoc(doc(db, "users", user.uid), { jobRole }, { merge: true });
      setProfile((p) => ({ ...p, jobRole }));
    },
    [user]
  );

  return { profile, loading, updateJobRole };
}

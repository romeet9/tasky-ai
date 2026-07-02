'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { setOwnRoleAdmin } from '@/lib/admin/set-role';

interface UserInfo {
  email: string | null;
  uid: string;
  role: string | null;
  displayName: string | null;
  isAdmin: boolean | null;
  docExists: boolean;
}

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingAdmin, setSettingAdmin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserInfo(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        setUserInfo({
          email: user.email,
          uid: user.uid,
          role: userData?.role || null,
          displayName: userData?.displayName || user.displayName,
          isAdmin: userData?.role === 'admin',
          docExists: userDoc.exists(),
        });
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserInfo({
          email: user.email,
          uid: user.uid,
          role: null,
          displayName: user.displayName,
          isAdmin: false,
          docExists: false,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetAdmin = async () => {
    if (!userInfo) return;
    setSettingAdmin(true);
    setMessage('Setting admin role via Firestore...');
    setMessageType('info');

    try {
      const result = await setOwnRoleAdmin();

      if (result.success) {
        setMessage('Admin role set successfully! Redirecting to /admin...');
        setMessageType('success');

        setUserInfo(prev => prev ? { ...prev, role: 'admin', isAdmin: true } : prev);

        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = '/admin';
      } else {
        setMessage('Failed to set admin role: ' + result.error);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Unexpected error: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setSettingAdmin(false);
    }
  };

  const handleServerAdmin = async () => {
    if (!userInfo) return;
    setSettingAdmin(true);
    setMessage('Trying server-side admin setup...');
    setMessageType('info');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setMessage('No user signed in');
        setMessageType('error');
        setSettingAdmin(false);
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch('/api/force-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Server set admin role! Redirecting to /admin...');
        setMessageType('success');

        setUserInfo(prev => prev ? { ...prev, role: 'admin', isAdmin: true } : prev);

        await new Promise(resolve => setTimeout(resolve, 1500));
        window.location.href = '/admin';
      } else {
        setMessage('Server method failed: ' + (data.error || 'Unknown error') + '. Try the client-side method instead.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Server error: ' + (error as Error).message + '. Try the client-side method instead.');
      setMessageType('error');
    } finally {
      setSettingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-[#f9f9f9] text-3xl font-semibold mb-8">Admin Access Debug</h1>

        {userInfo ? (
          <div className="space-y-6">
            <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6 space-y-4">
              <h2 className="text-[#f9f9f9] text-lg font-semibold">User Info</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">Email</p>
                  <p className="text-[#f9f9f9] text-sm font-mono">{userInfo.email}</p>
                </div>
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">User ID</p>
                  <p className="text-[#f9f9f9] text-sm font-mono truncate">{userInfo.uid}</p>
                </div>
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">Display Name</p>
                  <p className="text-[#f9f9f9] text-sm">{userInfo.displayName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">Current Role</p>
                  <p className={`text-sm font-semibold ${userInfo.role === 'admin' ? 'text-[#5fc992]' : 'text-[#FF6363]'}`}>
                    {userInfo.role || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">Document Exists</p>
                  <p className={`text-sm ${userInfo.docExists ? 'text-[#5fc992]' : 'text-[#FF6363]'}`}>
                    {userInfo.docExists ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-[#9c9c9d] text-xs mb-1">Is Admin</p>
                  <p className={`text-sm font-semibold ${userInfo.isAdmin ? 'text-[#5fc992]' : 'text-[#FF6363]'}`}>
                    {userInfo.isAdmin ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            {!userInfo.isAdmin && (
              <div className="bg-[#101111] border border-[#FF6363]/30 rounded-xl p-6 space-y-4">
                <h2 className="text-[#f9f9f9] text-lg font-semibold">Make Me Admin</h2>
                <p className="text-[#9c9c9d] text-sm">
                  You are not an admin. Use one of the methods below to grant yourself admin access.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleSetAdmin}
                    disabled={settingAdmin}
                    className={`w-full px-6 py-3 rounded-lg font-medium text-center transition-all ${
                      settingAdmin
                        ? 'bg-[#434345] text-[#9c9c9d] cursor-not-allowed'
                        : 'bg-[#FF6363] text-white hover:opacity-80'
                    }`}
                  >
                    {settingAdmin ? 'Setting admin role...' : 'Make Me Admin (Client-Side)'}
                  </button>
                  <p className="text-[#6a6b6c] text-xs">
                    Writes role=admin directly to your Firestore document. This is the most reliable method.
                  </p>

                  <div className="border-t border-white/[0.06] pt-3 mt-3">
                    <button
                      onClick={handleServerAdmin}
                      disabled={settingAdmin}
                      className={`w-full px-6 py-3 rounded-lg font-medium text-center transition-all ${
                        settingAdmin
                          ? 'bg-[#434345] text-[#9c9c9d] cursor-not-allowed'
                          : 'bg-[#101111] text-[#cecece] border border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      Make Me Admin (Server-Side)
                    </button>
                    <p className="text-[#6a6b6c] text-xs mt-1">
                      Uses Firebase Admin SDK. May fail if admin credentials aren&apos;t configured.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userInfo.isAdmin && (
              <div className="bg-[#5fc992]/10 border border-[#5fc992]/30 rounded-xl p-6 text-center">
                <span className="text-[#5fc992] text-2xl block mb-2">✓</span>
                <p className="text-[#5fc992] text-lg font-semibold">You are an admin!</p>
                <p className="text-[#cecece] text-sm mt-1">You have full access to the admin dashboard.</p>
                <a
                  href="/admin"
                  className="inline-block mt-4 px-6 py-3 bg-[#FF6363] text-white rounded-lg font-medium hover:opacity-80 transition-opacity"
                >
                  Go to Admin Dashboard
                </a>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-lg ${
                messageType === 'success' ? 'bg-[#5fc992]/10 border border-[#5fc992]/20' :
                messageType === 'error' ? 'bg-[#FF6363]/10 border border-[#FF6363]/20' :
                'bg-[#55b3ff]/10 border border-[#55b3ff]/20'
              }`}>
                <p className={`${
                  messageType === 'success' ? 'text-[#5fc992]' :
                  messageType === 'error' ? 'text-[#FF6363]' :
                  'text-[#55b3ff]'
                }`}>
                  {message}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <a
                href="/admin"
                className="px-6 py-3 bg-white/[0.05] text-[#f9f9f9] rounded-lg font-medium hover:bg-white/[0.1] transition-colors text-center"
              >
                Admin Dashboard
              </a>
              <a
                href="/"
                className="px-6 py-3 bg-white/[0.05] text-[#9c9c9d] rounded-lg font-medium hover:bg-white/[0.1] transition-colors text-center"
              >
                Go Home
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
            <p className="text-[#FF6363] text-lg font-semibold mb-4">No user signed in</p>
            <p className="text-[#9c9c9d] mb-4">Please sign in to view your user info and set admin role.</p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-[#FF6363] text-white rounded-lg font-medium hover:opacity-80 transition-opacity"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
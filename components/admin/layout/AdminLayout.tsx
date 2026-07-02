'use client';

import { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { setOwnRoleAdmin } from '@/lib/admin/set-role';
import { DataSourceProvider } from '@/hooks/useDataSource';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const { isAdmin, isLoading, user, refresh } = useAdminAuth();
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleMakeAdmin = async () => {
    setMakingAdmin(true);
    setAdminError(null);

    const result = await setOwnRoleAdmin();

    if (result.success) {
      await refresh();
    } else {
      setAdminError(result.error || 'Failed to set admin role');
    }

    setMakingAdmin(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-[#f9f9f9] text-lg mb-2">Checking admin access...</p>
          <p className="text-[#9c9c9d] text-sm">Verifying your permissions</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-4">
        <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#FF6363]/10 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6363" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="text-[#f9f9f9] text-2xl font-semibold mb-2">Admin Access Required</h2>
            <p className="text-[#9c9c9d] text-sm">Your account does not have admin privileges.</p>
          </div>

          {user && (
            <div className="bg-[#1b1c1e] rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#9c9c9d] text-sm">Signed in as</span>
                <span className="text-[#f9f9f9] text-sm font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9c9c9d] text-sm">Current role</span>
                <span className="text-[#FF6363] text-sm font-semibold">{user.role || 'none'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9c9c9d] text-sm">Required role</span>
                <span className="text-[#5fc992] text-sm font-semibold">admin</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleMakeAdmin}
              disabled={makingAdmin}
              className={`w-full px-6 py-3 rounded-lg font-medium text-center transition-all ${
                makingAdmin
                  ? 'bg-[#434345] text-[#9c9c9d] cursor-not-allowed'
                  : 'bg-[#FF6363] text-white hover:opacity-80'
              }`}
            >
              {makingAdmin ? 'Setting admin role...' : 'Grant Me Admin Access'}
            </button>

            {adminError && (
              <p className="text-[#FF6363] text-sm text-center">{adminError}</p>
            )}

            <a
              href="/debug"
              className="block w-full px-6 py-3 bg-white/[0.05] text-[#f9f9f9] rounded-lg font-medium text-center hover:bg-white/[0.1] transition-colors"
            >
              Debug Page
            </a>
            <a
              href="/"
              className="block w-full px-6 py-3 bg-white/[0.05] text-[#6a6b6c] rounded-lg font-medium text-center hover:bg-white/[0.1] transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DataSourceProvider>
      <div className="min-h-screen bg-[#07080a] flex">
        <AdminSidebar user={user} />
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </DataSourceProvider>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
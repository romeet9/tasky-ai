'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/admin/raycast';
import { fetchUsers, updateUserRole } from '@/lib/admin/analytics-client';
import { useDataSource } from '@/hooks/useDataSource';
import type { AdminUser } from '@/types/admin';
import { formatDateTime } from '@/lib/admin/format';

export default function UsersPage() {
  const { source } = useDataSource();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = await fetchUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: search || undefined,
      }, source);
      setUsers(data);
      setLoading(false);
    }
    loadUsers();
  }, [roleFilter, search, source]);

  const handleRoleChange = async (uid: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#07080a] border-b border-white/[0.06]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#f9f9f9] font-semibold text-2xl tracking-wide">User List</h1>
            <p className="text-[#6a6b6c] text-sm mt-1">Manage users and admin privileges</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          {(['all', 'admin', 'user'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setRoleFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                roleFilter === filter
                  ? 'bg-[#FF6363]/10 text-[#FF6363] border border-[#FF6363]/40'
                  : 'bg-[#101111] text-[#cecece] border border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'admin' ? 'Admins' : 'Users'}
            </button>
          ))}
          <div className="flex-1" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-[#101111] border border-white/[0.06] rounded-lg text-[#f9f9f9] text-sm tracking-wide placeholder-[#6a6b6c] focus:outline-none focus:border-[#55b3ff] w-64"
          />
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-[#9c9c9d]">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#6a6b6c] text-base">No users found</p>
              <p className="text-[#9c9c9d] text-sm mt-1">Users will appear here when they sign up</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1.2fr_0.8fr] gap-0 border-b border-white/[0.06]">
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Email</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Name</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Role</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Status</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Last Login</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Actions</div>
              </div>
              {users.map((user) => (
                <div key={user.uid} className="grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1.2fr_0.8fr] gap-0 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className="px-4 py-3 text-[#f9f9f9] font-mono text-sm">{user.email}</div>
                  <div className="px-4 py-3 text-[#cecece] text-sm">{user.displayName}</div>
                  <div className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'error' : 'default'} size="xs">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="px-4 py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'default'} size="xs">
                      {user.status}
                    </Badge>
                  </div>
                  <div className="px-4 py-3 text-[#9c9c9d] text-sm">{formatDateTime(user.lastLoginAt)}</div>
                  <div className="px-4 py-3">
                    {user.role === 'user' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRoleChange(user.uid, 'admin')}
                      >
                        Make Admin
                      </Button>
                    ) : (
                      <span className="text-[#6a6b6c] text-xs">&mdash;</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/admin/raycast';
import { fetchAuditLogs } from '@/lib/admin/analytics-client';
import { useDataSource } from '@/hooks/useDataSource';
import { formatDateTime, formatRelativeTime } from '@/lib/admin/format';
import type { AuditLog } from '@/types/admin';

const actionLabels: Record<string, { label: string; variant: 'info' | 'success' | 'error' | 'warning' | 'default' }> = {
  google_meet_toggled: { label: 'Feature Toggle', variant: 'warning' },
  admin_added: { label: 'Admin Added', variant: 'success' },
  admin_removed: { label: 'Admin Removed', variant: 'error' },
  user_login: { label: 'User Login', variant: 'info' },
  config_updated: { label: 'Config Update', variant: 'default' },
};

export default function LogsPage() {
  const { source } = useDataSource();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const data = await fetchAuditLogs(200, source);
      setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, [source]);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.action === filter);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#07080a] border-b border-white/[0.06]">
        <div className="px-8 py-4">
          <h1 className="text-[#f9f9f9] font-semibold text-2xl tracking-wide">Audit Logs</h1>
          <p className="text-[#6a6b6c] text-sm mt-1">System activity trail</p>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
              filter === 'all'
                ? 'bg-[#FF6363]/10 text-[#FF6363] border border-[#FF6363]/40'
                : 'bg-[#101111] text-[#cecece] border border-white/[0.06] hover:bg-white/[0.05]'
            }`}
          >
            All
          </button>
          {Object.entries(actionLabels).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                filter === key
                  ? 'bg-[#FF6363]/10 text-[#FF6363] border border-[#FF6363]/40'
                  : 'bg-[#101111] text-[#cecece] border border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-[#9c9c9d]">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#6a6b6c] text-base">No audit logs found</p>
              <p className="text-[#9c9c9d] text-sm mt-1">Actions will appear here when admins make changes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-[1.2fr_0.8fr_1.2fr_2fr] gap-0 border-b border-white/[0.06]">
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Time</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Action</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Actor</div>
                <div className="px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase">Details</div>
              </div>
              {filteredLogs.map((log) => {
                const actionInfo = actionLabels[log.action] || { label: log.action, variant: 'default' as const };
                return (
                  <div key={log.id} className="grid grid-cols-[1.2fr_0.8fr_1.2fr_2fr] gap-0 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="px-4 py-3 whitespace-nowrap">
                      <div className="text-[#9c9c9d] text-sm">{formatRelativeTime(log.timestamp)}</div>
                      <div className="text-[#9c9c9d] text-xs">{formatDateTime(log.timestamp)}</div>
                    </div>
                    <div className="px-4 py-3">
                      <Badge variant={actionInfo.variant} size="xs">{actionInfo.label}</Badge>
                    </div>
                    <div className="px-4 py-3 text-[#cecece] text-sm">{log.actor?.email || 'System'}</div>
                    <div className="px-4 py-3 text-[#6a6b6c] text-sm truncate max-w-xs">{log.details ? JSON.stringify(log.details) : '—'}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
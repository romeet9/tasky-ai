'use client';

import { Users, CheckSquare, Lightning, ChartLine } from '@phosphor-icons/react';
import { MetricCard } from '@/components/admin/raycast';
import type { DashboardMetrics } from '@/types/admin';

interface DashboardGridProps {
  metrics: DashboardMetrics;
}

export default function DashboardGrid({ metrics }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MetricCard
        title="Total Users"
        value={metrics.totalUsers.value}
        change={metrics.totalUsers.change}
        trend={metrics.totalUsers.trend}
        icon={<Users className="w-5 h-5" weight="regular" />}
      />
      <MetricCard
        title="Tasks Created"
        value={metrics.tasksCreated.value}
        change={metrics.tasksCreated.change}
        trend={metrics.tasksCreated.trend}
        icon={<CheckSquare className="w-5 h-5" weight="regular" />}
      />
      <MetricCard
        title="Tokens Used"
        value={metrics.tokensUsed.value}
        change={metrics.tokensUsed.change}
        trend={metrics.tokensUsed.trend}
        icon={<Lightning className="w-5 h-5" weight="regular" />}
      />
      <MetricCard
        title="Active Rate"
        value={metrics.activeRate.value}
        change={metrics.activeRate.change}
        trend={metrics.activeRate.trend}
        icon={<ChartLine className="w-5 h-5" weight="regular" />}
      />
    </div>
  );
}
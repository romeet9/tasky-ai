'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from '@/components/admin/shared/DateRangePicker';
import DashboardGrid from '@/components/admin/cards/DashboardGrid';
import UserGrowthChart from '@/components/admin/charts/UserGrowthChart';
import TaskStatusChart from '@/components/admin/charts/TaskStatusChart';
import TokenUsageChart from '@/components/admin/charts/TokenUsageChart';
import FeatureUsageChart from '@/components/admin/charts/FeatureUsageChart';
import { useDataSource } from '@/hooks/useDataSource';
import { 
  fetchDashboardMetrics, 
  fetchUserMetrics, 
  fetchTaskMetrics, 
  fetchTokenMetrics, 
  fetchFeatureMetrics 
} from '@/lib/admin/analytics-client';
import type { DateRangeType, DashboardMetrics, UserMetrics, TaskMetrics, TokenMetrics, FeatureMetrics } from '@/types/admin';

export default function AdminDashboard() {
  const { source } = useDataSource();
  const [dateRange, setDateRange] = useState<DateRangeType>('7d');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [userData, setUserData] = useState<UserMetrics[]>([]);
  const [taskData, setTaskData] = useState<TaskMetrics[]>([]);
  const [tokenData, setTokenData] = useState<TokenMetrics[]>([]);
  const [featureData, setFeatureData] =useState<FeatureMetrics[]>([]);

  useEffect(() => {
    async function loadData() {
      const range = dateRange === 'custom' ? '7d' : dateRange;
      const [metricsData, userMetrics, taskMetrics, tokenMetrics, featureMetrics] = await Promise.all([
        fetchDashboardMetrics(source),
        fetchUserMetrics(range, source),
        fetchTaskMetrics(range, source),
        fetchTokenMetrics(range, source),
        fetchFeatureMetrics(range, source),
      ]);

      setMetrics(metricsData);
      setUserData(userMetrics);
      setTaskData(taskMetrics);
      setTokenData(tokenMetrics);
      setFeatureData(featureMetrics);
    }

    loadData();
  }, [dateRange, source]);

  const latestTaskStatus = taskData[0]?.byStatus || { pending: 0, 'in-progress': 0, completed: 0 };

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#07080a] border-b border-white/[0.06]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#f9f9f9] font-semibold text-2xl tracking-wide">Dashboard</h1>
            <p className="text-[#6a6b6c] text-sm mt-1">Overview of your application metrics</p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="p-8">
        <DashboardGrid metrics={metrics} />

        <div className="mb-6">
          <UserGrowthChart data={userData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TaskStatusChart data={latestTaskStatus} />
          <TokenUsageChart data={tokenData} />
        </div>

        <div className="mb-6">
          <FeatureUsageChart data={featureData} />
        </div>
      </div>
    </div>
  );
}
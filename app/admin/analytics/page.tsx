'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, SegmentedControl, MetricCard, ChartContainer } from '@/components/admin/raycast';
import DateRangePicker from '@/components/admin/shared/DateRangePicker';
import { useDataSource } from '@/hooks/useDataSource';
import {
  fetchUserMetrics,
  fetchTaskMetrics,
  fetchTokenMetrics,
  fetchFeatureMetrics,
} from '@/lib/admin/analytics-client';
import { rechartsConfig, chartColors, taskStatusColors, providerColors } from '@/lib/admin/raycast-theme';
import { formatDate, formatNumber } from '@/lib/admin/format';
import type { DateRangeType, UserMetrics, TaskMetrics, TokenMetrics, FeatureMetrics } from '@/types/admin';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={rechartsConfig.tooltip.contentStyle}>
      <p style={rechartsConfig.tooltip.labelStyle}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, padding: '2px 0', fontSize: '13px' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { source } = useDataSource();
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState<DateRangeType>('7d');
  const [userData, setUserData] = useState<UserMetrics[]>([]);
  const [taskData, setTaskData] = useState<TaskMetrics[]>([]);
  const [tokenData, setTokenData] = useState<TokenMetrics[]>([]);
  const [featureData, setFeatureData] = useState<FeatureMetrics[]>([]);

  useEffect(() => {
    async function loadData() {
      const range = dateRange === 'custom' ? '7d' : dateRange;
      const [users, tasks, tokens, features] = await Promise.all([
        fetchUserMetrics(range, source),
        fetchTaskMetrics(range, source),
        fetchTokenMetrics(range, source),
        fetchFeatureMetrics(range, source),
      ]);
      setUserData(users);
      setTaskData(tasks);
      setTokenData(tokens);
      setFeatureData(features);
    }
    loadData();
  }, [dateRange, source]);

  const userChartData = userData.map(item => ({
    date: formatDate(item.date),
    'New Users': item.newUsers,
    'Total Users': item.totalUsers,
  }));

  const totalNewUsers = userData.reduce((s, d) => s + d.newUsers, 0);
  const peakDay = userData.length > 0
    ? userData.reduce((max, d) => d.newUsers > max.newUsers ? d : max, userData[0])
    : null;

  const latestTaskStatus = taskData.length > 0
    ? taskData[taskData.length - 1].byStatus
    : { pending: 0, 'in-progress': 0, completed: 0 };

  const taskChartData = taskData.map(item => ({
    date: formatDate(item.date),
    Created: item.created,
    Completed: item.byStatus.completed,
    'In Progress': item.byStatus['in-progress'],
  }));

  const taskDonutData = [
    { name: 'Pending', value: latestTaskStatus.pending, color: taskStatusColors.pending },
    { name: 'In Progress', value: latestTaskStatus['in-progress'], color: taskStatusColors['in-progress'] },
    { name: 'Completed', value: latestTaskStatus.completed, color: taskStatusColors.completed },
  ];
  const taskTotal = taskDonutData.reduce((s, d) => s + d.value, 0);

  const featureChartData = featureData.map(item => ({
    date: formatDate(item.date),
    Tasks: item.taskCreations,
    Meetings: item.meetingCreations,
  }));

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tokenChartData = tokenData.map(item => {
    const date = new Date(item.date);
    return {
      day: DAYS[date.getDay()],
      Groq: Math.round(item.byProvider.Groq.total / 1000),
      Ollama: Math.round(item.byProvider.Ollama.total / 1000),
      'Together AI': Math.round(item.byProvider.Together.total / 1000),
      OpenRouter: Math.round(item.byProvider.OpenRouter.total / 1000),
    };
  }).reverse();

  const totalTokens = tokenData.reduce((s, d) => {
    return s + d.byProvider.Groq.total + d.byProvider.Ollama.total + d.byProvider.Together.total + d.byProvider.OpenRouter.total;
  }, 0);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#07080a] border-b border-white/[0.06]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-[#f9f9f9] font-semibold text-2xl tracking-wide">Analytics</h1>
            <p className="text-[#6a6b6c] text-sm mt-1">Detailed metrics and trends</p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6">
          <SegmentedControl
            segments={['Users', 'Tasks', 'Tokens', 'Features']}
            activeIndex={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 0 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Total New Users</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{formatNumber(totalNewUsers)}</p>
              </Card>
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Peak Day</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{peakDay ? formatNumber(peakDay.newUsers) : '—'}</p>
                {peakDay && <p className="text-[#6a6b6c] text-xs mt-1">{formatDate(peakDay.date)}</p>}
              </Card>
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Avg Growth Rate</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">
                  {userData.length > 0 ? (userData.reduce((s, d) => s + d.weeklyGrowthRate, 0) / userData.length).toFixed(1) : '0'}%
                </p>
              </Card>
            </div>
            <ChartContainer title="User Growth Over Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={rechartsConfig.grid.stroke} />
                  <XAxis dataKey="date" stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={{ stroke: '#434345' }} tickLine={false} />
                  <YAxis stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }} />
                  <Line type="monotone" dataKey="New Users" stroke={chartColors.blue} strokeWidth={2} dot={{ r: 3, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Total Users" stroke={chartColors.red} strokeWidth={2} dot={{ r: 3, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Current Pending</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{formatNumber(latestTaskStatus.pending)}</p>
                <p className="text-[#ffbc33] text-xs font-semibold mt-1">Pending</p>
              </Card>
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">In Progress</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{formatNumber(latestTaskStatus['in-progress'])}</p>
                <p className="text-[#55b3ff] text-xs font-semibold mt-1">Active</p>
              </Card>
              <Card className="p-5">
                <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Completed</p>
                <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{formatNumber(latestTaskStatus.completed)}</p>
                <p className="text-[#5fc992] text-xs font-semibold mt-1">Done</p>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer title="Task Creation Over Time">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradientCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.green} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={chartColors.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={rechartsConfig.grid.stroke} />
                    <XAxis dataKey="date" stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={{ stroke: '#434345' }} tickLine={false} />
                    <YAxis stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }} />
                    <Area type="monotone" dataKey="Created" stroke={chartColors.blue} strokeWidth={2} fill="url(#gradientCreated)" dot={false} />
                    <Area type="monotone" dataKey="Completed" stroke={chartColors.green} strokeWidth={2} fill="url(#gradientCompleted)" dot={false} />
                    <Area type="monotone" dataKey="In Progress" stroke={chartColors.yellow} strokeWidth={2} fill="transparent" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Task Distribution" subtitle={`${taskTotal} total tasks`}>
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={taskDonutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                        {taskDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const entry = payload[0];
                        return (
                          <div style={rechartsConfig.tooltip.contentStyle}>
                            <p style={{ color: entry.payload.color, fontWeight: 600, fontSize: '13px' }}>
                              {entry.name}: {(entry.value ?? 0).toLocaleString()}
                            </p>
                          </div>
                        );
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    {taskDonutData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-[#9c9c9d] text-xs tracking-wide">{item.name}</span>
                        <span className="text-[#f9f9f9] text-sm font-semibold">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartContainer>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <Card className="p-5 mb-6">
              <p className="text-[#9c9c9d] text-sm font-medium tracking-wide">Total Tokens Consumed</p>
              <p className="text-[#f9f9f9] text-2xl font-semibold tracking-tight mt-1">{formatNumber(totalTokens)}</p>
            </Card>
            <ChartContainer title="Token Usage by Provider" subtitle="Values in thousands (K)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokenChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={rechartsConfig.grid.stroke} />
                  <XAxis dataKey="day" stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={{ stroke: '#434345' }} tickLine={false} />
                  <YAxis stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${v}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }} />
                  <Bar dataKey="Groq" stackId="a" fill={providerColors.Groq} maxBarSize={40} />
                  <Bar dataKey="Ollama" stackId="a" fill={providerColors.Ollama} maxBarSize={40} />
                  <Bar dataKey="Together AI" stackId="a" fill={providerColors.Together} maxBarSize={40} />
                  <Bar dataKey="OpenRouter" stackId="a" fill={providerColors.OpenRouter} radius={[3, 3, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}

        {activeTab === 3 && (
          <ChartContainer title="Feature Usage Over Time" subtitle="Tasks vs Meetings created daily">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={featureChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.red} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={rechartsConfig.grid.stroke} />
                <XAxis dataKey="date" stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={{ stroke: '#434345' }} tickLine={false} />
                <YAxis stroke={rechartsConfig.axis.stroke} tick={{ fill: '#9c9c9d', fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }} />
                <Area type="monotone" dataKey="Tasks" stroke={chartColors.blue} strokeWidth={2} fill="url(#gradientTasks)" dot={{ r: 3, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Meetings" stroke={chartColors.red} strokeWidth={2} fill="url(#gradientMeetings)" dot={{ r: 3, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
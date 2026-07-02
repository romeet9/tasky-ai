'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/admin/raycast';
import { rechartsConfig, chartColors } from '@/lib/admin/raycast-theme';
import { formatDate } from '@/lib/admin/format';
import type { FeatureMetrics } from '@/types/admin';

interface FeatureUsageChartProps {
  data: FeatureMetrics[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={rechartsConfig.tooltip.contentStyle}>
      <p style={rechartsConfig.tooltip.labelStyle}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, padding: '2px 0', fontSize: '13px' }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    Tasks: item.taskCreations,
    Meetings: item.meetingCreations,
  }));

  return (
    <ChartContainer title="Feature Usage Comparison" subtitle="Tasks vs Meetings created daily">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
          <XAxis
            dataKey="date"
            stroke={rechartsConfig.axis.stroke}
            tick={{ fill: rechartsConfig.axis.tick.fill, fontSize: 12 }}
            axisLine={{ stroke: rechartsConfig.axis.stroke }}
            tickLine={false}
          />
          <YAxis
            stroke={rechartsConfig.axis.stroke}
            tick={{ fill: rechartsConfig.axis.tick.fill, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }}
          />
          <Area
            type="monotone"
            dataKey="Tasks"
            stroke={chartColors.blue}
            strokeWidth={2}
            fill="url(#gradientTasks)"
            dot={{ r: 3, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="Meetings"
            stroke={chartColors.red}
            strokeWidth={2}
            fill="url(#gradientMeetings)"
            dot={{ r: 3, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
'use client';

import {
  LineChart,
  Line,
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
import type { UserMetrics } from '@/types/admin';

interface UserGrowthChartProps {
  data: UserMetrics[];
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

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    'New Users': item.newUsers,
    'Total Users': item.totalUsers,
  }));

  return (
    <ChartContainer title="User Growth Trends">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
          <Line
            type="monotone"
            dataKey="New Users"
            stroke={chartColors.blue}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: chartColors.blue, stroke: '#101111', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="Total Users"
            stroke={chartColors.red}
            strokeWidth={2}
            dot={{ r: 3, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: chartColors.red, stroke: '#101111', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
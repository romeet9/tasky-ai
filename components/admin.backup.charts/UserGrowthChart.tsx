'use client';

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { UserMetrics } from '@/types/admin';
import { chartTheme } from '@/lib/admin/chart-config';
import { formatDate } from '@/lib/admin/format';

interface UserGrowthChartProps {
  data: UserMetrics[];
}

export default function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    newUsers: item.newUsers,
    totalUsers: item.totalUsers,
  }));

  return (
    <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-[#f9f9f9] font-semibold text-base mb-4 tracking-wide">
        User Growth Trends
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid 
            strokeDasharray={chartTheme.cartesian.strokeDasharray} 
            stroke={chartTheme.cartesian.stroke} 
          />
          <XAxis 
            dataKey="date" 
            stroke={chartTheme.axis.stroke}
            fontSize={chartTheme.axis.fontSize}
            fontWeight={chartTheme.axis.fontWeight}
            letterSpacing={chartTheme.axis.letterSpacing}
          />
          <YAxis 
            stroke={chartTheme.axis.stroke}
            fontSize={chartTheme.axis.fontSize}
            fontWeight={chartTheme.axis.fontWeight}
            letterSpacing={chartTheme.axis.letterSpacing}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: chartTheme.tooltip.backgroundColor,
              border: chartTheme.tooltip.border,
              borderRadius: chartTheme.tooltip.borderRadius,
              color: chartTheme.tooltip.color,
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke={chartTheme.colors.primary}
            strokeWidth={2}
            dot={{ fill: chartTheme.colors.primary, strokeWidth: 0, r: 4 }}
            name="New Users"
          />
          <Line 
            type="monotone" 
            dataKey="totalUsers" 
            stroke={chartTheme.colors.secondary}
            strokeWidth={2}
            dot={{ fill: chartTheme.colors.secondary, strokeWidth: 0, r: 4 }}
            name="Total Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
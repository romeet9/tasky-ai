'use client';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { FeatureMetrics } from '@/types/admin';
import { chartTheme } from '@/lib/admin/chart-config';
import { formatDate } from '@/lib/admin/format';

interface FeatureUsageChartProps {
  data: FeatureMetrics[];
}

export default function FeatureUsageChart({ data }: FeatureUsageChartProps) {
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    tasks: item.taskCreations,
    meetings: item.meetingCreations,
  }));

  return (
    <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-[#f9f9f9] font-semibold text-base mb-4 tracking-wide">
        Feature Usage Comparison
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
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
          <Area 
            type="monotone" 
            dataKey="tasks" 
            stroke={chartTheme.colors.primary}
            fill="rgba(85, 179, 255, 0.2)"
            strokeWidth={2}
            name="Tasks"
          />
          <Area 
            type="monotone" 
            dataKey="meetings" 
            stroke={chartTheme.colors.secondary}
            fill="rgba(255, 99, 99, 0.2)"
            strokeWidth={2}
            name="Meetings"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
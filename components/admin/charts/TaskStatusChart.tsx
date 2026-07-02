'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/admin/raycast';
import { rechartsConfig, taskStatusColors } from '@/lib/admin/raycast-theme';

interface TaskStatusChartProps {
  data: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
}

const STATUS_DATA = [
  { name: 'Pending', key: 'pending' as const, color: taskStatusColors.pending },
  { name: 'In Progress', key: 'in-progress' as const, color: taskStatusColors['in-progress'] },
  { name: 'Completed', key: 'completed' as const, color: taskStatusColors.completed },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <div style={rechartsConfig.tooltip.contentStyle}>
      <p style={{ color: entry.payload.color, fontWeight: 600, fontSize: '13px' }}>
        {entry.name}: {entry.value.toLocaleString()}
      </p>
    </div>
  );
};

export default function TaskStatusChart({ data }: TaskStatusChartProps) {
  const chartData = STATUS_DATA.map(item => ({
    name: item.name,
    value: data[item.key],
    color: item.color,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartContainer title="Task Status" subtitle={`${total} total tasks`}>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[#9c9c9d] text-xs tracking-wide">{item.name}</span>
              <span className="text-[#f9f9f9] text-sm font-semibold">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
}
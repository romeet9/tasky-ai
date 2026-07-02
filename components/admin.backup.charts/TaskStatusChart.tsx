'use client';

import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { chartTheme, taskStatusColors } from '@/lib/admin/chart-config';

interface TaskStatusChartProps {
  data: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
}

export default function TaskStatusChart({ data }: TaskStatusChartProps) {
  const chartData = [
    { name: 'Pending', value: data.pending, color: taskStatusColors.pending },
    { name: 'In Progress', value: data['in-progress'], color: taskStatusColors['in-progress'] },
    { name: 'Completed', value: data.completed, color: taskStatusColors.completed },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-[#f9f9f9] font-semibold text-base mb-4 tracking-wide">
        Task Status
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: chartTheme.tooltip.backgroundColor,
              border: chartTheme.tooltip.border,
              borderRadius: chartTheme.tooltip.borderRadius,
              color: chartTheme.tooltip.color,
            }}
            formatter={(value) => {
              const numValue = typeof value === 'number' ? value : 0;
              return [`${numValue} (${((numValue / total) * 100).toFixed(1)}%)`, ''];
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => (
              <span style={{ color: chartTheme.colors.textPrimary, fontSize: 14, letterSpacing: '0.2px' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#9c9c9d] text-xs">{item.name}</span>
            </div>
            <span className="text-[#f9f9f9] font-semibold text-sm">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
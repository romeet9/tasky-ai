'use client';

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import type { TokenMetrics } from '@/types/admin';
import { chartTheme, providerColors } from '@/lib/admin/chart-config';
import { formatDate, formatNumber } from '@/lib/admin/format';

interface TokenUsageChartProps {
  data: TokenMetrics[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = data.map((item, index) => {
    const date = new Date(item.date);
    return {
      day: DAYS[date.getDay()],
      Groq: Math.round(item.byProvider.Groq.total / 1000), // Convert to thousands
      Ollama: Math.round(item.byProvider.Ollama.total / 1000),
      Together: Math.round(item.byProvider.Together.total / 1000),
      OpenRouter: Math.round(item.byProvider.OpenRouter.total / 1000),
    };
  }).reverse(); // Show oldest to newest

  return (
    <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
      <h3 className="text-[#f9f9f9] font-semibold text-base mb-4 tracking-wide">
        Token Usage by Provider
      </h3>
      <p className="text-[#9c9c9d] text-xs mb-4 tracking-wide">
        Values in thousands (K)
      </p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid 
            strokeDasharray={chartTheme.cartesian.strokeDasharray} 
            stroke={chartTheme.cartesian.stroke} 
          />
          <XAxis 
            dataKey="day" 
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
            tickFormatter={(value) => `${value}K`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: chartTheme.tooltip.backgroundColor,
              border: chartTheme.tooltip.border,
              borderRadius: chartTheme.tooltip.borderRadius,
              color: chartTheme.tooltip.color,
            }}
            formatter={(value) => [`${value}K tokens`, '']}
          />
          <Legend />
          <Bar 
            dataKey="Groq" 
            fill={providerColors.Groq} 
            radius={[4, 4, 0, 0]}
            name="Groq"
          />
          <Bar 
            dataKey="Ollama" 
            fill={providerColors.Ollama} 
            radius={[4, 4, 0, 0]}
            name="Ollama"
          />
          <Bar 
            dataKey="Together" 
            fill={providerColors.Together} 
            radius={[4, 4, 0, 0]}
            name="Together AI"
          />
          <Bar 
            dataKey="OpenRouter" 
            fill={providerColors.OpenRouter} 
            radius={[4, 4, 0, 0]}
            name="OpenRouter"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '@/components/admin/raycast';
import { rechartsConfig, providerColors } from '@/lib/admin/raycast-theme';
import type { TokenMetrics } from '@/types/admin';

interface TokenUsageChartProps {
  data: TokenMetrics[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={rechartsConfig.tooltip.contentStyle}>
      <p style={rechartsConfig.tooltip.labelStyle}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, padding: '2px 0', fontSize: '13px' }}>
          {entry.name}: {entry.value.toLocaleString()}K
        </p>
      ))}
    </div>
  );
};

export default function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = data.map((item) => {
    const date = new Date(item.date);
    return {
      day: DAYS[date.getDay()],
      Groq: Math.round(item.byProvider.Groq.total / 1000),
      Ollama: Math.round(item.byProvider.Ollama.total / 1000),
      'Together AI': Math.round(item.byProvider.Together.total / 1000),
      OpenRouter: Math.round(item.byProvider.OpenRouter.total / 1000),
    };
  }).reverse();

  return (
    <ChartContainer title="Token Usage by Provider" subtitle="Values in thousands (K)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={rechartsConfig.grid.stroke} />
          <XAxis
            dataKey="day"
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
            tickFormatter={(v) => `${v}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fill: '#cecece', fontSize: 12, paddingTop: 16 }}
          />
          <Bar dataKey="Groq" stackId="a" fill={providerColors.Groq} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Ollama" stackId="a" fill={providerColors.Ollama} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Together AI" stackId="a" fill={providerColors.Together} radius={[0, 0, 0, 0]} maxBarSize={40} />
          <Bar dataKey="OpenRouter" stackId="a" fill={providerColors.OpenRouter} radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
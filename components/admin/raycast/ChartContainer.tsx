'use client';

import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({ title, subtitle, children, className = '' }: ChartContainerProps) {
  return (
    <div
      className={`bg-[#101111] border border-white/[0.06] rounded-xl p-6 ${className}`}
      style={{ boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset' }}
    >
      <h3 className="text-[#f9f9f9] text-base font-semibold tracking-wide">{title}</h3>
      {subtitle && <p className="text-[#9c9c9d] text-xs mt-1 tracking-wide">{subtitle}</p>}
      <div className="mt-4 h-[280px]">
        {children}
      </div>
    </div>
  );
}
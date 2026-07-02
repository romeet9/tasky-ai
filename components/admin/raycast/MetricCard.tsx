'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, trend = 'neutral', icon }: MetricCardProps) {
  return (
    <div
      className="bg-[#101111] border border-white/[0.06] rounded-xl p-5"
      style={{ boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset' }}
    >
      <div className="flex items-start gap-3">
        <div className="text-[#9c9c9d] w-10 h-10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#9c9c9d] text-sm font-medium tracking-wide truncate">{title}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[#f9f9f9] text-2xl font-semibold tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {change && (
              <span className={`text-xs font-semibold ${
                trend === 'up' ? 'text-[#5fc992]' : trend === 'down' ? 'text-[#FF6363]' : 'text-[#6a6b6c]'
              }`}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
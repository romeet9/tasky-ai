'use client';

import { ReactNode } from 'react';
import { TrendUp, TrendDown, ArrowsLeftRight } from '@phosphor-icons/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: ReactNode;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon 
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendUp className="w-3 h-3" />;
      case 'down':
        return <TrendDown className="w-3 h-3" />;
      default:
        return <ArrowsLeftRight className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-[#5fc992]';
      case 'down':
        return 'text-[#FF6363]';
      default:
        return 'text-[#9c9c9d]';
    }
  };

  return (
    <div className="bg-[#101111] border border-white/[0.06] rounded-xl p-6">
      <div 
        className="shadow-[rgb(27,28,30)_0px_0px_0px_1px,rgb(7,8,10)_0px_0px_0px_1px_inset] -mx-6 -my-6 p-6 rounded-xl"
        style={{ boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="text-[#9c9c9d] w-10 h-10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        
        <p className="text-[#9c9c9d] text-sm font-medium tracking-wide mb-1">
          {title}
        </p>
        
        <div className="flex items-end justify-between">
          <h3 className="text-[#f9f9f9] text-4xl font-semibold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          
          {change && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium tracking-wide">{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
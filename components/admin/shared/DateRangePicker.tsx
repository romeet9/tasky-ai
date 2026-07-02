'use client';

import { useState } from 'react';
import { Calendar } from '@phosphor-icons/react';
import type { DateRangeType } from '@/types/admin';

interface DateRangePickerProps {
  value: DateRangeType;
  onChange: (range: DateRangeType) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { label: string; value: DateRangeType }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
  ];

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#101111] border border-white/[0.06] rounded-lg text-[#f9f9f9] font-medium text-sm tracking-wide hover:bg-white/[0.05] transition-all"
        style={{ boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset' }}
      >
        <Calendar className="w-4 h-4" />
        <span>{selectedOption?.label || 'Select Range'}</span>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-2 left-0 bg-[#101111] border border-white/[0.06] rounded-xl shadow-xl z-50 min-w-[200px]"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.5) 0px 0px 0px 2px, rgba(255, 255, 255, 0.19) 0px 0px 14px' }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-3 text-left text-sm font-medium tracking-wide
                transition-all first:rounded-t-xl last:rounded-b-xl
                ${option.value === value
                  ? 'bg-[#FF6363]/10 text-[#FF6363] border-l-2 border-[#FF6363]'
                  : 'text-[#cecece] hover:bg-white/[0.05]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ segments, activeIndex, onChange }: SegmentedControlProps) {
  return (
    <div
      className="inline-flex items-center bg-[#101111] border border-white/[0.06] rounded-lg p-0.5"
      style={{ boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset' }}
    >
      {segments.map((segment, index) => (
        <button
          key={segment}
          onClick={() => onChange(index)}
          className={`px-4 py-1.5 text-sm font-medium tracking-wide rounded-md transition-all duration-150 ${
            index === activeIndex
              ? 'bg-[#FF6363]/10 text-[#FF6363] border border-[#FF6363]/40'
              : 'text-[#9c9c9d] hover:text-[#cecece] border border-transparent'
          }`}
        >
          {segment}
        </button>
      ))}
    </div>
  );
}
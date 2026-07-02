'use client';

import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return <div className={`w-full ${className}`}>{children}</div>;
}

interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <div className="border-b border-white/[0.06]">
      {children}
    </div>
  );
}

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
}

export function TableHeaderCell({ children, className = '' }: TableHeaderCellProps) {
  return (
    <div className={`px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase ${className}`}>
      {children}
    </div>
  );
}

interface TableBodyProps {
  children: ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <div>{children}</div>;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <div className={`flex items-center border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors ${className}`}>
      {children}
    </div>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <div className={`px-4 py-3 text-[#cecece] text-sm ${className}`}>
      {children}
    </div>
  );
}

interface TableGridProps {
  columns: number;
  children: ReactNode;
  className?: string;
}

export function TableGrid({ columns, children, className = '' }: TableGridProps) {
  return (
    <div className={className}>
      <div
        className="grid border-b border-white/[0.06]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}

export function GridHeaderCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 text-[#9c9c9d] text-xs font-semibold tracking-wide uppercase ${className}`}>
      {children}
    </div>
  );
}

export function GridCell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3 text-[#cecece] text-sm border-b border-white/[0.06] ${className}`}>
      {children}
    </div>
  );
}

export function GridRow({ columns, children, className = '' }: { columns: number; children: ReactNode; className?: string }) {
  return (
    <div
      className={`grid hover:bg-white/[0.02] transition-colors ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
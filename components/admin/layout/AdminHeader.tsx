'use client';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-[#07080a] border-b border-white/[0.06] px-8 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-[#f9f9f9] font-semibold text-xl tracking-wide">{title}</h1>
        {subtitle && (
          <p className="text-[#6a6b6c] text-sm">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
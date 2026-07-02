'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'xs';
}

const variantStyles = {
  default: 'bg-[#1b1c1e] text-[#cecece] border-white/[0.06]',
  success: 'bg-[#5fc992]/10 text-[#5fc992] border-[#5fc992]/30',
  warning: 'bg-[#ffbc33]/10 text-[#ffbc33] border-[#ffbc33]/30',
  error: 'bg-[#FF6363]/10 text-[#FF6363] border-[#FF6363]/30',
  info: 'bg-[#55b3ff]/10 text-[#55b3ff] border-[#55b3ff]/30',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const sizeStyles = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-wide rounded-md border ${variantStyles[variant]} ${sizeStyles}`}
    >
      {children}
    </span>
  );
}
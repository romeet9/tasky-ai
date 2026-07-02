'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function Button({ children, onClick, variant = 'secondary', size = 'md', disabled = false, className = '' }: ButtonProps) {
  const sizeStyles = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm';
  const variantStyles = {
    primary: 'bg-[#FF6363] text-white hover:opacity-80 border-transparent',
    secondary: 'bg-[#101111] text-[#cecece] border border-white/[0.06] hover:bg-white/[0.05] hover:text-[#f9f9f9]',
    ghost: 'text-[#9c9c9d] hover:text-[#f9f9f9] border-transparent',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium tracking-wide rounded-lg transition-all duration-150 ${sizeStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
}
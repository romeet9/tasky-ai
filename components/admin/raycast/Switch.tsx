'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55b3ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080a] ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${
        checked
          ? 'bg-[#FF6363]'
          : 'bg-[#434345]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {checked && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 12px hsla(0, 100%, 69%, 0.3)' }}
        />
      )}
    </button>
  );
}
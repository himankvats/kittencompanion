'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  small?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#111] text-white hover:bg-[#333] disabled:bg-[#d0d0d0]',
  ghost: 'bg-transparent text-[#555] border border-[#e0e0e0] hover:bg-gray-50',
  danger: 'bg-white text-[#dc2626] border border-[#fecaca] hover:bg-red-50',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  small = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-[10px] font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111]',
        small ? 'text-[13px] px-[18px] py-[9px]' : 'text-[15px] px-5 py-[13px]',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

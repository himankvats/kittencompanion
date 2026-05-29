/**
 * Reusable Button component with primary and secondary variants.
 * Used across all forms and actions in the Kitten Companion UI.
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
};

export function Button({
  variant = 'primary',
  loading = false,
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
        'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150',
        variantClasses[variant],
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].join(' ')}
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

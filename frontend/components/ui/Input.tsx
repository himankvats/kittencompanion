/**
 * Reusable labeled input component. Wraps an HTML input with a label and
 * optional error message for use across all forms.
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={[
          'w-full px-3 py-2 border rounded-md text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
          className,
        ].join(' ')}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Input;

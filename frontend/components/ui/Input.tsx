'use client';

import React, { useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  id: string;
}

export function Input({ label, optional, error, hint, id, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-[#888] mb-1.5"
      >
        {label}
        {optional && <span className="text-[10px] font-normal text-[#bbb] normal-case tracking-normal">— Optional</span>}
      </label>
      <input
        id={id}
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        className={[
          'w-full px-[14px] py-3 text-[15px] font-normal bg-white text-[#111]',
          'border-[1.5px] rounded-[10px] outline-none transition-colors duration-200 box-border',
          error ? 'border-[#e85d5d]' : focused ? 'border-[#111]' : 'border-[#e0e0e0]',
          className,
        ].filter(Boolean).join(' ')}
      />
      {hint && !error && <p className="text-[12px] text-[#aaa] mt-1 mb-0">{hint}</p>}
      {error && <p className="text-[12px] text-[#e85d5d] mt-1 mb-0">{error}</p>}
    </div>
  );
}

export default Input;

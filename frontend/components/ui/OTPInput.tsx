'use client';

import React, { useRef } from 'react';

export interface OTPInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function OTPInput({ value, onChange }: OTPInputProps) {
  const digits = Array(6).fill('').map((_, i) => value[i] || '');
  const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const handle = (i: number, val: string) => {
    const arr = [...digits];
    arr[i] = val.replace(/\D/g, '').slice(-1);
    onChange(arr.join(''));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center my-5">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className={[
            'w-11 h-[52px] text-center text-[22px] font-bold rounded-[10px] outline-none',
            'border-[1.5px] transition-all duration-150 font-sans text-[#111]',
            d ? 'border-[#111] bg-[#f9f9f9]' : 'border-[#e0e0e0] bg-white',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export default OTPInput;

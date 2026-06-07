'use client';

import React from 'react';

export interface ChipOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  label: string;
  optional?: boolean;
  options: ChipOption[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function ChipSelect({ label, optional, options, value, onChange, error }: ChipSelectProps) {
  return (
    <div className="mb-4">
      <label className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 ${error ? 'text-[#e85d5d]' : 'text-[#888]'}`}>
        {label}
        {optional && <span className="text-[10px] font-normal text-[#bbb] normal-case tracking-normal">— Optional</span>}
      </label>
      <div className={`flex flex-wrap gap-2 ${error ? 'p-2 rounded-[10px] border-[1.5px] border-[#fecaca] bg-[#fef9f9]' : ''} transition-all duration-200`}>
        {options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(selected ? '' : opt.value)}
              className={[
                'px-[14px] py-2 rounded-[8px] border-[1.5px] text-[13px] transition-all duration-150 font-sans',
                selected
                  ? 'border-[#111] bg-[#111] text-white font-semibold'
                  : 'border-[#e0e0e0] bg-white text-[#555] font-normal hover:border-[#999]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-[12px] text-[#e85d5d] mt-1.5 mb-0">{error}</p>}
    </div>
  );
}

export default ChipSelect;

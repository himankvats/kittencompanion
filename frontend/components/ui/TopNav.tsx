'use client';

import React from 'react';
import { ChevronLeft } from '../icons';

export interface TopNavProps {
  title?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export function TopNav({ title, onBack, action }: TopNavProps) {
  return (
    <div className="bg-white border-b border-[#f0f0f0] px-5 py-[14px] flex justify-between items-center sticky top-0 z-[100]">
      {onBack ? (
        <button
          onClick={onBack}
          className="bg-transparent border-none cursor-pointer text-[#111] flex items-center gap-1.5 font-semibold text-[14px] p-0 font-sans"
        >
          <ChevronLeft size={18} />
          {title || 'Back'}
        </button>
      ) : (
        <span className="text-[16px] font-bold text-[#111]">{title}</span>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default TopNav;

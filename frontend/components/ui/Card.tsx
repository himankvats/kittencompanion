import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ title, children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-[16px] border border-[#f0f0f0]',
        'shadow-[0_1px_8px_rgba(0,0,0,0.06)]',
        padding ? 'p-5' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {title && (
        <h2 className="text-[13px] font-bold text-[#111] mb-3">{title}</h2>
      )}
      {children}
    </div>
  );
}

export default Card;

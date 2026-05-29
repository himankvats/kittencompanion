/**
 * Reusable Card component with an optional title. Used as a container for
 * dashboard sections, form panels, and summary blocks.
 */

import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm p-6',
        className,
      ].join(' ')}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}

export default Card;

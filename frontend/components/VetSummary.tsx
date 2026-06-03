import React from 'react';

export interface VetSummaryProps {
  htmlContent: string | null;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded w-1/2 mt-6" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

export function VetSummary({ htmlContent }: VetSummaryProps) {
  if (htmlContent === null) {
    return <Skeleton />;
  }

  if (!htmlContent) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-[16px] text-center text-gray-400">
        No report available yet. Submit at least one check-in first.
      </div>
    );
  }

  return (
    <div
      className="vet-report prose max-w-none border border-[#e0e0e0] rounded-[16px] p-8 bg-white print:border-0 print:p-0 print:rounded-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default VetSummary;

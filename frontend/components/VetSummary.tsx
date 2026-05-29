/**
 * VetSummary component — renders the Claude-generated HTML report inside a sandboxed
 * container, with a print-ready layout matching TDD Section 2.6.1 HTML template.
 */

import React from 'react';

export interface VetSummaryProps {
  htmlContent: string;
}

// TODO: Implement VetSummary (TDD Section 2.6.1)
// - Render htmlContent via dangerouslySetInnerHTML (report is internally generated — safe)
// - Apply print-specific CSS classes for clean PDF output
// - Show a skeleton loader when htmlContent is empty
export function VetSummary({ htmlContent }: VetSummaryProps) {
  if (!htmlContent) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
        No report generated yet.
      </div>
    );
  }

  return (
    <div
      className="prose max-w-none border border-gray-200 rounded-lg p-8 print:border-0 print:p-0"
      // TODO: Consider using an iframe for full HTML isolation
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default VetSummary;

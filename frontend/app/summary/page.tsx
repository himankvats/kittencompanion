/**
 * Vet summary page — fetches and renders the HTML behavioral baseline report.
 * Provides a print button for the owner to share with their vet.
 * See TDD Section 2.6.1 for API contract and HTML report structure.
 */

'use client';

import { useEffect, useState } from 'react';
import { VetSummary } from '@/components/VetSummary';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import type { SummaryGeneration } from '@/lib/types';

// TODO: Implement summary page (TDD Section 2.6.1)
// - Fetch petId from URL/state
// - Call apiClient.generateSummary(petId) on page load
// - Render VetSummary with the html_report
// - Show "Print" button that triggers window.print()
export default function SummaryPage() {
  const [htmlReport, setHtmlReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement report fetching
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vet Baseline Report</h1>
        <Button onClick={handlePrint} variant="secondary">
          Print / Download
        </Button>
      </div>
      {loading ? (
        <p className="text-gray-500">Generating report...</p>
      ) : htmlReport ? (
        <VetSummary htmlContent={htmlReport} />
      ) : (
        <p className="text-gray-500">No report available. Submit at least one check-in first.</p>
      )}
    </div>
  );
}

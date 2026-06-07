'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks';
import { useAppContext } from '@/lib/context';
import { apiClient } from '@/lib/api';
import { VetSummary } from '@/components/VetSummary';
import { DownloadIcon, ShareIcon } from '@/components/icons';

export default function SummaryPage() {
  const { user, loading } = useAuthGuard();
  const { pet } = useAppContext();
  const [htmlReport, setHtmlReport] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pet) return;
    apiClient.generateSummary(pet.id, { format: 'html', include_acute_events: true })
      .then(res => {
        setHtmlReport(res.html_report);
        setGeneratedAt(res.generated_at);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
        setHtmlReport('');
      });
  }, [pet]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${pet?.name}'s Vet Baseline Report`, text: 'Kitten Companion behavioral report' });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !pet) return null;

  return (
    <div className="px-5 pt-5 pb-8">
      <h2 className="text-[22px] font-extrabold text-[#111] tracking-[-0.4px] m-0 mb-4">Vet Baseline Report</h2>

      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[10px] p-3 mb-4 text-[13px] text-[#991b1b]">{error}</div>
      )}

      <VetSummary htmlContent={htmlReport} petName={pet.name} generatedAt={generatedAt} />

      {/* Action footer */}
      <div className="flex gap-3 mt-5 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-[#111] text-white text-[14px] font-semibold cursor-pointer border-none font-sans"
        >
          <DownloadIcon size={16} /> Print / Save PDF
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-[10px] bg-white border-[1.5px] border-[#e0e0e0] text-[14px] font-semibold cursor-pointer text-[#555] font-sans"
        >
          <ShareIcon size={16} /> Share
        </button>
      </div>

      <p className="text-[12px] text-[#aaa] text-center mt-4 leading-[1.5]">
        Share this report with your vet at {pet.name}&apos;s next appointment.
      </p>
    </div>
  );
}

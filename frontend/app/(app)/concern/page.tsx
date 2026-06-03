'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/lib/hooks';
import { useAppContext } from '@/lib/context';
import { apiClient } from '@/lib/api';
import type { AcuteEvent } from '@/lib/types';
import { ConcernForm, ConcernFormData } from '@/components/ConcernForm';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/Button';
import { CheckIcon, AlertIcon } from '@/components/icons';

const RESOLUTION_OPTIONS = [
  { value: 'resolved', label: 'Fully resolved ✅' },
  { value: 'better', label: 'Getting better 📈' },
  { value: 'worse', label: 'Getting worse 📉' },
  { value: 'vet_visit', label: 'Took to vet 🏥' },
  { value: 'unknown', label: 'Not sure 🤷' },
];

export default function ConcernPage() {
  const { user, loading } = useAuthGuard();
  const { pet } = useAppContext();
  const [result, setResult] = useState<AcuteEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !pet) return null;

  const handleSubmit = async (data: ConcernFormData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.flagConcern({ ...data, pet_id: pet.id });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit concern');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (resolution: string) => {
    if (!result) return;
    setResolving(true);
    try {
      await apiClient.resolveConcern(result.id, { resolution });
      setResolved(true);
    } catch { /* ignore */ } finally {
      setResolving(false);
    }
  };

  const handleNew = () => {
    setResult(null);
    setResolved(false);
    setError('');
  };

  return (
    <div className="px-5 pt-5 pb-2">
      <h2 className="text-[22px] font-extrabold text-[#111] tracking-[-0.4px] mb-4">Flag a Concern</h2>

      {!result ? (
        <>
          {error && <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[10px] p-3 mb-4 text-[13px] text-[#991b1b]">{error}</div>}
          <ConcernForm onSubmit={handleSubmit} loading={submitting} petId={pet.id} petName={pet.name} />
        </>
      ) : (
        <div className="space-y-4">
          {/* Severity */}
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[#888] mb-3">Assessment</p>
            <SeverityBadge severity={result.severity} />
          </div>

          {/* Guidance */}
          <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertIcon size={16} />
              <p className="text-[13px] font-bold text-[#111] m-0">Guidance for {pet.name}</p>
            </div>
            <div className="text-[14px] text-[#444] leading-[1.7] whitespace-pre-wrap">{result.response_text}</div>
          </div>

          {/* Follow-up resolution */}
          {!resolved ? (
            <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              <p className="text-[13px] font-bold text-[#111] mb-3">How did it go? (update when ready)</p>
              <div className="flex flex-col gap-2">
                {RESOLUTION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleResolve(opt.value)}
                    disabled={resolving}
                    className="text-left px-4 py-2.5 rounded-[10px] border-[1.5px] border-[#e0e0e0] bg-white text-[14px] text-[#555] hover:border-[#111] hover:text-[#111] transition-all cursor-pointer font-sans disabled:opacity-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#f0faf4] rounded-[16px] p-5 border-[1.5px] border-[#bbf0d0] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0">
                <CheckIcon size={16} />
              </div>
              <p className="text-[14px] font-semibold text-[#166534] m-0">Follow-up recorded. Thanks for updating!</p>
            </div>
          )}

          <Button variant="ghost" fullWidth onClick={handleNew}>
            Flag another concern
          </Button>
        </div>
      )}
    </div>
  );
}

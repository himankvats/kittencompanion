'use client';

import { useState } from 'react';
import { CheckInForm, CheckInFormData } from './CheckInForm';
import { apiClient } from '@/lib/api';
import { CheckIcon } from './icons';

interface CheckInBottomSheetProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  onSuccess: (feedback: string) => void;
}

export function CheckInBottomSheet({ open, onClose, petId, petName, onSuccess }: CheckInBottomSheetProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (data: CheckInFormData) => {
    setLoading(true);
    try {
      const res = await apiClient.createCheckin({ pet_id: petId, ...data });
      setFeedback(res.feedback_text);
      setTimeout(() => {
        onSuccess(res.feedback_text);
        onClose();
        setFeedback(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save check-in';
      if (msg.includes('UNIQUE') || msg.includes('already')) {
        onSuccess("You've already checked in today!");
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[500] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-t-[20px] p-6 pb-10 w-full max-w-[480px]"
      >
        <div className="w-9 h-1 rounded bg-[#e0e0e0] mx-auto mb-4" />
        {feedback ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#22c55e] flex items-center justify-center">
              <CheckIcon size={24} />
            </div>
            <p className="text-[15px] font-bold text-[#166534] text-center">{feedback}</p>
          </div>
        ) : (
          <CheckInForm onSubmit={handleSubmit} loading={loading} petName={petName} />
        )}
      </div>
    </div>
  );
}

export default CheckInBottomSheet;

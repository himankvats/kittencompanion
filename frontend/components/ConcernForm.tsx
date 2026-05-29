/**
 * ConcernForm component — renders concern type selection and dynamic follow-up
 * questions that vary per concern type (9 types, each with different questions).
 * See TDD Section 2.5.1 for concern types and followup_answers schemas.
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';

// 9 valid concern types from TDD Section 1.5
export type ConcernType =
  | 'not_eating' | 'vomiting' | 'litter_problems' | 'respiratory'
  | 'limping' | 'hiding' | 'eye_ear' | 'skin' | 'other';

export interface ConcernFormData {
  pet_id: string;
  concern_type: ConcernType;
  followup_answers: Record<string, unknown>;
}

export interface ConcernFormProps {
  onSubmit: (data: ConcernFormData) => Promise<void>;
  loading?: boolean;
  petId?: string;
}

// TODO: Implement ConcernForm (TDD Section 2.5.1)
// Phase 1: Show concern type selection (9 types as cards or dropdown)
// Phase 2: Show follow-up questions specific to the selected concern type
//          (see TDD Section 1.5 for question schemas per type)
// Phase 3: Collect all answers and call onSubmit
export function ConcernForm({ onSubmit, loading = false, petId = '' }: ConcernFormProps) {
  const [concernType, setConcernType] = useState<ConcernType | null>(null);
  const [step, setStep] = useState<'select' | 'questions'>('select');

  return (
    <div className="space-y-6">
      {/* TODO: Implement multi-step concern form UI */}
      <p className="text-gray-500 text-sm">ConcernForm UI not yet implemented.</p>
      {concernType && (
        <Button
          onClick={() =>
            onSubmit({ pet_id: petId, concern_type: concernType, followup_answers: {} })
          }
          loading={loading}
        >
          Submit Concern
        </Button>
      )}
    </div>
  );
}

export default ConcernForm;

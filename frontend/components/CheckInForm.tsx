/**
 * CheckInForm component — renders eating, litter, and activity level selectors
 * plus optional free-text notes fields for the daily health check-in.
 * See TDD Section 2.4.1 for valid enum values and required fields.
 */

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import type { CheckIn } from '@/lib/types';

export type CheckInFormData = Pick<
  CheckIn,
  'eating_level' | 'litter_status' | 'activity_level' | 'eating_notes' | 'litter_notes' | 'activity_notes' | 'owner_notes'
>;

export interface CheckInFormProps {
  onSubmit: (data: CheckInFormData) => Promise<void>;
  loading?: boolean;
}

// TODO: Implement CheckInForm (TDD Section 2.4.1)
// - eating_level selector: less_than_normal | normal | more_than_normal
// - litter_status selector: normal | diarrhea | constipation | mixed | not_used | unknown
// - activity_level selector: very_active | normal | calm | sleeping_most_of_day
// - Optional text areas for eating_notes, litter_notes, activity_notes, owner_notes
export function CheckInForm({ onSubmit, loading = false }: CheckInFormProps) {
  const [eatingLevel, setEatingLevel] = useState<CheckIn['eating_level']>('normal');
  const [litterStatus, setLitterStatus] = useState<CheckIn['litter_status']>('normal');
  const [activityLevel, setActivityLevel] = useState<CheckIn['activity_level']>('normal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submit handler
    await onSubmit({
      eating_level: eatingLevel,
      litter_status: litterStatus,
      activity_level: activityLevel,
      eating_notes: undefined,
      litter_notes: undefined,
      activity_notes: undefined,
      owner_notes: undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TODO: Implement full form UI with visual level selectors */}
      <p className="text-gray-500 text-sm">CheckInForm UI not yet implemented.</p>
      <Button type="submit" loading={loading}>
        Submit Check-in
      </Button>
    </form>
  );
}

export default CheckInForm;

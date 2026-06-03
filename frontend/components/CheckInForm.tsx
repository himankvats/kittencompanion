'use client';

import React, { useState } from 'react';
import { ChipSelect } from './ui/ChipSelect';
import { Button } from './ui/Button';
import type { CheckIn } from '@/lib/types';

export type CheckInFormData = Pick<
  CheckIn,
  'eating_level' | 'litter_status' | 'activity_level' | 'eating_notes' | 'litter_notes' | 'activity_notes' | 'owner_notes'
>;

export interface CheckInFormProps {
  onSubmit: (data: CheckInFormData) => Promise<void>;
  loading?: boolean;
  petName?: string;
}

const EATING_OPTIONS = [
  { value: 'less_than_normal', label: 'Less than usual' },
  { value: 'normal', label: 'Normal' },
  { value: 'more_than_normal', label: 'More than usual' },
];
const LITTER_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'constipation', label: 'Constipation' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'not_used', label: 'Not used' },
  { value: 'unknown', label: 'Unknown' },
];
const ACTIVITY_OPTIONS = [
  { value: 'very_active', label: 'Very active' },
  { value: 'normal', label: 'Normal' },
  { value: 'calm', label: 'Calm' },
  { value: 'sleeping_most_of_day', label: 'Sleeping most' },
];

export function CheckInForm({ onSubmit, loading = false, petName }: CheckInFormProps) {
  const [eatingLevel, setEatingLevel] = useState('');
  const [litterStatus, setLitterStatus] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!eatingLevel) e.eating = 'Please select an eating level';
    if (!litterStatus) e.litter = 'Please select a litter status';
    if (!activityLevel) e.activity = 'Please select an activity level';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      eating_level: eatingLevel as CheckIn['eating_level'],
      litter_status: litterStatus as CheckIn['litter_status'],
      activity_level: activityLevel as CheckIn['activity_level'],
      owner_notes: ownerNotes || undefined,
      eating_notes: undefined,
      litter_notes: undefined,
      activity_notes: undefined,
    });
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <form onSubmit={handleSubmit}>
      {petName && (
        <>
          <h3 className="text-[18px] font-bold text-[#111] mb-1">Daily check-in · {today}</h3>
          <p className="text-[13px] text-[#aaa] mb-4">How&apos;s {petName} doing today?</p>
        </>
      )}
      <ChipSelect label="Eating" value={eatingLevel} onChange={v => { setEatingLevel(v); setErrors(e => ({ ...e, eating: '' })); }} options={EATING_OPTIONS} error={errors.eating} />
      <ChipSelect label="Litter box" value={litterStatus} onChange={v => { setLitterStatus(v); setErrors(e => ({ ...e, litter: '' })); }} options={LITTER_OPTIONS} error={errors.litter} />
      <ChipSelect label="Activity" value={activityLevel} onChange={v => { setActivityLevel(v); setErrors(e => ({ ...e, activity: '' })); }} options={ACTIVITY_OPTIONS} error={errors.activity} />

      {!showNotes ? (
        <button type="button" onClick={() => setShowNotes(true)} className="text-[13px] text-[#888] underline bg-transparent border-none cursor-pointer font-sans mb-4">
          + Add a note
        </button>
      ) : (
        <div className="mb-4">
          <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#888] mb-1.5 block">Notes — Optional</label>
          <textarea
            value={ownerNotes}
            onChange={e => setOwnerNotes(e.target.value)}
            placeholder="Anything else you noticed today..."
            rows={3}
            className="w-full px-3.5 py-3 text-[14px] border-[1.5px] border-[#e0e0e0] rounded-[10px] outline-none focus:border-[#111] resize-none font-sans transition-colors"
          />
        </div>
      )}

      <Button type="submit" fullWidth loading={loading}>
        Save check-in ✓
      </Button>
    </form>
  );
}

export default CheckInForm;

'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { ChipSelect } from './ui/ChipSelect';
import { ChevronLeft } from './icons';

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
  petName?: string;
}

const CONCERN_TYPES: { type: ConcernType; label: string; emoji: string; desc: string }[] = [
  { type: 'not_eating', label: 'Not eating', emoji: '🍽️', desc: 'Refusing food or eating much less' },
  { type: 'vomiting', label: 'Vomiting', emoji: '🤢', desc: 'Throwing up or retching' },
  { type: 'litter_problems', label: 'Litter issues', emoji: '🪣', desc: 'Changes in bathroom habits' },
  { type: 'respiratory', label: 'Breathing', emoji: '🫁', desc: 'Coughing, sneezing, wheezing' },
  { type: 'limping', label: 'Limping', emoji: '🐾', desc: 'Trouble walking or moving' },
  { type: 'hiding', label: 'Hiding', emoji: '🙈', desc: 'Unusual hiding or withdrawal' },
  { type: 'eye_ear', label: 'Eye / Ear', emoji: '👁️', desc: 'Discharge, squinting, scratching' },
  { type: 'skin', label: 'Skin / Coat', emoji: '🐱', desc: 'Hair loss, sores, excessive grooming' },
  { type: 'other', label: 'Other', emoji: '❓', desc: 'Something else is off' },
];

const FOLLOWUP_QUESTIONS: Record<ConcernType, { key: string; label: string; options: { value: string; label: string }[] }[]> = {
  not_eating: [
    { key: 'duration', label: 'How long has this been going on?', options: [{ value: 'less_than_24h', label: 'Less than 24h' }, { value: '24_48h', label: '24–48 hours' }, { value: 'more_than_48h', label: 'More than 48h' }] },
    { key: 'amount_eating', label: 'Are they eating anything at all?', options: [{ value: 'nothing', label: 'Nothing at all' }, { value: 'tiny_bit', label: 'A tiny bit' }, { value: 'half', label: 'About half' }] },
    { key: 'other_symptoms', label: 'Any other symptoms?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
    { key: 'was_separated', label: 'Separated from a sibling recently?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  ],
  vomiting: [
    { key: 'frequency', label: 'How often?', options: [{ value: 'once', label: 'Once' }, { value: 'twice', label: 'Twice' }, { value: 'multiple', label: 'Multiple times' }] },
    { key: 'blood_present', label: 'Any blood in vomit?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }] },
    { key: 'eating_after', label: 'Still trying to eat after?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
    { key: 'behavior_otherwise', label: 'Acting normal otherwise?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  ],
  litter_problems: [
    { key: 'type', label: 'What kind of issue?', options: [{ value: 'diarrhea', label: 'Diarrhea' }, { value: 'constipation', label: 'Constipation' }, { value: 'not_using', label: 'Not using box' }, { value: 'straining', label: 'Straining' }] },
    { key: 'blood_present', label: 'Any blood?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Unsure' }] },
    { key: 'duration', label: 'How long?', options: [{ value: 'today', label: 'Just today' }, { value: '2_3_days', label: '2–3 days' }, { value: 'longer', label: 'Longer' }] },
  ],
  respiratory: [
    { key: 'type', label: 'What symptoms?', options: [{ value: 'sneezing', label: 'Sneezing' }, { value: 'coughing', label: 'Coughing' }, { value: 'wheezing', label: 'Wheezing' }, { value: 'open_mouth', label: 'Open-mouth breathing' }] },
    { key: 'duration', label: 'How long?', options: [{ value: 'today', label: 'Just today' }, { value: '2_3_days', label: '2–3 days' }, { value: 'longer', label: 'Longer' }] },
    { key: 'discharge', label: 'Nasal/eye discharge?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  ],
  limping: [
    { key: 'leg', label: 'Which leg?', options: [{ value: 'front_left', label: 'Front left' }, { value: 'front_right', label: 'Front right' }, { value: 'back_left', label: 'Back left' }, { value: 'back_right', label: 'Back right' }] },
    { key: 'duration', label: 'How long?', options: [{ value: 'sudden', label: 'Just started' }, { value: 'few_hours', label: 'A few hours' }, { value: 'day_plus', label: 'More than a day' }] },
    { key: 'bearing_weight', label: 'Can they bear weight on it?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  ],
  hiding: [
    { key: 'duration', label: 'How long?', options: [{ value: 'few_hours', label: 'A few hours' }, { value: 'all_day', label: 'Most of the day' }, { value: 'longer', label: 'Multiple days' }] },
    { key: 'other_symptoms', label: 'Any other concerns?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
    { key: 'new_environment', label: 'Any recent changes at home?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  ],
  eye_ear: [
    { key: 'type', label: 'Which is affected?', options: [{ value: 'eye', label: 'Eye' }, { value: 'ear', label: 'Ear' }, { value: 'both', label: 'Both' }] },
    { key: 'discharge', label: 'Any discharge?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
    { key: 'duration', label: 'How long?', options: [{ value: 'today', label: 'Just today' }, { value: 'few_days', label: 'A few days' }, { value: 'longer', label: 'Longer' }] },
  ],
  skin: [
    { key: 'type', label: 'What do you notice?', options: [{ value: 'hair_loss', label: 'Hair loss' }, { value: 'sores', label: 'Sores / Scabs' }, { value: 'excessive_grooming', label: 'Over-grooming' }, { value: 'redness', label: 'Redness' }] },
    { key: 'location', label: 'Where?', options: [{ value: 'head', label: 'Head/Face' }, { value: 'body', label: 'Body' }, { value: 'legs', label: 'Legs' }, { value: 'everywhere', label: 'Widespread' }] },
  ],
  other: [
    { key: 'duration', label: 'How long has this been going on?', options: [{ value: 'today', label: 'Just today' }, { value: 'few_days', label: 'A few days' }, { value: 'longer', label: 'Longer' }] },
    { key: 'severity', label: 'How concerned are you?', options: [{ value: 'a_little', label: 'A little' }, { value: 'moderately', label: 'Moderately' }, { value: 'very', label: 'Very concerned' }] },
  ],
};

export function ConcernForm({ onSubmit, loading = false, petId = '', petName }: ConcernFormProps) {
  const [step, setStep] = useState<'select' | 'questions'>('select');
  const [concernType, setConcernType] = useState<ConcernType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const setAnswer = (k: string) => (v: string) => setAnswers(a => ({ ...a, [k]: v }));

  const handleSelectType = (type: ConcernType) => {
    setConcernType(type);
    setAnswers({});
    setStep('questions');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernType) return;
    await onSubmit({ pet_id: petId, concern_type: concernType, followup_answers: answers });
  };

  const questions = concernType ? FOLLOWUP_QUESTIONS[concernType] : [];
  const allAnswered = questions.every(q => answers[q.key]);

  if (step === 'select') {
    return (
      <div>
        <h3 className="text-[18px] font-bold text-[#111] mb-1.5">What&apos;s going on?</h3>
        <p className="text-[14px] text-[#888] mb-4">{petName ? `Select what concerns you about ${petName}.` : 'Select the concern type.'}</p>
        <div className="grid grid-cols-2 gap-2.5">
          {CONCERN_TYPES.map(c => (
            <button
              key={c.type}
              onClick={() => handleSelectType(c.type)}
              className="bg-white border-[1.5px] border-[#e0e0e0] rounded-[14px] p-4 text-left cursor-pointer hover:border-[#111] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-150 font-sans"
            >
              <div className="text-[24px] mb-1.5">{c.emoji}</div>
              <div className="text-[13px] font-bold text-[#111] mb-0.5">{c.label}</div>
              <div className="text-[11px] text-[#aaa] leading-[1.4]">{c.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const selected = CONCERN_TYPES.find(c => c.type === concernType);

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="button"
        onClick={() => setStep('select')}
        className="flex items-center gap-1 text-[13px] text-[#888] bg-transparent border-none cursor-pointer font-sans mb-4 p-0"
      >
        <ChevronLeft size={14} /> Back
      </button>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[24px]">{selected?.emoji}</span>
        <h3 className="text-[18px] font-bold text-[#111] m-0">{selected?.label}</h3>
      </div>
      {questions.map(q => (
        <ChipSelect
          key={q.key}
          label={q.label}
          value={answers[q.key] ?? ''}
          onChange={setAnswer(q.key)}
          options={q.options}
        />
      ))}
      <Button type="submit" fullWidth loading={loading} disabled={!allAnswered} className="mt-2">
        Get guidance
      </Button>
    </form>
  );
}

export default ConcernForm;

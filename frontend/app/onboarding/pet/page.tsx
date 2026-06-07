'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useAppContext } from '@/lib/context';
import { ArrowRight } from '@/components/icons';
import { AuthShell } from '@/components/AuthShell';

const StepDots = () => {
  const flow = ['email', 'otp', 'profile', 'pet'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      {flow.map((s, i) => {
        const active = s === 'pet';
        const done = flow.indexOf('pet') > i;
        return <div key={s} style={{ width: active ? 24 : 8, height: 8, borderRadius: 4, background: done ? '#111' : active ? '#111' : '#e5e5e5', transition: 'all 0.3s', opacity: done ? 0.4 : 1 }} />;
      })}
    </div>
  );
};

const Field = ({ label, type = 'text', value, onChange, placeholder, hint, error }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', border: `1.5px solid ${error ? '#e85d5d' : focused ? '#111' : '#e0e0e0'}`, borderRadius: 10, outline: 'none', background: '#fff', color: '#111', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
      />
      {hint && !error && <p style={{ fontSize: 12, color: '#aaa', marginTop: 4, marginBottom: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#e85d5d', marginTop: 4, marginBottom: 0 }}>{error}</p>}
    </div>
  );
};

const ChipSelect = ({ label, optional, options, value, onChange, error }: {
  label: string; optional?: boolean; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; error?: string;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: error ? '#e85d5d' : '#888', marginBottom: 8 }}>
      {label}{optional && <span style={{ fontSize: 10, fontWeight: 400, color: '#bbb', textTransform: 'none', letterSpacing: 0 }}>— Optional</span>}
    </label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const selected = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(selected ? '' : opt.value)}
            style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${selected ? '#111' : '#e0e0e0'}`, background: selected ? '#111' : '#fff', color: selected ? '#fff' : '#555', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.18s', fontWeight: selected ? 600 : 400 }}>
            {opt.label}
          </button>
        );
      })}
    </div>
    {error && <p style={{ fontSize: 12, color: '#e85d5d', marginTop: 5, marginBottom: 0 }}>{error}</p>}
  </div>
);

const GENDER_OPTIONS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'unknown', label: 'Unknown' }];
const NEUTERED_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'Not yet' }, { value: 'unknown', label: 'Not sure' }];
const SOURCE_OPTIONS = [{ value: 'shelter', label: 'Shelter' }, { value: 'breeder', label: 'Breeder' }, { value: 'friend_family', label: 'Friend / Family' }, { value: 'stray', label: 'Found stray' }, { value: 'other', label: 'Other' }];
const SIBLING_OPTIONS = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }];

export default function OnboardingPetPage() {
  const router = useRouter();
  const { setPet } = useAppContext();
  const [form, setForm] = useState({ name: '', age_months: '', gender: '', neutered_spayed: '', source: '', sibling_bonded: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/');
  }, [router]);

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Kitten's name is required";
    if (form.age_months === '') e.age_months = 'Age is required';
    else if (Number(form.age_months) < 0 || Number(form.age_months) > 360) e.age_months = 'Must be 0–360 months';
    if (!form.gender) e.gender = 'Please select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const pet = await apiClient.createPet({
        name: form.name,
        age_months: Number(form.age_months),
        gender: form.gender as 'male' | 'female' | 'unknown',
        neutered_spayed: (form.neutered_spayed || 'unknown') as 'yes' | 'no' | 'unknown',
        source: form.source as 'shelter' | 'breeder' | 'friend_family' | 'stray' | 'other' | undefined,
        sibling_bonded: form.sibling_bonded as 'yes' | 'no' | 'unsure' | undefined,
      });
      setPet(pet);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setErrors({ name: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell showBack onBack={() => router.back()} maxWidth={480}>
      <StepDots />
      <div style={{ marginBottom: 22, marginTop: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
          {form.name ? `Tell us about ${form.name}` : 'Tell us about your kitten'}
        </h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#888', lineHeight: 1.5 }}>Help us personalise their care experience.</p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2 }}><Field label="Kitten's name" value={form.name} onChange={set('name')} placeholder="e.g. Scooter" error={errors.name} /></div>
        <div style={{ flex: 1 }}><Field label="Age (mo.)" type="number" value={form.age_months} onChange={set('age_months')} placeholder="2" hint="0 if < 1mo" error={errors.age_months} /></div>
      </div>
      <ChipSelect label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTIONS} error={errors.gender} />
      <ChipSelect label="Neutered / Spayed" optional value={form.neutered_spayed} onChange={set('neutered_spayed')} options={NEUTERED_OPTIONS} />
      <ChipSelect label="Where did you adopt from" optional value={form.source} onChange={set('source')} options={SOURCE_OPTIONS} />
      <ChipSelect label="Did they have a sibling" optional value={form.sibling_bonded} onChange={set('sibling_bonded')} options={SIBLING_OPTIONS} />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', marginTop: 8, padding: '13px 20px', borderRadius: 10, border: 'none', background: loading ? '#d0d0d0' : '#111', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
      >
        {loading ? 'Saving…' : <><span>Save profile & continue</span><ArrowRight size={16} /></>}
      </button>
    </AuthShell>
  );
}

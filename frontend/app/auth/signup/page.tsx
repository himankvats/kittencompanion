'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowRight } from '@/components/icons';
import { AuthShell } from '@/components/AuthShell';

const StepDots = ({ current }: { current: string }) => {
  const flow = ['email', 'otp', 'profile', 'pet'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      {flow.map((s, i) => {
        const active = s === current;
        const done = flow.indexOf(current) > i;
        return <div key={s} style={{ width: active ? 24 : 8, height: 8, borderRadius: 4, background: done ? '#111' : active ? '#111' : '#e5e5e5', transition: 'all 0.3s', opacity: done ? 0.4 : 1 }} />;
      })}
    </div>
  );
};

const Field = ({ label, type = 'text', value, onChange, placeholder, error }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
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
      {error && <p style={{ fontSize: 12, color: '#e85d5d', marginTop: 4, marginBottom: 0 }}>{error}</p>}
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim()) e.last_name = 'Required';
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) e.email = 'Please enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await apiClient.signup(form.email, form.first_name, form.last_name);
      router.push(`/auth/verify?email=${encodeURIComponent(form.email)}&fn=${encodeURIComponent(form.first_name)}&ln=${encodeURIComponent(form.last_name)}&mode=signup`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!(form.email && form.first_name && form.last_name) && !loading;

  return (
    <AuthShell onBack={() => router.push('/')} onClose={() => router.push('/')} showBack>
      <StepDots current="email" />
      <div style={{ marginBottom: 22, marginTop: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.4px', lineHeight: 1.25 }}>Create your account</h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#888', lineHeight: 1.5 }}>We&apos;ll send a one-time code — no password needed.</p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="First name" value={form.first_name} onChange={set('first_name')} placeholder="Sarah" error={errors.first_name} /></div>
        <div style={{ flex: 1 }}><Field label="Last name" value={form.last_name} onChange={set('last_name')} placeholder="Johnson" error={errors.last_name} /></div>
      </div>
      <Field label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none', background: canSubmit ? '#111' : '#d0d0d0', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
      >
        {loading ? 'Sending…' : <><span>Send verification code</span><ArrowRight size={16} /></>}
      </button>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 16, marginBottom: 0 }}>
        Already have an account?{' '}
        <button onClick={() => router.push('/auth/login')} style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Log in</button>
      </p>
    </AuthShell>
  );
}

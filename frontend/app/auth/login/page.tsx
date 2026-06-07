'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowRight } from '@/components/icons';
import { AuthShell } from '@/components/AuthShell';

const StepDots = () => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
    {['email', 'otp'].map((s, i) => (
      <div key={s} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 4, background: '#111', opacity: i === 0 ? 1 : 0.2, transition: 'all 0.3s' }} />
    ))}
  </div>
);

const Field = ({ label, value, onChange, placeholder, error }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>{label}</label>
      <input
        type="email" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', border: `1.5px solid ${error ? '#e85d5d' : focused ? '#111' : '#e0e0e0'}`, borderRadius: 10, outline: 'none', background: '#fff', color: '#111', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
      />
      {error && <p style={{ fontSize: 12, color: '#e85d5d', marginTop: 4, marginBottom: 0 }}>{error}</p>}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) { setError('Please enter a valid email'); return; }
    setLoading(true);
    try {
      await apiClient.login(email);
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&mode=login`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg === 'EMAIL_NOT_FOUND' ? 'No account found. Please sign up first.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={() => router.push('/')} onClose={() => router.push('/')} showBack>
      <StepDots />
      <div style={{ marginBottom: 22, marginTop: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.4px', lineHeight: 1.25 }}>Welcome back</h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#888', lineHeight: 1.5 }}>We&apos;ll send a one-time code to your email.</p>
      </div>
      <Field label="Email address" value={email} onChange={v => { setEmail(v); setError(''); }} placeholder="you@example.com" error={error} />
      <button
        onClick={handleSubmit}
        disabled={!email || loading}
        style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none', background: email && !loading ? '#111' : '#d0d0d0', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: email && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
      >
        {loading ? 'Sending…' : <><span>Send login code</span><ArrowRight size={16} /></>}
      </button>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 16, marginBottom: 0 }}>
        New here?{' '}
        <button onClick={() => router.push('/auth/signup')} style={{ color: '#111', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Create an account</button>
      </p>
    </AuthShell>
  );
}

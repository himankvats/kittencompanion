'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useAppContext } from '@/lib/context';
import { AuthShell } from '@/components/AuthShell';

// ── OTP digits input ──────────────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = Array(6).fill('').map((_, i) => value[i] || '');
  const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const handle = (i: number, val: string) => {
    const arr = [...digits];
    arr[i] = val.replace(/\D/g, '').slice(-1);
    onChange(arr.join(''));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p) { onChange(p.padEnd(6, '').slice(0, 6)); refs.current[Math.min(p.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{ width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700, border: `1.5px solid ${d ? '#111' : '#e0e0e0'}`, borderRadius: 10, outline: 'none', fontFamily: 'inherit', color: '#111', background: d ? '#f9f9f9' : '#fff', transition: 'all 0.15s' }}
        />
      ))}
    </div>
  );
}

// ── OTP countdown timer ───────────────────────────────────────────────────────
function useOTPTimer(initial = 60) {
  const [timer, setTimer] = useState(initial);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    setTimer(initial);
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(ref.current!); return 0; } return t - 1; }), 1000);
  };
  useEffect(() => { start(); return () => { if (ref.current) clearInterval(ref.current); }; }, []);
  return { timer, restart: start };
}

// ── Step dots ─────────────────────────────────────────────────────────────────
const StepDots = ({ mode }: { mode: string }) => {
  const flow = mode === 'login' ? ['email', 'otp'] : ['email', 'otp', 'profile', 'pet'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      {flow.map((s, i) => {
        const active = s === 'otp';
        const done = i === 0;
        return <div key={s} style={{ width: active ? 24 : 8, height: 8, borderRadius: 4, background: done ? '#111' : active ? '#111' : '#e5e5e5', transition: 'all 0.3s', opacity: done ? 0.4 : 1 }} />;
      })}
    </div>
  );
};

// ── Main verify content ───────────────────────────────────────────────────────
function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const mode = params.get('mode') ?? 'signup';
  const firstName = params.get('fn') ?? '';
  const lastName = params.get('ln') ?? '';
  const { setUser, setPet } = useAppContext();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const { timer, restart } = useOTPTimer(60);

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      if (mode === 'login') {
        await apiClient.login(email);
      } else {
        await apiClient.signup(email, firstName, lastName);
      }
      setResent(true);
      restart();
      setOtp('');
    } catch { /* ignore resend errors */ }
  };

  const handleSubmit = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.verifyOTP(otp);
      setToken(res.jwt_token);
      setUser(res.user);
      // Check if user has pets
      const { listPets } = await import('@/lib/api');
      const petsRes = await listPets(res.user.id);
      if (petsRes.pets.length === 0) {
        router.replace('/onboarding/pet');
      } else {
        setPet(petsRes.pets[0]);
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code';
      setError(msg === 'INVALID_OTP' || msg === 'OTP_EXPIRED'
        ? 'That code is incorrect or expired. Please try again.'
        : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={() => router.back()} onClose={() => router.push('/')} showBack>
      <StepDots mode={mode} />
      <div style={{ marginBottom: 22, marginTop: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
          {mode === 'login' ? 'Check your inbox' : 'Verify your email'}
        </h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#888', lineHeight: 1.5 }}>
          We sent a 6-digit code to <strong>{email || 'your email'}</strong>.
        </p>
      </div>

      <OTPInput value={otp} onChange={setOtp} />

      {error && <p style={{ fontSize: 13, color: '#e85d5d', textAlign: 'center', margin: '0 0 12px' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={otp.length < 6 || loading}
        style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none', background: otp.length === 6 && !loading ? '#111' : '#d0d0d0', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
      >
        {loading ? 'Verifying…' : mode === 'login' ? 'Log in' : 'Verify & continue'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 14, minHeight: 22 }}>
        {timer > 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#bbb' }}>Resend available in <span style={{ color: '#888', fontWeight: 600 }}>{timer}s</span></p>
        ) : resent ? (
          <p style={{ margin: 0, fontSize: 13, color: '#22c55e', fontWeight: 600 }}>✓ New code sent!</p>
        ) : (
          <button onClick={handleResend} style={{ background: 'none', border: 'none', fontSize: 13, color: '#111', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
            Resend code
          </button>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading…</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

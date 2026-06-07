'use client';

import { useState } from 'react';
import { PawIcon, XIcon, ShieldIcon, LockIcon } from '@/components/icons';

const PAW_POSITIONS = [
  { x: 4, y: 6, r: 18, opacity: 0.055 }, { x: 88, y: 12, r: -22, opacity: 0.04 },
  { x: 15, y: 82, r: 8, opacity: 0.045 }, { x: 78, y: 75, r: -15, opacity: 0.05 },
  { x: 50, y: 20, r: 30, opacity: 0.03 }, { x: 30, y: 50, r: -10, opacity: 0.035 },
  { x: 70, y: 45, r: 12, opacity: 0.04 }, { x: 92, y: 55, r: -30, opacity: 0.03 },
  { x: 8, y: 38, r: 25, opacity: 0.025 }, { x: 55, y: 88, r: -5, opacity: 0.04 },
  { x: 40, y: 70, r: 20, opacity: 0.028 }, { x: 20, y: 18, r: -12, opacity: 0.035 },
];

interface LegalModalProps { onClose: () => void; }
function LegalModal({ onClose }: LegalModalProps) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 540, width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 48px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Terms & Privacy Policy</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4, display: 'flex' }}><XIcon /></button>
        </div>
        {[
          { title: 'Terms of Service', body: 'By using Kitten Companion, you agree to use this service for personal, non-commercial purposes. Our guidance is informational and does not replace professional veterinary advice.' },
          { title: 'Privacy Policy', body: 'We collect only the information necessary to provide our service: your email, name, and kitten information. We never sell your personal data to third parties, ever.' },
          { title: '🔒 How We Protect Your Data', body: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Stored on SOC 2-compliant servers with strict access controls, regular security audits, and vulnerability assessments.' },
          { title: 'Your Rights', body: 'You may export, update, or permanently delete all your data at any time from your account settings.' },
          { title: 'Data Retention', body: 'Data is retained while your account is active. Upon deletion, all personal data is removed within 30 days.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111' }}>{s.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.65 }}>{s.body}</p>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 10, background: '#111', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Got it</button>
      </div>
    </div>
  );
}

interface AuthShellProps {
  children: React.ReactNode;
  onClose?: () => void;
  onBack?: () => void;
  showBack?: boolean;
  maxWidth?: number;
}

export function AuthShell({ children, onClose, onBack, showBack, maxWidth = 440 }: AuthShellProps) {
  const [showLegal, setShowLegal] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>
      {/* Paw watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {PAW_POSITIONS.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.r}deg)`, opacity: p.opacity }}>
            <PawIcon size={72} color="#111" />
          </div>
        ))}
      </div>

      {/* Logo bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, zIndex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PawIcon size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>Kitten Companion</span>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 48px rgba(0,0,0,0.10)', maxWidth, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        {showBack && onBack && (
          <button
            onClick={onBack}
            style={{ position: 'absolute', top: 18, left: 18, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
          >
            ← Back
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}
          >
            <XIcon />
          </button>
        )}
        {children}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, textAlign: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
          <button
            onClick={() => setShowLegal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#aaa', textDecoration: 'underline', fontFamily: 'inherit' }}
          >
            Terms & Privacy Policy
          </button>
          <span style={{ color: '#ddd' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <LockIcon size={12} /><span style={{ fontSize: 12, color: '#aaa' }}>Data encrypted & never sold</span>
          </div>
          <span style={{ color: '#ddd' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldIcon size={12} /><span style={{ fontSize: 12, color: '#aaa' }}>SOC 2 compliant</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>© 2026 Kitten Companion</p>
      </div>

      {showLegal && <LegalModal onClose={() => setShowLegal(false)} />}
    </div>
  );
}

export default AuthShell;

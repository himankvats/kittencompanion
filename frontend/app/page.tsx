'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { PawIcon, ArrowRight, ShieldIcon, LockIcon } from '@/components/icons';

const PAW_POSITIONS = [
  { x: 4, y: 6, r: 18, opacity: 0.055 }, { x: 88, y: 12, r: -22, opacity: 0.04 },
  { x: 15, y: 82, r: 8, opacity: 0.045 }, { x: 78, y: 75, r: -15, opacity: 0.05 },
  { x: 50, y: 20, r: 30, opacity: 0.03 }, { x: 30, y: 50, r: -10, opacity: 0.035 },
  { x: 70, y: 45, r: 12, opacity: 0.04 }, { x: 92, y: 55, r: -30, opacity: 0.03 },
];

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Paw watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {PAW_POSITIONS.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.r}deg)`, opacity: p.opacity }}>
            <PawIcon size={72} color="#111" />
          </div>
        ))}
      </div>

      <div className="w-full max-w-[420px] text-center z-10">
        {/* Logo */}
        <div className="w-[76px] h-[76px] rounded-full bg-[#111] flex items-center justify-center mx-auto mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <PawIcon size={34} color="#fff" />
        </div>

        <h1 className="text-[34px] font-extrabold text-[#111] tracking-[-1px] mb-2">Kitten Companion</h1>
        <p className="text-[15px] text-[#888] leading-[1.65] mx-auto mb-8 max-w-[310px]">
          Your expert guide through your kitten's first four months at home.
        </p>

        {/* Feature bullets */}
        <div className="flex flex-col gap-2.5 mb-8 text-left">
          {[
            { num: '01', text: 'Daily check-ins to track eating, litter & energy' },
            { num: '02', text: 'Instant triage when something feels off' },
            { num: '03', text: 'Vet-ready behavioral reports at 4 months' },
          ].map(item => (
            <div key={item.num} className="flex items-start gap-3.5 bg-white/75 backdrop-blur-sm rounded-[12px] px-4 py-3 border border-black/[0.06]">
              <span className="text-[11px] font-bold text-[#bbb] tracking-[0.05em] pt-px">{item.num}</span>
              <span className="text-[14px] text-[#444] leading-[1.5]">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <button
          onClick={() => router.push('/auth/signup')}
          className="w-full flex items-center justify-center gap-2 py-[13px] px-5 rounded-[10px] bg-[#111] text-white text-[15px] font-semibold cursor-pointer border-none mb-2.5"
        >
          Get started <ArrowRight size={16} />
        </button>
        <button
          onClick={() => router.push('/auth/login')}
          className="w-full py-[13px] px-5 rounded-[10px] bg-white/70 border-[1.5px] border-black/10 text-[15px] font-semibold text-[#444] cursor-pointer backdrop-blur-sm"
        >
          Log in
        </button>
        <p className="text-[12px] text-[#bbb] mt-3.5">No password required · Just your email</p>

        {/* Footer */}
        <div className="mt-7 text-center">
          <div className="flex items-center justify-center gap-3.5 flex-wrap mb-2">
            <div className="flex items-center gap-1"><LockIcon size={12} /><span className="text-[12px] text-[#aaa]">Data encrypted & never sold</span></div>
            <span className="text-[#ddd]">·</span>
            <div className="flex items-center gap-1"><ShieldIcon size={12} /><span className="text-[12px] text-[#aaa]">SOC 2 compliant</span></div>
          </div>
          <p className="text-[11px] text-[#ccc] m-0">© 2026 Kitten Companion</p>
        </div>
      </div>
    </div>
  );
}

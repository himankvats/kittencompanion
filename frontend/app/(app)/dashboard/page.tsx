'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/lib/hooks';
import { useAppContext } from '@/lib/context';
import { apiClient } from '@/lib/api';
import type { CheckIn } from '@/lib/types';
import { WeekHeatmap } from '@/components/WeekHeatmap';
import { CheckInBottomSheet } from '@/components/CheckInBottomSheet';
import { PawIcon, HeartIcon, ClipboardIcon, AlertIcon, CheckIcon, ArrowRight, CatIcon, TrendUpIcon } from '@/components/icons';

function computeStreak(checkins: CheckIn[]): number {
  if (!checkins.length) return 0;
  const sorted = [...checkins].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let expected = today;
  for (const c of sorted) {
    if (c.date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}

function daysSinceAdoption(adoptionDate?: string): number {
  if (!adoptionDate) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(adoptionDate).getTime()) / 86400000));
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  const { pet } = useAppContext();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinFeedback, setCheckinFeedback] = useState('');
  const [showSheet, setShowSheet] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!pet) { setDataLoading(false); return; }
    apiClient.getCheckinHistory(pet.id, { limit: 30 }).then(res => {
      setCheckins(res.checkins);
      const today = new Date().toISOString().slice(0, 10);
      setCheckinDone(res.checkins.some(c => c.date === today));
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [pet, loading]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated but no pet yet → send to onboarding
  if (user && !pet) {
    router.replace('/onboarding/pet');
    return null;
  }

  if (!user || !pet) return null;

  const daysSince = daysSinceAdoption(pet.adoption_date);
  const progress = Math.min(Math.round((daysSince / 120) * 100), 100);
  const streak = computeStreak(checkins);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="px-5 pt-5 pb-2">
      {/* Greeting */}
      <div className="mb-4">
        <p className="m-0 text-[13px] text-[#aaa]">{today}</p>
        <h2 className="m-0 text-[22px] font-extrabold text-[#111] tracking-[-0.4px]">{greeting}, {user.first_name} 👋</h2>
      </div>

      {/* Pet hero */}
      <div className="bg-[#111] rounded-[20px] p-[20px_22px] mb-3.5 text-white relative overflow-hidden">
        <div className="absolute right-[-10px] top-[-10px] opacity-[0.07]"><PawIcon size={120} color="#fff" /></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="m-0 text-[10px] font-bold tracking-[0.07em] uppercase text-white/50 mb-0.5">Active kitten</p>
            <h3 className="m-0 text-[24px] font-extrabold tracking-[-0.5px] mb-1">{pet.name}</h3>
            <p className="m-0 text-[13px] text-white/60">{pet.age_months} months old{pet.breed ? ` · ${pet.breed}` : ''}</p>
          </div>
          <div className="w-[52px] h-[52px] rounded-[14px] bg-white/[0.12] flex items-center justify-center">
            <CatIcon size={28} />
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-[10px] h-1.5">
          <div style={{ width: `${progress}%` }} className="h-full bg-white rounded-[10px]" />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-white/50">Day {daysSince} of 120</span>
          <span className="text-[11px] text-white/50">{progress}% to vet report</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2.5 mb-3.5">
        {[
          { label: 'Streak', value: `${streak}d`, sub: 'consecutive', icon: <HeartIcon size={14} /> },
          { label: 'Check-ins', value: String(checkins.length), sub: 'this month', icon: <ClipboardIcon size={14} /> },
          { label: 'Concerns', value: '0', sub: 'flagged', icon: <AlertIcon size={14} />, accent: '#e85d5d' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-[16px] p-[16px_18px] flex-1 min-w-0 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[10px] font-bold tracking-[0.07em] uppercase text-[#aaa]">{s.label}</span>
              <span style={{ color: s.accent ?? '#111', opacity: 0.5 }}>{s.icon}</span>
            </div>
            <div className="text-[26px] font-extrabold text-[#111] leading-none">{s.value}</div>
            {s.sub && <div className="text-[11px] text-[#aaa] mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Check-in CTA */}
      {!checkinDone ? (
        <div className="bg-white rounded-[16px] p-[16px_20px] mb-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-2 border-dashed border-[#e0e0e0]">
          <div className="flex justify-between items-center">
            <div>
              <p className="m-0 text-[14px] font-bold text-[#111] mb-0.5">Today&apos;s check-in</p>
              <p className="m-0 text-[13px] text-[#aaa]">Not done yet — takes 30 seconds</p>
            </div>
            <button
              onClick={() => setShowSheet(true)}
              className="bg-[#111] text-white border-none rounded-[10px] px-4 py-[9px] text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap font-sans"
            >
              Start <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#f0faf4] rounded-[16px] p-[14px_20px] mb-3.5 border-[1.5px] border-[#bbf0d0] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 text-white">
            <CheckIcon size={16} />
          </div>
          <div>
            <p className="m-0 text-[14px] font-bold text-[#166534] mb-0.5">Check-in complete!</p>
            <p className="m-0 text-[12px] text-[#4ade80]">{checkinFeedback || `${pet.name}'s doing great today.`}</p>
          </div>
        </div>
      )}

      {/* Week heatmap */}
      <WeekHeatmap checkins={checkins} />

      {/* Quick actions */}
      <p className="m-0 mb-2.5 text-[13px] font-bold text-[#111]">Quick actions</p>
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        {[
          { icon: <AlertIcon size={18} />, label: 'Flag a concern', sub: 'Something looks off?', accent: '#e85d5d', href: '/concern' },
          { icon: <ClipboardIcon size={18} />, label: 'Vet summary', sub: 'Export your report', accent: '#2563eb', href: '/summary' },
          { icon: <TrendUpIcon size={18} />, label: 'View history', sub: 'All past check-ins', accent: '#7c3aed', href: '/checkins' },
          { icon: <CatIcon size={18} />, label: 'Edit profile', sub: 'Update kitten info', accent: '#059669', href: '/profile' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => router.push(a.href)}
            className="bg-white rounded-[16px] p-[16px_18px] border-none cursor-pointer text-left shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-150 font-sans"
          >
            <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center mb-2" style={{ background: a.accent + '18', color: a.accent }}>
              {a.icon}
            </div>
            <div className="text-[13px] font-bold text-[#111] mb-0.5">{a.label}</div>
            <div className="text-[11px] text-[#aaa]">{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Weekly tip */}
      <div className="bg-[#fffbeb] border-[1.5px] border-[#fde68a] rounded-[16px] p-[14px_16px] mb-4">
        <p className="m-0 mb-1 text-[10px] font-bold tracking-[0.07em] uppercase text-[#92400e]">💡 Weekly tip</p>
        <p className="m-0 text-[13px] text-[#78350f] leading-[1.6]">
          At {pet.age_months} months old, {pet.name} needs 3–4 small meals per day. Consistent eating within 20 minutes of offering food is a good sign.
        </p>
      </div>

      <CheckInBottomSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        petId={pet.id}
        petName={pet.name}
        onSuccess={feedback => { setCheckinDone(true); setCheckinFeedback(feedback); }}
      />
    </div>
  );
}

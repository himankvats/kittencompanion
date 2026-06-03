'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/lib/hooks';
import { useAppContext } from '@/lib/context';
import { apiClient } from '@/lib/api';
import type { CheckIn } from '@/lib/types';
import { ChevronLeft, ChevronRight, AlertIcon, CheckIcon } from '@/components/icons';

const LABEL_MAP: Record<string, string> = {
  normal: 'Normal', less_than_normal: 'Less than usual', more_than_normal: 'More than usual',
  very_active: 'Very active', calm: 'Calm', sleeping_most_of_day: 'Sleeping most',
  diarrhea: 'Diarrhea', constipation: 'Constipation', mixed: 'Mixed',
  not_used: 'Not used', unknown: 'Unknown',
};

function isFlag(c: CheckIn) {
  return c.eating_level !== 'normal' || c.litter_status !== 'normal' || c.activity_level !== 'normal';
}

function isNormal(c: CheckIn) {
  return c.eating_level === 'normal' && c.litter_status === 'normal' && c.activity_level === 'normal';
}

function valueColor(val: string | undefined) {
  if (!val) return '#aaa';
  return val === 'normal' || val === 'very_active' ? '#111' : '#e85d5d';
}

function valueBg(val: string | undefined) {
  if (!val) return '#f7f7f7';
  return val === 'normal' || val === 'very_active' ? '#f7f7f7' : '#fef2f2';
}

export default function CheckinsPage() {
  const { user, loading } = useAuthGuard();
  const { pet } = useAppContext();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!pet) return;
    apiClient.getCheckinHistory(pet.id, { limit: 90 }).then(res => {
      setCheckins(res.checkins);
    }).catch(() => {}).finally(() => setDataLoading(false));
  }, [pet]);

  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user || !pet) return null;

  const now = new Date();
  const viewYear = now.getFullYear() + Math.floor((now.getMonth() + monthOffset) / 12);
  const viewMonth = ((now.getMonth() + monthOffset) % 12 + 12) % 12;
  const viewDate = new Date(viewYear, viewMonth, 1);
  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDow = viewDate.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const checkinMap = new Map(checkins.map(c => {
    const key = c.date.slice(0, 7) + '-' + c.date.slice(8, 10);
    return [key, c];
  }));

  const getCheckin = (day: number) => {
    const key = `${String(viewYear)}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkinMap.get(key) ?? null;
  };

  const todayDay = now.getMonth() === viewMonth && now.getFullYear() === viewYear ? now.getDate() : null;
  const sel = selectedDay ? getCheckin(selectedDay) : null;

  return (
    <div style={{ padding: '16px 20px 100px' }}>
      {/* Month nav */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => { setMonthOffset(o => o - 1); setSelectedDay(null); }}
          className="bg-white border-[1.5px] border-[#e0e0e0] rounded-[10px] w-9 h-9 flex items-center justify-center cursor-pointer text-[#444]"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-[15px] font-bold text-[#111]">{monthName}</span>
        <button
          onClick={() => { if (monthOffset < 0) { setMonthOffset(o => o + 1); setSelectedDay(null); } }}
          disabled={monthOffset === 0}
          className={`bg-white border-[1.5px] border-[#e0e0e0] rounded-[10px] w-9 h-9 flex items-center justify-center ${monthOffset === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer text-[#444]'}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-[#bbb] py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-5">
        {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const ci = getCheckin(day);
          const isSel = selectedDay === day;
          const isFuture = todayDay !== null && day > todayDay;
          const status = ci ? (isFlag(ci) ? 'flag' : 'ok') : null;

          return (
            <button
              key={day}
              onClick={() => !isFuture && setSelectedDay(isSel ? null : day)}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                border: `1.5px solid ${isSel ? '#111' : status === 'ok' ? '#111' : 'transparent'}`,
                background: isSel ? '#111' : status === 'flag' ? '#fef2f2' : status === 'ok' ? '#f7f7f7' : '#fff',
                color: isSel ? '#fff' : '#111',
                opacity: isFuture ? 0.25 : 1,
                cursor: isFuture || !ci ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: 0, fontFamily: 'inherit', fontSize: 13, fontWeight: ci ? 600 : 400,
              }}
            >
              <span>{day}</span>
              {status && (
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: isSel ? 'rgba(255,255,255,0.7)' : status === 'flag' ? '#e85d5d' : '#22c55e',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3.5 mb-5 flex-wrap">
        {[['Logged, all normal', '#22c55e'], ['Logged, flag', '#e85d5d'], ['Not logged', '#e0e0e0']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-[11px] text-[#aaa]">{l}</span>
          </div>
        ))}
      </div>

      {/* Detail card */}
      {!sel && (
        <div className="bg-[#f7f7f7] rounded-[16px] p-5 text-center">
          <p className="m-0 text-[14px] text-[#bbb]">Tap a logged day to see details</p>
        </div>
      )}
      {sel && (
        <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.08)] border border-[#f0f0f0]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="m-0 text-[15px] font-bold text-[#111] mb-0.5">{monthName.split(' ')[0]} {selectedDay}, {viewYear}</p>
              <p className="m-0 text-[12px] text-[#aaa]">{sel.date}</p>
            </div>
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${isFlag(sel) ? 'bg-[#fef2f2] text-[#e85d5d]' : 'bg-[#f0faf4] text-[#22c55e]'}`}>
              {isFlag(sel) ? <AlertIcon size={16} /> : <CheckIcon size={16} />}
            </div>
          </div>
          {[
            { emoji: '🍽️', label: 'Eating', val: sel.eating_level },
            { emoji: '🪣', label: 'Litter box', val: sel.litter_status },
            { emoji: '⚡', label: 'Activity', val: sel.activity_level },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-[#f5f5f5] last:border-0">
              <span className="text-[13px] text-[#666]">{row.emoji} {row.label}</span>
              <span
                className="text-[13px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{ color: valueColor(row.val), background: valueBg(row.val) }}
              >
                {LABEL_MAP[row.val ?? ''] ?? row.val}
              </span>
            </div>
          ))}
          {sel.owner_notes && (
            <p className="mt-3 text-[13px] text-[#666] leading-[1.5] italic m-0">"{sel.owner_notes}"</p>
          )}
        </div>
      )}
    </div>
  );
}

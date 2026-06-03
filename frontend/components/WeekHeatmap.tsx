'use client';

import { useRouter } from 'next/navigation';
import type { CheckIn } from '@/lib/types';
import { ChevronRight } from './icons';

interface WeekHeatmapProps {
  checkins: CheckIn[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function statusColor(val: string | undefined | null): string {
  if (!val) return '#e8e8e8';
  if (val === 'normal' || val === 'very_active') return '#111';
  return '#e85d5d';
}

export function WeekHeatmap({ checkins }: WeekHeatmapProps) {
  const router = useRouter();

  // Build last 7 days starting from Monday
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });

  const checkinMap = new Map(checkins.map(c => [c.date, c]));

  const cells = weekDays.map(d => {
    const key = d.toISOString().slice(0, 10);
    return checkinMap.get(key) ?? null;
  });

  return (
    <div className="bg-white rounded-[16px] p-5 mb-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center mb-3">
        <p className="m-0 text-[13px] font-bold text-[#111]">This week</p>
        <button
          onClick={() => router.push('/checkins')}
          className="bg-transparent border-none cursor-pointer text-[12px] text-[#888] flex items-center gap-0.5 font-sans"
        >
          View all <ChevronRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#bbb] font-bold">{d}</span>
            <div className="w-full aspect-square rounded-[6px]" style={{ background: statusColor(cells[i]?.eating_level) }} />
            <div className="w-full aspect-square rounded-[6px]" style={{ background: statusColor(cells[i]?.litter_status) }} />
            <div className="w-full aspect-square rounded-[6px]" style={{ background: statusColor(cells[i]?.activity_level) }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 mt-2 flex-wrap">
        {[['Normal', '#111'], ['Flag', '#e85d5d'], ['Empty', '#e8e8e8']].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-[2px]" style={{ background: c }} />
            <span className="text-[10px] text-[#aaa]">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeekHeatmap;

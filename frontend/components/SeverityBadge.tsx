import type { AcuteEvent } from '@/lib/types';

const config: Record<AcuteEvent['severity'], { label: string; bg: string; text: string; emoji: string }> = {
  manage_at_home: { label: 'Manage at home', bg: '#f0faf4', text: '#166534', emoji: '✅' },
  watch: { label: 'Monitor for 24h', bg: '#fffbeb', text: '#92400e', emoji: '⚠️' },
  call_vet_now: { label: 'Call your vet', bg: '#fef2f2', text: '#991b1b', emoji: '🚨' },
};

export function SeverityBadge({ severity }: { severity: AcuteEvent['severity'] }) {
  const c = config[severity];
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-bold" style={{ background: c.bg, color: c.text }}>
      <span>{c.emoji}</span>
      <span>{c.label}</span>
    </div>
  );
}

export default SeverityBadge;

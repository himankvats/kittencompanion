'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PawIcon, ClipboardIcon, AlertIcon, CatIcon } from '../icons';

const tabs = [
  { id: 'home', label: 'Home', icon: <PawIcon size={20} />, href: '/dashboard' },
  { id: 'checkins', label: 'Check-ins', icon: <ClipboardIcon size={20} />, href: '/checkins' },
  { id: 'concerns', label: 'Concerns', icon: <AlertIcon size={20} />, href: '/concern' },
  { id: 'profile', label: 'Profile', icon: <CatIcon size={20} />, href: '/profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find(t => pathname.startsWith(t.href))?.id ?? 'home';

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#f0f0f0] flex pb-4 pt-2 z-[100]">
      {tabs.map(t => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => router.push(t.href)}
            className={`flex-1 flex flex-col items-center gap-[3px] pt-1 border-none bg-transparent cursor-pointer transition-colors duration-200 font-sans ${active ? 'text-[#111]' : 'text-[#bbb]'}`}
          >
            {t.icon}
            <span className={`text-[10px] ${active ? 'font-bold' : 'font-normal'}`}>{t.label}</span>
            {active && <div className="w-1 h-1 rounded-full bg-[#111] mt-px" />}
          </button>
        );
      })}
    </div>
  );
}

export default BottomNav;

import { BottomNav } from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-[72px]">{children}</div>
      <BottomNav />
    </>
  );
}

import { BottomNav, HeaderSwitcher } from '@/components/layout';
import { RefCaptureWrapper } from '@/components/referral/RefCaptureWrapper';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--color-background)] text-slate-800">
      <RefCaptureWrapper />
      <HeaderSwitcher />
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  );
}

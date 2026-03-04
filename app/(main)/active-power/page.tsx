'use client';

import { ActivePowerCard } from '@/components/sections/wallet';

export default function ActivePowerPage() {
  return (
    <div className="bg-[#f6f5f8] dark:bg-[#131022] min-h-screen pb-32 font-sans text-slate-900 dark:text-slate-100">
      <main className="max-w-2xl mx-auto px-4 py-6">
        <ActivePowerCard />
      </main>
    </div>
  );
}

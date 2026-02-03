'use client';

import Link from 'next/link';
import { UserCircle, Settings } from 'lucide-react';

type Props = {
  title?: string;
};

export function WalletHeader({ title = 'Ví Của Tôi' }: Props) {
  return (
    <header className="z-10 flex items-center justify-between p-6">
      <Link
        href="/profile"
        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
        aria-label="Profile"
      >
        <UserCircle className="size-6" />
      </Link>
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      <Link
        href="/wallet/settings"
        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
        aria-label="Settings"
      >
        <Settings className="size-6" />
      </Link>
    </header>
  );
}

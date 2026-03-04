'use client';

import Link from 'next/link';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';

export function WalletHeader() {
  const { address } = useWallet();
  const { projectName } = useConfig();

  const displayName = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : `${projectName} User`;

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-100/80 dark:bg-[var(--color-background-dark)]/80 backdrop-blur-md border-b border-slate-200 dark:border-[var(--color-border-dark)]"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="size-10 rounded-full flex items-center justify-center border border-[var(--color-primary-wallet)]/30 overflow-hidden bg-[var(--color-primary-wallet)]/20"
          aria-label="Hồ sơ"
        >
          <UserCircle className="size-6 text-slate-600 dark:text-slate-300" />
        </Link>
        <div>
          <h1 className="text-sm font-medium text-slate-500 dark:text-slate-400">Chào trở lại,</h1>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{displayName}</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-surface-dark)] transition-colors"
          aria-label="Search"
        >
          <Search className="size-5 text-slate-600 dark:text-slate-400" />
        </button>
        <Link
          href="/notifications"
          className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-surface-dark)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-5 text-slate-600 dark:text-slate-400" />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-slate-100 dark:border-[var(--color-background-dark)]" />
        </Link>
      </div>
    </header>
  );
}

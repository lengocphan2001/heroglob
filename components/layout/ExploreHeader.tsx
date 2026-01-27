'use client';

import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';

type Props = {
  title?: string;
  showNotificationDot?: boolean;
};

export function ExploreHeader({
  title = 'Marketplace',
  showNotificationDot = true,
}: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between p-4">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-light)] text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
          aria-label="Menu"
        >
          <Menu className="size-6" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold leading-tight tracking-tight text-slate-900">
          {title}
        </h1>
        <div className="relative flex size-10 items-center justify-end">
          <Link
            href="/notifications"
            className="flex size-10 items-center justify-center text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 rounded-full"
            aria-label="Notifications"
          >
            <Bell className="size-6" />
          </Link>
          {showNotificationDot && (
            <span
              className="absolute right-0 top-0 block size-2 rounded-full bg-[var(--color-primary)] ring-2 ring-white"
              aria-hidden
            />
          )}
        </div>
      </div>
    </header>
  );
}

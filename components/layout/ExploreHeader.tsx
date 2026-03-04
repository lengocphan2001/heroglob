'use client';

import Link from 'next/link';
import { LayoutGrid, Search, Bell } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';

type Props = {
  title?: string;
};

export function ExploreHeader({ title }: Props) {
  const { projectName } = useConfig();
  const displayTitle = title ?? `Khám phá ${projectName}`;

  return (
    <header className="sticky top-0 z-50 bg-slate-100/80 dark:bg-[var(--color-background-dark)]/80 backdrop-blur-md border-b border-slate-200 dark:border-[var(--color-primary-wallet)]/20 px-4 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary-wallet)]/10 border border-[var(--color-primary-wallet)]/20">
            <LayoutGrid className="size-5 text-[var(--color-primary-wallet)]" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {displayTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-primary-wallet)]/20 transition-colors"
            aria-label="Tìm kiếm"
          >
            <Search className="size-5 text-slate-600 dark:text-slate-400" />
          </button>
          <Link
            href="/notifications"
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-primary-wallet)]/20 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="size-5 text-slate-600 dark:text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}

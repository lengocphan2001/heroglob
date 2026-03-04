'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';

type Props = {
  title?: string;
};

export function ProfileHeader({ title = 'Hồ sơ' }: Props) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex min-h-[56px] items-center bg-slate-100/80 dark:bg-[var(--color-background-dark)]/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-[var(--color-primary-wallet)]/20">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-primary-wallet)]/20 transition-colors text-slate-900 dark:text-slate-100"
        aria-label="Quay lại"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
        {title}
      </h2>
      <div className="flex w-10 items-center justify-end">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-[var(--color-primary-wallet)]/20 transition-colors text-slate-900 dark:text-slate-100"
          aria-label="Chia sẻ"
        >
          <Share2 className="size-5" />
        </button>
      </div>
    </header>
  );
}

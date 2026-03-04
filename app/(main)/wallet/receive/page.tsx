'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function WalletReceivePage() {
  const router = useRouter();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white dark:bg-[var(--color-background-dark)]">
      <div className="sticky top-0 z-10 glass-light px-6 py-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200" aria-label="Quay lại">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Nhận</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nhận tài sản vào ví của bạn.</p>
      </div>
      <div className="flex-1 px-6 py-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">Tính năng đang được phát triển. Dùng địa chỉ ví từ trang Ví để nhận tiền.</p>
      </div>
    </div>
  );
}

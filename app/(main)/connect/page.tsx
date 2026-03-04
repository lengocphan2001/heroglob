'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowLeft } from 'lucide-react';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export default function ConnectPage() {
  const router = useRouter();

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white dark:bg-[var(--color-background-dark)]">
      <div className="sticky top-0 z-10 glass-light px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kết nối ví</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-primary-wallet)]/10">
            <Wallet className="size-8 text-[var(--color-primary-wallet)]" aria-hidden />
          </div>
        </div>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Bấm &quot;Kết nối ví&quot; để dùng ví trên trình duyệt (MetaMask, Brave, Coinbase Wallet, v.v.).
          Không cần cấu hình thêm.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <ConnectButton />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Chưa có ví?{' '}
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary-wallet)] hover:underline"
          >
            Tải MetaMask
          </a>
          {' · '}
          <Link href="/" className="text-[var(--color-primary-wallet)] hover:underline">
            Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export default function ConnectPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="mb-8 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10">
          <Wallet className="size-8 text-[var(--color-primary)]" aria-hidden />
        </div>
      </div>
      <h1 className="text-center text-xl font-bold text-slate-900">Kết nối ví</h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Bấm &quot;Kết nối ví&quot; để dùng ví trên trình duyệt (MetaMask, Brave, Coinbase Wallet, v.v.).
        Không cần cấu hình thêm.
      </p>
      <div className="mt-8 flex justify-center">
        <ConnectButton />
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">
        Chưa có ví?{' '}
        <a
          href="https://metamask.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          Tải MetaMask
        </a>
        {' · '}
        <Link href="/" className="text-[var(--color-primary)] hover:underline">
          Về trang chủ
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Copy, Users } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { getReferralCode, getReferralStats } from '@/lib/api/referrals';

function getInviteUrl(code: string): string {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin.replace(/\/$/, '');
  return `${base}/?ref=${encodeURIComponent(code)}`;
}

export function ReferralSection() {
  const { address, isConnected } = useWallet();
  const [code, setCode] = useState<string | null>(null);
  const [totalReferred, setTotalReferred] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setCode(null);
      setTotalReferred(0);
      return;
    }
    setLoading(true);
    Promise.all([getReferralCode(address), getReferralStats(address)])
      .then(([res, stats]) => {
        setCode(res.code);
        setTotalReferred(stats.totalReferred);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isConnected, address]);

  const inviteUrl = code ? getInviteUrl(code) : '';

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <Users className="size-5 text-[var(--color-primary)]" />
          Mời bạn bè
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Kết nối ví để lấy link giới thiệu của bạn và mời bạn bè tham gia.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="flex items-center gap-2 text-base font-bold text-slate-800">
        <Users className="size-5 text-[var(--color-primary)]" />
        Mời bạn bè (Affiliate)
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Chia sẻ link để mời bạn bè. Số người đã mời: <strong>{totalReferred}</strong>
      </p>
      {loading ? (
        <p className="mt-3 text-sm text-slate-400">Đang tải link...</p>
      ) : inviteUrl ? (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Copy className="size-4" />
            {copied ? 'Đã copy!' : 'Sao chép'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

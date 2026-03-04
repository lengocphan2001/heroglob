'use client';

import { useState, useEffect } from 'react';
import { Copy, Users, Share2, CheckCircle2, Gift } from 'lucide-react';
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

  const handleShare = () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      navigator.share({ title: 'Tham gia cùng mình!', url: inviteUrl }).catch(() => { });
    } else {
      handleCopy();
    }
  };

  /* ── Not connected ── */
  if (!isConnected) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border p-5"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
      >
        {/* mesh glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            background:
              'radial-gradient(at 0% 100%, #330df2 0%, transparent 55%), radial-gradient(at 100% 0%, #7000ff 0%, transparent 55%)',
          }}
        />
        <div className="relative z-10 flex items-start gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(51,13,242,0.18)' }}
          >
            <Gift className="size-5" style={{ color: '#7c6cff' }} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-100">
              Mời bạn bè (Affiliate)
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Kết nối ví để lấy link giới thiệu và nhận thưởng khi bạn bè tham gia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Connected ── */
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Mesh gradient accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          background:
            'radial-gradient(at 0% 100%, #330df2 0%, transparent 55%), radial-gradient(at 100% 0%, #7000ff 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(51,13,242,0.18)' }}
            >
              <Users className="size-5" style={{ color: '#7c6cff' }} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-100">
                Mời bạn bè
              </h3>
              <p className="text-xs text-slate-500">Affiliate Program</p>
            </div>
          </div>

          {/* Stats pill */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ background: 'rgba(51,13,242,0.15)', color: '#7c6cff' }}
          >
            <Users className="size-3" />
            {totalReferred} bạn bè
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400">
          Chia sẻ link của bạn — nhận thưởng cho mỗi người tham gia qua link giới thiệu.
        </p>

        {/* Link area */}
        {loading ? (
          <div className="h-11 animate-pulse rounded-2xl bg-white/5" />
        ) : inviteUrl ? (
          <>
            {/* Input + copy button */}
            <div className="flex gap-2">
              <div
                className="flex min-w-0 flex-1 items-center rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: 'rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="truncate text-xs text-slate-400 font-mono">
                  {inviteUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-85"
                style={{
                  background: copied ? '#16a34a' : '#330df2',
                  boxShadow: copied
                    ? '0 4px 16px rgba(22,163,74,0.3)'
                    : '0 4px 16px rgba(51,13,242,0.35)',
                }}
              >
                {copied ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? 'Đã copy!' : 'Copy'}
              </button>
            </div>

            {/* Share button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-[#330df2]/50 hover:text-white"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              <Share2 className="size-4" />
              Chia sẻ ngay
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

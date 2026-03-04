'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import { ArrowLeft, Users, Copy, Share2, UserPlus, Coins } from 'lucide-react';

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  referralCode: string;
}

interface Referral {
  id: number;
  referredWallet: string;
  createdAt: string;
  totalSpent: number;
}

export default function ReferralsPage() {
  const router = useRouter();
  const { address } = useWallet();
  const { tokenSymbol } = useConfig();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    fetchReferralData();
  }, [address, router]);

  const fetchReferralData = async () => {
    if (!address) return;

    try {
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/stats?walletAddress=${address}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const codeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/code?walletAddress=${address}`);
      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setStats(prev => (prev ? { ...prev, referralCode: codeData.code } : null));
      }

      const listRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals?walletAddress=${address}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setReferrals(listData);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}?ref=${stats.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-light px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex-1">
            Giới Thiệu
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="flex-1 px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-wallet)] border-t-transparent"
              aria-hidden
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary-wallet)]/10">
                    <UserPlus className="h-4 w-4 text-[var(--color-primary-wallet)]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tổng giới thiệu
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalReferrals ?? 0}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--color-primary-wallet)]/10">
                    <Coins className="h-4 w-4 text-[var(--color-primary-wallet)]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tổng thu nhập
                  </span>
                </div>
                <p className="text-2xl font-bold text-[var(--color-primary-wallet)]">
                  {stats?.totalEarnings ?? 0} {tokenSymbol}
                </p>
              </div>
            </div>

            {/* Referral code card */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 mb-8 text-white shadow-xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-wallet) 0%, #6366f1 50%, #7c3aed 100%)',
                boxShadow: '0 20px 40px -12px rgba(51, 13, 242, 0.35)',
              }}
            >
              <h3 className="font-bold text-lg mb-3">Mã giới thiệu của bạn</h3>
              <div className="flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 p-3.5 mb-4">
                <code className="font-mono text-lg font-bold tracking-[0.2em] flex-1 truncate">
                  {stats?.referralCode || '...'}
                </code>
                <button
                  onClick={copyReferralLink}
                  className="shrink-0 flex size-10 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Sao chép"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              {copied && (
                <p className="text-sm font-medium text-green-200 mb-3">✓ Đã sao chép link!</p>
              )}
              <button
                onClick={copyReferralLink}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-[var(--color-primary-wallet)] shadow-md hover:bg-slate-50 active:scale-[0.99] transition"
              >
                <Share2 className="h-5 w-5" />
                Chia sẻ link giới thiệu
              </button>
            </div>

            {/* Referral list */}
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
              Lịch sử giới thiệu
            </h2>
            {referrals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] py-12 px-6 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                  <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Chưa có giới thiệu nào</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Chia sẻ link để bắt đầu kiếm thêm!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-wallet)]/10 text-[var(--color-primary-wallet)] font-bold text-sm">
                        {ref.referredWallet.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {formatAddress(ref.referredWallet)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Tham gia {new Date(ref.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <p className="text-sm font-bold text-[var(--color-primary-wallet)]">
                        {ref.totalSpent} {tokenSymbol}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Đã chi tiêu</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

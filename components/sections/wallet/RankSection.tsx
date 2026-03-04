'use client';

import { useEffect, useState } from 'react';
import { Crown, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { getRankStats, type RankStats } from '@/lib/api/ranks';

const RANK_LABELS: Record<string, string> = {
  member: 'Thành viên',
  normal: 'Anh hùng bình thường',
  rare: 'Anh hùng hiếm',
  epic: 'Anh hùng sử thi',
  legendary: 'Anh hùng truyền thuyết',
};

const RANK_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  legendary: {
    bg: 'bg-amber-500/20 dark:bg-amber-400/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'text-amber-500',
  },
  epic: {
    bg: 'bg-[var(--color-primary-wallet)]/20',
    text: 'text-[var(--color-primary-wallet)]',
    icon: 'text-[var(--color-primary-wallet)]',
  },
  rare: {
    bg: 'bg-blue-500/20 dark:bg-blue-400/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  normal: {
    bg: 'bg-emerald-500/20 dark:bg-emerald-400/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-500',
  },
  member: {
    bg: 'bg-slate-200/80 dark:bg-slate-500/20',
    text: 'text-slate-700 dark:text-slate-400',
    icon: 'text-slate-500',
  },
};

function getRankStyle(rank: string) {
  return RANK_STYLES[rank] ?? RANK_STYLES.member;
}

function getNextReward(nextRank: string): number {
  switch (nextRank) {
    case 'normal': return 100;
    case 'rare': return 500;
    case 'epic': return 2000;
    case 'legendary': return 8000;
    default: return 0;
  }
}

export function RankSection() {
  const { tokenSymbol } = useConfig();
  const [stats, setStats] = useState<RankStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRankStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-slate-100 dark:bg-[var(--color-surface-dark)] p-6">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Đang tải thông tin xếp hạng...</p>
      </div>
    );
  }

  if (!stats) return null;

  const progress = stats.target > 0 ? Math.min((stats.referrals / stats.target) * 100, 100) : 0;
  const nextReward = getNextReward(stats.nextRank);
  const style = getRankStyle(stats.currentRank);
  const remaining = Math.max(0, stats.target - stats.referrals);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-slate-100 dark:bg-[var(--color-surface-dark)] overflow-hidden">
      {/* Header with gradient accent */}
      <div className="bg-gradient-to-r from-[var(--color-primary-wallet)]/15 via-[var(--color-primary-wallet)]/5 to-transparent px-5 pt-5 pb-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 pb-4">
            <div className="size-9 rounded-lg bg-[var(--color-primary-wallet)]/20 flex items-center justify-center">
              <Crown className={`size-5 ${style.icon}`} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Hệ thống thăng cấp
            </h3>
          </div>
          <span
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold ${style.bg} ${style.text}`}
          >
            {RANK_LABELS[stats.currentRank] || stats.currentRank}
          </span>
        </div>
      </div>

      <div className="p-5 pt-4">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>{stats.referrals} thành viên</span>
            <span>Mục tiêu: {stats.target}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-wallet)] to-[var(--color-primary-wallet)]/80 transition-all duration-500 shadow-[0_0_12px_rgba(51,13,242,0.4)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-[var(--color-border-dark)] p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Users className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Cộng đồng</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats.referrals}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">người</span>
            </p>
          </div>
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/20 dark:border-amber-400/20 p-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <TrendingUp className="size-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {stats.currentRank === 'legendary' ? 'Thưởng hiện tại' : 'Mục tiêu thưởng'}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {nextReward}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">{tokenSymbol}/ngày</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        {stats.nextRank !== 'max' && remaining > 0 && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-[var(--color-primary-wallet)]/10 to-transparent border border-[var(--color-primary-wallet)]/20 px-4 py-3 flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--color-primary-wallet)] shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Mời thêm <strong className="text-slate-900 dark:text-slate-100">{remaining}</strong> người để đạt cấp{' '}
              <strong className="text-[var(--color-primary-wallet)]">{RANK_LABELS[stats.nextRank]}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

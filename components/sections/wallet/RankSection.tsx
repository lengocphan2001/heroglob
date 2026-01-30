'use client';

import { useEffect, useState } from 'react';
import { Crown, Users, TrendingUp } from 'lucide-react';
import { getRankStats, type RankStats } from '@/lib/api/ranks';

export function RankSection() {
    const [stats, setStats] = useState<RankStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRankStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-4 text-center text-sm text-slate-500">Loading rank info...</div>;
    if (!stats) return null;

    const progress = Math.min((stats.referrals / stats.target) * 100, 100);

    const getRankColor = (rank: string) => {
        switch (rank) {
            case 'legendary': return 'text-yellow-600 bg-yellow-100';
            case 'epic': return 'text-purple-600 bg-purple-100';
            case 'rare': return 'text-blue-600 bg-blue-100';
            case 'normal': return 'text-green-600 bg-green-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const getNextReward = (rank: string) => {
        switch (rank) {
            case 'normal': return 100;
            case 'rare': return 500;
            case 'epic': return 2000;
            case 'legendary': return 8000;
            default: return 0; // member -> normal
        }
    };

    // Actually, nextRank is what we are aiming for.
    // stats.nextRank is the TARGET rank.
    const nextReward = (() => {
        switch (stats.nextRank) {
            case 'normal': return 100;
            case 'rare': return 500;
            case 'epic': return 2000;
            case 'legendary': return 8000;
            default: return 0;
        }
    })();

    const rankLabels: Record<string, string> = {
        member: 'Thành viên',
        normal: 'Anh hùng bình thường',
        rare: 'Anh hùng hiếm',
        epic: 'Anh hùng sử thi',
        legendary: 'Anh hùng truyền thuyết',
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 fill-current" />
                    Hệ thống thăng cấp
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRankColor(stats.currentRank)}`}>
                    {rankLabels[stats.currentRank] || stats.currentRank}
                </span>
            </div>

            <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                    <span>{stats.referrals} thành viên</span>
                    <span>Mục tiêu: {stats.target}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs uppercase font-bold">
                        <Users className="w-4 h-4" />
                        Cộng đồng
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                        {stats.referrals} <span className="text-xs font-medium text-slate-500">người</span>
                    </div>
                </div>

                <div className="rounded-xl bg-yellow-50 p-3 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1 text-yellow-600 text-xs uppercase font-bold">
                        <TrendingUp className="w-4 h-4" />
                        {stats.currentRank === 'legendary' ? 'Thưởng hiện tại' : 'Mục tiêu thưởng'}
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                        {nextReward} <span className="text-xs font-medium text-slate-500">HERO/ngày</span>
                    </div>
                </div>
            </div>

            {stats.nextRank !== 'max' && (
                <p className="mt-4 text-xs text-center text-slate-500">
                    Mời thêm {stats.target - stats.referrals} người để đạt cấp <strong>{rankLabels[stats.nextRank]}</strong>
                </p>
            )}
        </div>
    );
}

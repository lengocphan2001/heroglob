import { api } from '@/lib/api';

export type RankStats = {
    currentRank: string;
    referrals: number;
    nextRank: string;
    target: number;
    referralCode: string | null;
};

export function getRankStats() {
    return api<RankStats>('ranks/stats');
}

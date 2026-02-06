import { api } from './client';

export type Payout = {
    id: number;
    userId: number;
    investmentId: number | null;
    amount: number;
    txHash?: string;
    createdAt: string;
    user?: {
        walletAddress?: string;
        email?: string;
        name: string;
    };
};

export type PendingReward = {
    userId: number;
    userName?: string;
    wallet?: string;
    amount: number;
    type: string;
    investmentId?: number | null;
    nftId?: number | null;
    metadata?: any;
};

export const payoutsApi = {
    getAll: () => api<Payout[]>('/investments/payouts'),
    getPending: () => api<PendingReward[]>('/payouts/pending'),
    triggerPayout: (selectedRewards?: PendingReward[]) =>
        api<{ success: boolean; message: string }>('/payouts/trigger', {
            method: 'POST',
            body: JSON.stringify({ selectedRewards }),
        }),
};

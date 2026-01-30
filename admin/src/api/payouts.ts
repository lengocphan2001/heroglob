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

export const payoutsApi = {
    getAll: () => api<Payout[]>('/investments/payouts'),
};

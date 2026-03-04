import { api } from './client';

export type Payout = {
    id: number;
    userId: number;
    investmentId: number | null;
    orderId: number | null;
    walletAddress?: string | null;
    amount: number | string;
    txHash?: string | null;
    type: string;
    scheduledAt: string | null;
    status: string;
    createdAt: string;
    user?: {
        walletAddress?: string;
        email?: string;
        name: string;
    };
};

export const payoutsApi = {
    getAll: () => api<Payout[]>('/investments/payouts'),
    runManualPayout: () => api<{ message: string }>('/investments/admin/run-payout', { method: 'POST' }),
};

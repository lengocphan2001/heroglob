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
    deletePayout: (id: number) =>
        api<{ deleted: boolean; message: string }>(`/investments/admin/payouts/${id}`, { method: 'DELETE' }),
    deleteCycle: (params: { orderId?: number; investmentId?: number }) =>
        api<{ deleted: number; message: string }>('/investments/admin/payouts/cycle', {
            method: 'DELETE',
            body: JSON.stringify(params),
        }),
};

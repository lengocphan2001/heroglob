import { api } from './client';

export type Withdrawal = {
    id: number;
    userId: number;
    walletAddress: string;
    toAddress: string;
    amount: string;
    tokenType: 'usdt' | 'hero';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    txHash?: string;
    rejectReason?: string;
    createdAt: string;
};

export const withdrawalsApi = {
    getAll: () => api<Withdrawal[]>('/withdrawals/admin/all'),
    updateStatus: (id: number, status: string, txHash?: string, rejectReason?: string) =>
        api<Withdrawal>('/withdrawals/admin/status', {
            method: 'PATCH',
            body: JSON.stringify({ id, status, txHash, rejectReason }),
        }),
};

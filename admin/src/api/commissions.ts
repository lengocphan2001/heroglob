import { api } from './client';

export type Commission = {
    id: number;
    referrerWallet: string;
    fromWallet: string;
    amount: string;
    tokenType: string;
    orderId: number;
    status: 'pending' | 'completed';
    createdAt: string;
};

export const commissionsApi = {
    getAll: () => api<Commission[]>('/commissions/admin/all'),
    process: () => api<{ processed: number; failed: number }>('/commissions/admin/process'),
};

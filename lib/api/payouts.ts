import { api } from '@/lib/api';

export type PayoutHistory = {
    id: number;
    userId: number;
    investmentId: number | null;
    amount: number;
    type: string | null;
    createdAt: string;
};

export async function getMyPayouts(): Promise<PayoutHistory[]> {
    return api<PayoutHistory[]>('investments/my-payouts');
}

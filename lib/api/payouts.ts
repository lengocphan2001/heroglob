import { api } from '@/lib/api';

export type PayoutItem = {
    id: number;
    userId: number;
    investmentId: number | null;
    orderId: number | null;
    walletAddress: string | null;
    amount: string;
    txHash: string | null;
    type: string;
    scheduledAt: string | null;
    status: string;
    createdAt: string;
};

export async function getMyPayouts(): Promise<PayoutItem[]> {
    return api<PayoutItem[]>('investments/my-payouts');
}

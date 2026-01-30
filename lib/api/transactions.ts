import { api } from '@/lib/api';

export type TransactionHistoryItem = {
    id: string;
    type: 'order' | 'commission' | 'payout' | 'nft_reward';
    amount: number;
    tokenType?: string;
    description: string;
    status?: string;
    createdAt: string;
    metadata?: any;
};

export async function getTransactionHistory(): Promise<TransactionHistoryItem[]> {
    return api<TransactionHistoryItem[]>('transactions/history');
}

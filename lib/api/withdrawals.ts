import { api } from '@/lib/api';

export type Withdrawal = {
    id: number;
    userId: number;
    walletAddress: string;
    toAddress: string;
    amount: string;
    tokenType: string;
    status: string;
    txHash: string | null;
    rejectReason: string | null;
    createdAt: string;
    updatedAt: string;
};

export async function createWithdrawal(
    toAddress: string,
    amount: number,
    tokenType: 'usdt' | 'hero'
): Promise<Withdrawal> {
    return api<Withdrawal>('withdrawals', {
        method: 'POST',
        body: JSON.stringify({ toAddress, amount, tokenType }),
    });
}

export async function getMyWithdrawals(): Promise<Withdrawal[]> {
    return api<Withdrawal[]>('withdrawals/my-withdrawals');
}

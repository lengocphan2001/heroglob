import { api } from '@/lib/api';

export type UserBalance = {
    heroBalance: number;
    usdtBalance: number;
};

export async function getUserBalance(): Promise<UserBalance> {
    return api<UserBalance>('users/balance');
}

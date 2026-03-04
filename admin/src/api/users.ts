import { api } from './client';

export interface User {
    id: number;
    email: string | null;
    name: string;
    role: string;
    walletAddress: string | null;
    heroBalance: string;
    usdtBalance: string;
    rank: string;
    status?: string;
    referralCode?: string | null;
    referredById?: number | null;
    createdAt: string;
}

export function getUsers() {
    return api<User[]>('users');
}

export interface UserDetailPayload {
    user: User;
    payouts: Array<{
        id: number;
        userId: number;
        investmentId: number | null;
        orderId: number | null;
        amount: string | number;
        type: string;
        scheduledAt: string | null;
        status: string;
        createdAt: string;
    }>;
    investments: Array<{
        id: number;
        amount: string | number;
        dailyProfitPercent: string | number;
        durationDays?: number;
        status: string;
        createdAt: string;
    }>;
    orders: Array<{
        id: number;
        productId: number | null;
        walletAddress: string;
        amount: string;
        status: string;
        createdAt: string;
        product?: { id: number; title?: string; hashId?: string };
    }>;
    commissions: Array<{
        id: number;
        referrerWallet: string;
        fromWallet: string;
        amount: string;
        tokenType: string;
        orderId: number;
        status: string;
        createdAt: string;
    }>;
    withdrawals: Array<{
        id: number;
        userId: number;
        toAddress: string;
        amount: string;
        tokenType: string;
        status: string;
        createdAt: string;
    }>;
}

export function getAdminUserDetail(userId: number) {
    return api<UserDetailPayload>(`admin/users/${userId}/detail`);
}

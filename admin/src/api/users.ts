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
    status: string; // fallback if not in DB, assume active
    referralCode: string | null;
    referredById: number | null;
    createdAt: string;
}

export function getUsers() {
    return api<User[]>('users');
}

export function getUser(id: number | string) {
    return api<User & { referralCount: number; referrals: User[]; referrer: { id: number; name: string } | null }>(`users/${id}`);
}

import { api } from './client';

export interface Commission {
    id: number;
    referrerWallet: string;
    fromWallet: string;
    amount: string;
    tokenType: string;
    status: string;
    orderId: number;
    createdAt: string;
}

export function getCommissions(): Promise<Commission[]> {
    return api<Commission[]>('commissions/admin/all');
}

export function getUserCommissions(wallet: string): Promise<Commission[]> {
    return api<Commission[]>(`commissions/admin/user/${wallet}`);
}

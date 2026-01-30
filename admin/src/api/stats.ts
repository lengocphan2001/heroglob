import { api } from './client';

export interface DashboardStats {
    revenue: {
        usdt: number;
        hero: number;
        formatted: string;
    };
    users: {
        total: number;
        growth: string;
    };
    orders: {
        total: number;
        growth: string;
    };
    recentOrders: {
        id: number;
        customer: string;
        amount: string;
        status: string;
        createdAt: string;
    }[];
}

export function getDashboardStats(): Promise<DashboardStats> {
    return api<DashboardStats>('stats/dashboard');
}

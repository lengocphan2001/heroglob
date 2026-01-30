import { api } from './client';

export interface User {
    id: number;
    email: string | null;
    name: string;
    role: string;
    walletAddress: string | null;
    heroBalance: string;
    status: string; // fallback if not in DB, assume active
    createdAt: string;
}

export function getUsers() {
    return api<User[]>('users');
}

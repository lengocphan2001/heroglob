import { api } from './api';

export type LoginResponse = {
    access_token: string;
    user: {
        id: string;
        email: string | null;
        name: string;
        role: string;
    };
};

export async function loginWallet(address: string, refCode?: string | null) {
    return api<LoginResponse>('auth/login-wallet', {
        method: 'POST',
        body: JSON.stringify({ address, refCode }),
    });
}

export async function registerWallet(
    address: string,
    refCode?: string,
    options?: { name?: string; email?: string },
) {
    return api<LoginResponse>('auth/register-wallet', {
        method: 'POST',
        body: JSON.stringify({ address, refCode, name: options?.name, email: options?.email }),
    });
}

export async function register(data: { email: string; password: string; name: string; refCode?: string }) {
    return api<LoginResponse>('auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function login(data: { email: string; password: string }) {
    return api<LoginResponse>('auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

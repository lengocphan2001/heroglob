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

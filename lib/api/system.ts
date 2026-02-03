import { api } from '@/lib/api';

export type SystemConfig = {
    id: number;
    key: string;
    value: string;
};

export async function getSystemConfig(): Promise<SystemConfig[]> {
    return api<SystemConfig[]>('system-config', {
        cache: 'no-store',
        headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        }
    });
}

export async function getAppConfig(): Promise<{ tokenName: string; tokenSymbol: string; paymentReceiverAddress: string }> {
    const list = await getSystemConfig();
    const tokenName = list.find(c => c.key === 'PROJECT_TOKEN_NAME')?.value || 'Hero Coin';
    const tokenSymbol = list.find(c => c.key === 'PROJECT_TOKEN_SYMBOL')?.value || 'HERO';
    const paymentReceiverAddress = list.find(c => c.key === 'PAYMENT_RECEIVER_ADDRESS')?.value || '';
    return { tokenName, tokenSymbol, paymentReceiverAddress };
}

/** @deprecated Use getAppConfig */
export async function getProjectTokenConfig() {
    const c = await getAppConfig();
    return { name: c.tokenName, symbol: c.tokenSymbol };
}

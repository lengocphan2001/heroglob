import { api } from '@/lib/api';

export type SystemConfig = {
    id: number;
    key: string;
    value: string;
};

export async function getSystemConfig(): Promise<SystemConfig[]> {
    return api<SystemConfig[]>('system-config', {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        }
    });
}

export async function getAppConfig(): Promise<{
    projectName: string;
    projectLogo: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    paymentReceiverAddress: string
}> {
    const list = await getSystemConfig();
    const projectName = list.find(c => c.key === 'PROJECT_NAME')?.value || 'Hero Global';
    const projectLogo = list.find(c => c.key === 'PROJECT_LOGO')?.value || '';
    const tokenName = list.find(c => c.key === 'PROJECT_TOKEN_NAME')?.value || 'Hero Coin';
    const tokenSymbol = list.find(c => c.key === 'PROJECT_TOKEN_SYMBOL')?.value || 'HERO';
    const tokenAddress = list.find(c => c.key === 'PROJECT_TOKEN_ADDRESS')?.value || '';
    const paymentReceiverAddress = list.find(c => c.key === 'PAYMENT_RECEIVER_ADDRESS')?.value || '';
    return { projectName, projectLogo, tokenName, tokenSymbol, tokenAddress, paymentReceiverAddress };
}

/** @deprecated Use getAppConfig */
export async function getProjectTokenConfig() {
    const c = await getAppConfig();
    return { name: c.tokenName, symbol: c.tokenSymbol };
}

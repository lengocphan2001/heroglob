import { api } from '@/lib/api';

export type SystemConfig = {
    id: number;
    key: string;
    value: string;
};

export async function getSystemConfig(): Promise<SystemConfig[]> {
    try {
        return await api<SystemConfig[]>('system-config', {
            next: { revalidate: 60 }, // Revalidate every minute instead of no-store
        });
    } catch (e) {
        console.error('getSystemConfig error:', e);
        return [];
    }
}

export async function getAppConfig(): Promise<{ projectName: string; projectDescription: string; tokenName: string; tokenSymbol: string; paymentReceiverAddress: string }> {
    const list = await getSystemConfig();
    const projectName = list.find(c => c.key === 'PROJECT_NAME')?.value || 'HeroGlob';
    const projectDescription = list.find(c => c.key === 'PROJECT_DESCRIPTION')?.value || 'Metaverse & NFTs';
    const tokenName = list.find(c => c.key === 'PROJECT_TOKEN_NAME')?.value || 'Hero Coin';
    const tokenSymbol = list.find(c => c.key === 'PROJECT_TOKEN_SYMBOL')?.value || 'HERO';
    const paymentReceiverAddress = list.find(c => c.key === 'PAYMENT_RECEIVER_ADDRESS')?.value || '';
    return { projectName, projectDescription, tokenName, tokenSymbol, paymentReceiverAddress };
}

/** @deprecated Use getAppConfig */
export async function getProjectTokenConfig() {
    const c = await getAppConfig();
    return { name: c.tokenName, symbol: c.tokenSymbol };
}

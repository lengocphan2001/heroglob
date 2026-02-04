'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppConfig } from '@/lib/api/system';

type ConfigState = {
    projectName: string;
    projectLogo: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAddress: string;
    paymentReceiverAddress: string;
};

const ConfigContext = createContext<ConfigState>({
    projectName: 'Hero Global',
    projectLogo: '',
    tokenName: 'Hero Coin',
    tokenSymbol: 'HERO',
    tokenAddress: '',
    paymentReceiverAddress: '',
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<ConfigState>({
        projectName: 'Hero Global',
        projectLogo: '',
        tokenName: 'Hero Coin',
        tokenSymbol: 'HERO',
        tokenAddress: '',
        paymentReceiverAddress: '',
    });

    useEffect(() => {
        getAppConfig().then(setConfig).catch(console.error);
    }, []);

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
    return useContext(ConfigContext);
}

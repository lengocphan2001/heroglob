'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppConfig } from '@/lib/api/system';

type ConfigState = {
    projectName: string;
    tokenName: string;
    tokenSymbol: string;
    paymentReceiverAddress: string;
};

const ConfigContext = createContext<ConfigState>({
    projectName: 'Hero Global',
    tokenName: 'Hero Coin',
    tokenSymbol: 'HERO',
    paymentReceiverAddress: '',
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<ConfigState>({
        projectName: 'Hero Global',
        tokenName: 'Hero Coin',
        tokenSymbol: 'HERO',
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

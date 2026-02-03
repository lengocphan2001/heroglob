'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppConfig } from '@/lib/api/system';

type ConfigState = {
    tokenName: string;
    tokenSymbol: string;
    paymentReceiverAddress: string;
};

const ConfigContext = createContext<ConfigState>({
    tokenName: 'Hero Coin',
    tokenSymbol: 'HERO',
    paymentReceiverAddress: '',
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<ConfigState>({
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

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAppConfig } from '@/lib/api/system';

type ConfigState = {
    projectName: string;
    projectDescription: string;
    tokenName: string;
    tokenSymbol: string;
    paymentReceiverAddress: string;
    heroTokenAddress: string;
};

const ConfigContext = createContext<ConfigState>({
    projectName: 'HeroGlob',
    projectDescription: 'Metaverse & NFTs',
    tokenName: 'Hero Coin',
    tokenSymbol: 'HERO',
    paymentReceiverAddress: '',
    heroTokenAddress: '',
});

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<ConfigState>({
        projectName: 'HeroGlob',
        projectDescription: 'Metaverse & NFTs',
        tokenName: 'Hero Coin',
        tokenSymbol: 'HERO',
        paymentReceiverAddress: '',
        heroTokenAddress: '',
    });

    useEffect(() => {
        getAppConfig().then(setConfig).catch(console.error);
    }, []);

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
    return useContext(ConfigContext);
}

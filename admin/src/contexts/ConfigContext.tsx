import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { systemApi } from '../api/system';

type TokenConfig = {
  tokenName: string;
  tokenSymbol: string;
};

const defaultToken: TokenConfig = {
  tokenName: 'Hero Coin',
  tokenSymbol: 'HERO',
};

const ConfigContext = createContext<TokenConfig>(defaultToken);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TokenConfig>(defaultToken);

  useEffect(() => {
    systemApi
      .getAll()
      .then((list) => {
        const tokenName = list.find((c) => c.key === 'PROJECT_TOKEN_NAME')?.value ?? defaultToken.tokenName;
        const tokenSymbol = list.find((c) => c.key === 'PROJECT_TOKEN_SYMBOL')?.value ?? defaultToken.tokenSymbol;
        setConfig({ tokenName, tokenSymbol });
      })
      .catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useTokenConfig() {
  return useContext(ConfigContext);
}

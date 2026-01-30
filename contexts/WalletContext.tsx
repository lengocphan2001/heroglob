'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { BSC_CHAIN_ID, BSC_PARAMS } from '@/lib/wallet/tokens';
import { loginWallet } from '@/lib/auth';
import { getStoredRefCode } from '@/lib/api/referrals';
import Cookies from 'js-cookie';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

type WalletState = {
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  error: string | null;
};

type WalletContextValue = WalletState & {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
};

const defaultState: WalletState = {
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
};

const WalletContext = createContext<WalletContextValue | null>(null);

function getEthereum() {
  if (typeof window === 'undefined') return undefined;
  return window.ethereum;
}

/** Chuyển ví sang BSC (BEP20) – mặc định cho app */
async function ensureBsc(ethereum: NonNullable<Window['ethereum']>): Promise<void> {
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_PARAMS.chainId }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BSC_PARAMS],
      });
    }
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(defaultState);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState((s) => ({ ...s, error: 'Ví không tìm thấy. Hãy cài MetaMask hoặc ví tương thích.' }));
      return;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const address = accounts[0] ?? null;
      let chainId: string | null = null;
      try {
        const hex = (await ethereum.request({ method: 'eth_chainId' })) as string;
        chainId = hex ? String(parseInt(hex, 16)) : null;
      } catch {
        // ignore
      }
      if (address && chainId !== BSC_CHAIN_ID) {
        await ensureBsc(ethereum);
        try {
          const hex = (await ethereum.request({ method: 'eth_chainId' })) as string;
          chainId = hex ? String(parseInt(hex, 16)) : null;
        } catch {
          // keep previous chainId
        }
      }

      // Auto login/register backend
      try {
        const refCode = getStoredRefCode();
        const { access_token } = await loginWallet(address, refCode);
        Cookies.set('token', access_token, { expires: 7 });
      } catch (err) {
        console.error('Login failed:', err);
        // We don't block wallet connection if login fails, but maybe show error?
      }

      setState({ address, chainId, isConnecting: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kết nối thất bại';
      setState((s) => ({ ...s, address: null, chainId: null, isConnecting: false, error: message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(defaultState);
  }, []);

  // Khôi phục phiên đã kết nối khi reload; mặc định chuyển sang BSC (BEP20)
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        const list = Array.isArray(accounts) ? accounts : [];
        const address = list[0] ? String(list[0]) : null;
        if (!address) return;
        return ethereum.request({ method: 'eth_chainId' }).then(async (hex) => {
          let chainId = hex ? String(parseInt(String(hex), 16)) : null;
          if (chainId !== BSC_CHAIN_ID) {
            await ensureBsc(ethereum);
            try {
              const newHex = (await ethereum.request({ method: 'eth_chainId' })) as string;
              chainId = newHex ? String(parseInt(newHex, 16)) : chainId;
            } catch {
              // keep
            }
          }
          setState((s) => ({ ...s, address, chainId }));
        });
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum?.on) return;
    const handleAccounts = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? accounts : [];
      const address = list[0] ? String(list[0]) : null;
      setState((s) => (address ? { ...s, address } : { ...s, address: null, chainId: null }));
    };
    const handleChain = (chainIdHex: unknown) => {
      const hex = typeof chainIdHex === 'string' ? chainIdHex : '';
      setState((s) => ({ ...s, chainId: hex ? String(parseInt(hex, 16)) : null }));
    };
    ethereum.on('accountsChanged', handleAccounts);
    ethereum.on('chainChanged', handleChain);
    return () => {
      ethereum.on?.('accountsChanged', handleAccounts);
      ethereum.on?.('chainChanged', handleChain);
    };
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({ ...state, connect, disconnect, isConnected: !!state.address }),
    [state, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

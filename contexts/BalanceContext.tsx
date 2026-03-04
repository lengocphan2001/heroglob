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
import { useWallet } from '@/contexts/WalletContext';
import { getUserBalance, type UserBalance } from '@/lib/api/balance';

type BalanceContextValue = {
  balance: UserBalance | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const BalanceContext = createContext<BalanceContextValue | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    getUserBalance()
      .then(setBalance)
      .catch((err) => {
        console.error('Failed to fetch balance:', err);
        setError('Không thể tải số dư');
      })
      .finally(() => setLoading(false));
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setBalance(null);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [isConnected, refetch]);

  const value = useMemo<BalanceContextValue>(
    () => ({ balance, loading, error, refetch }),
    [balance, loading, error, refetch],
  );

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
}

export function useBalance(): BalanceContextValue {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider');
  return ctx;
}

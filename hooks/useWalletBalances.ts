'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import {
  fetchTokenBalance,
  fetchTokenDecimals,
  fetchNativeBalance,
  formatTokenAmount,
  formatNativeAmount,
} from '@/lib/wallet/fetchBalances';
import { getUsdtAddress, getNetworkLabel, getNativeSymbol, HERO_TOKEN } from '@/lib/wallet/tokens';

export type WalletTokenItem = {
  id: string;
  symbol: string;
  name: string;
  /** Nhãn mạng: BEP20, ERC20, ... */
  networkLabel?: string;
  amount: string;
  raw: bigint;
  decimals: number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  iconUrl?: string;
};

export type WalletBalancesState = {
  tokens: WalletTokenItem[];
  /** Tổng số dư native (BNB trên BSC) để hiển thị Total Balance */
  totalBnb: string;
  totalCrypto: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function getEthereum() {
  if (typeof window === 'undefined') return undefined;
  return window.ethereum;
}

const USDT_META = {
  symbol: 'USDT',
  name: 'Tether',
  iconUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7W5dYva1t6ZYasvySkCiHMRQKlrhiJ1A9R13z51Hn28LP4DNrOGtWMvaHmdUy3t7xoWkxBvBbKgeZFG4wD0NXjWTie1kn7MTEYJYAMVbSQFbsRZJm3LTjXSL_q9Bvdv7Pxde7C3R7CgOZuHvkuUuQw04guB-FQnX1qKYaarj23WqNUh9c1-oNtyhoqOlFT3kSy9nxYT9v0I6JDntduf1CqeTZ5m7CxJJN3tY332wtzz49Q4l3OLgYJpN9Lf5Yr2xVUf_a7H8itE',
};

export function useWalletBalances(): WalletBalancesState {
  const { address, chainId, isConnected } = useWallet();
  const [tokens, setTokens] = useState<WalletTokenItem[]>([]);
  const [totalBnb, setTotalBnb] = useState<string>('—');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum || !address) {
      setTokens([]);
      setTotalBnb('—');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const usdtAddress = getUsdtAddress(chainId);
      const networkLabel = getNetworkLabel(chainId);
      const nativeSymbol = getNativeSymbol(chainId);

      const [nativeWei, usdtRaw, usdtDecimals, heroRaw, heroDecimals] = await Promise.all([
        fetchNativeBalance(ethereum, address).catch(() => 0n),
        usdtAddress
          ? fetchTokenBalance(ethereum, usdtAddress, address, 6).catch(() => 0n)
          : Promise.resolve(0n),
        usdtAddress
          ? fetchTokenDecimals(ethereum, usdtAddress).catch(() => 6)
          : Promise.resolve(6),
        fetchTokenBalance(ethereum, HERO_TOKEN.address, address, 18).catch(() => 0n),
        fetchTokenDecimals(ethereum, HERO_TOKEN.address).catch(() => 18),
      ]);

      const bnbFormatted = formatNativeAmount(nativeWei);
      setTotalBnb(bnbFormatted ? `${bnbFormatted} ${nativeSymbol}` : '—');

      const list: WalletTokenItem[] = [];

      if (usdtAddress) {
        list.push({
          id: 'usdt',
          symbol: USDT_META.symbol,
          name: USDT_META.name,
          networkLabel,
          amount: formatTokenAmount(usdtRaw, usdtDecimals),
          raw: usdtRaw,
          decimals: usdtDecimals,
          changeType: 'neutral',
          iconUrl: USDT_META.iconUrl,
        });
      }

      list.push({
        id: 'hero',
        symbol: HERO_TOKEN.symbol,
        name: HERO_TOKEN.name,
        networkLabel,
        amount: formatTokenAmount(heroRaw, heroDecimals),
        raw: heroRaw,
        decimals: heroDecimals,
        changeType: 'neutral',
        iconUrl: HERO_TOKEN.iconUrl,
      });

      setTokens(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không tải được số dư';
      setError(message);
      setTokens([]);
      setTotalBnb('—');
    } finally {
      setLoading(false);
    }
  }, [address, chainId]);

  useEffect(() => {
    if (!isConnected || !address) {
      setTokens([]);
      setTotalBnb('—');
      setLoading(false);
      setError(null);
      return;
    }
    fetchBalances();
  }, [isConnected, address, fetchBalances]);

  const totalCrypto = tokens
    .map((t) => `${t.amount} ${t.symbol}`)
    .join(', ') || '—';

  return {
    tokens,
    totalBnb,
    totalCrypto: totalCrypto || '—',
    loading,
    error,
    refetch: fetchBalances,
  };
}

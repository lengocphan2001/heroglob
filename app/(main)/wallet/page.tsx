'use client';

import { useState, useEffect } from 'react';
import {
  BalanceCard,
  WalletTabs,
  TokenRow,
  RankSection,
  HistoryTab,
  NFTsTab,
} from '@/components/sections/wallet';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { useWallet } from '@/contexts/WalletContext';
import { getUserBalance, type UserBalance } from '@/lib/api/balance';
import { useConfig } from '@/contexts/ConfigContext';

type TabId = 'tokens' | 'nfts' | 'history';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tokens');
  const { isConnected } = useWallet();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawToken, setWithdrawToken] = useState<'usdt' | 'hero'>('usdt');
  const { tokenName, tokenSymbol } = useConfig();

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

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

  const refetch = () => {
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
  };

  const handleWithdraw = (tokenType: 'usdt' | 'hero') => {
    setWithdrawToken(tokenType);
    setWithdrawModalOpen(true);
  };

  return (
    <div className="relative mx-auto flex max-w-md flex-col bg-white">
      <div className="px-6 pt-2 pb-8">
        {!isConnected ? (
          <div className="wallet-gradient-card flex min-h-[140px] flex-col items-center justify-center rounded-3xl p-8 text-white shadow-2xl">
            <p className="text-sm font-medium text-white/90">Kết nối ví để xem số dư</p>
          </div>
        ) : loading ? (
          <div className="wallet-gradient-card flex min-h-[140px] flex-col items-center justify-center rounded-3xl p-8 text-white shadow-2xl">
            <p className="text-sm font-medium text-white/90">Đang tải số dư...</p>
          </div>
        ) : error ? (
          <div className="wallet-gradient-card rounded-3xl p-8 text-white shadow-2xl">
            <p className="mb-2 text-sm font-medium text-white/90">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <BalanceCard
            totalUsd={`$${(balance?.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            totalCrypto={`${(balance?.heroBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tokenSymbol}`}
            changePercent="—"
          />
        )}
      </div>

      <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100">
        <div className="pt-6">
          <WalletTabs activeId={activeTab} onSelect={setActiveTab} />
        </div>

        {activeTab === 'tokens' && (
          <div className="space-y-3 px-6 pt-4">
            {!isConnected ? (
              <p className="py-4 text-center text-sm text-slate-500">Kết nối ví để xem token.</p>
            ) : loading ? (
              <p className="py-4 text-center text-sm text-slate-500">Đang tải...</p>
            ) : error ? (
              <p className="py-4 text-center text-sm text-slate-500">{error}</p>
            ) : (
              <>
                <TokenRow
                  iconUrl="/usdt-icon.svg"
                  name="Tether USD"
                  symbol="USDT"
                  networkLabel="BEP-20"
                  amount={`${(balance?.usdtBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  onWithdraw={() => handleWithdraw('usdt')}
                />
                <TokenRow
                  iconUrl="/hero-icon.svg"
                  name={tokenName}
                  symbol={tokenSymbol}
                  networkLabel="BEP-20"
                  amount={`${(balance?.heroBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'nfts' && <NFTsTab />}

        {activeTab === 'history' && <HistoryTab />}

        <div className="mt-6 px-6 pb-6">
          <RankSection />
        </div>
      </div>

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        tokenType={withdrawToken}
        balance={withdrawToken === 'usdt' ? (balance?.usdtBalance || 0) : (balance?.heroBalance || 0)}
        onSuccess={refetch}
      />
    </div>
  );
}

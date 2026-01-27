'use client';

import { useState } from 'react';
import {
  BalanceCard,
  ActionGrid,
  WalletTabs,
  TokenRow,
  VaultCard,
} from '@/components/sections/wallet';
import { useWallet } from '@/contexts/WalletContext';
import { useWalletBalances } from '@/hooks/useWalletBalances';

type TabId = 'tokens' | 'nfts' | 'history';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tokens');
  const { isConnected } = useWallet();
  const { tokens, totalBnb, totalCrypto, loading, error, refetch } = useWalletBalances();

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
            totalUsd={totalBnb}
            totalCrypto={totalCrypto}
            changePercent="—"
          />
        )}
      </div>

      <div className="px-6 pb-8">
        <ActionGrid />
      </div>

      <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100 ">
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
            ) : tokens.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">Chưa có token.</p>
            ) : (
              tokens.map((token) => (
                <TokenRow
                  key={token.id}
                  href={`/wallet/token/${token.id}`}
                  iconUrl={token.iconUrl ?? '/file.svg'}
                  name={token.name}
                  symbol={token.symbol}
                  networkLabel={token.networkLabel}
                  amount={token.amount}
                  change={token.change}
                  changeType={token.changeType}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'nfts' && (
          <div className="px-6 pt-4">
            <p className="text-center text-sm text-slate-500">Chưa có NFT nào.</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="px-6 pt-4">
            <p className="text-center text-sm text-slate-500">Chưa có giao dịch.</p>
          </div>
        )}

        <div className="mt-6 px-6">
          <VaultCard />
        </div>
      </div>
    </div>
  );
}

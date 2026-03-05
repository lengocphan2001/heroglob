'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BalanceCard,
  ActionGrid,
  TokenRow,
  VaultCard,
  RankSection,
} from '@/components/sections/wallet';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { useWallet } from '@/contexts/WalletContext';
import { useBalance } from '@/contexts/BalanceContext';
import { useConfig } from '@/contexts/ConfigContext';

export default function WalletPage() {
  const { isConnected } = useWallet();
  const { balance, loading, error, refetch } = useBalance();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawToken, setWithdrawToken] = useState<'usdt' | 'hero'>('usdt');
  const { tokenName, tokenSymbol } = useConfig();

  const handleWithdraw = (tokenType: 'usdt' | 'hero') => {
    setWithdrawToken(tokenType);
    setWithdrawModalOpen(true);
  };

  const formatUsd = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex flex-col min-h-full bg-slate-100 dark:bg-[var(--color-background-dark)]">
      <div className="flex-1 min-h-0 px-4 pb-24">
        {/* Balance Card */}
        <div className="mt-2">
          {!isConnected ? (
            <div
              className="relative overflow-hidden rounded-xl p-6 shadow-2xl border border-white/10 flex min-h-[160px] flex-col items-center justify-center text-white"
              style={{
                backgroundColor: 'var(--color-primary-wallet)',
                backgroundImage: `
                  radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
                  radial-gradient(at 0% 50%, hsla(260,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 100% 50%, hsla(262,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 0% 100%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)
                `,
              }}
            >
              <p className="text-sm font-medium text-white/90">Kết nối ví để xem số dư</p>
            </div>
          ) : loading ? (
            <div
              className="relative overflow-hidden rounded-xl p-6 shadow-2xl border border-white/10 flex min-h-[160px] flex-col items-center justify-center text-white"
              style={{
                backgroundColor: 'var(--color-primary-wallet)',
                backgroundImage: `
                  radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
                  radial-gradient(at 0% 50%, hsla(260,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 100% 50%, hsla(262,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 0% 100%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)
                `,
              }}
            >
              <p className="text-sm font-medium text-white/90">Đang tải số dư...</p>
            </div>
          ) : error ? (
            <div
              className="relative overflow-hidden rounded-xl p-6 shadow-2xl border border-white/10 text-white"
              style={{
                backgroundColor: 'var(--color-primary-wallet)',
                backgroundImage: `
                  radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
                  radial-gradient(at 0% 50%, hsla(260,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 100% 50%, hsla(262,82%,50%,1) 0, transparent 50%),
                  radial-gradient(at 0% 100%, hsla(253,16%,7%,1) 0, transparent 50%),
                  radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%),
                  radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)
                `,
              }}
            >
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
              totalUsd={`$${formatUsd(balance?.usdtBalance ?? 0)}`}
              totalCrypto={`${(balance?.heroBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tokenSymbol}`}
              changePercent="—"
              tokenSymbols={['USDT', tokenSymbol]}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <ActionGrid />
        </div>

        {/* Assets */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tài sản</h3>
            <Link href="/wallet/history" className="text-[var(--color-primary-wallet)] text-sm font-semibold">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {!isConnected ? (
              <p className="py-4 text-center text-sm text-slate-500">Kết nối ví để xem tài sản.</p>
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
                  amount={`$${formatUsd(balance?.usdtBalance ?? 0)}`}
                  change="0.0%"
                  changeType="neutral"
                  onWithdraw={() => handleWithdraw('usdt')}
                />
                <TokenRow
                  iconUrl="/hero-icon.svg"
                  name={tokenName}
                  symbol={tokenSymbol}
                  networkLabel="BEP-20"
                  amount={`${(balance?.heroBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  onWithdraw={() => handleWithdraw('hero')}
                />
              </>
            )}
          </div>
        </div>

        {/* Rank section */}
        <div className="px-0 pb-6 pt-6">
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

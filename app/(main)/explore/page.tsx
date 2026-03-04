'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ExploreProductCard } from '@/components/sections';
import { TransactionModal } from '@/components/wallet/TransactionModal';
import type { TxStatus } from '@/components/wallet/TransactionModal';
import { getCategories } from '@/lib/api/categories';
import { getProducts, type Product } from '@/lib/api/products';
import { createOrder } from '@/lib/api/orders';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import { getUsdtAddress, getUsdtDecimals } from '@/lib/wallet/tokens';
import { sendTokenTransfer, toRawAmount, waitForTransaction, checkBalance } from '@/lib/wallet/transfer';

import { formatPriceDisplay } from '@/lib/formatPrice';

function getEthereum() {
  if (typeof window === 'undefined') return undefined;
  return window.ethereum;
}

function getExplorerTxUrl(chainId: string | null, txHash: string): string {
  if (chainId === '56') return `https://bscscan.com/tx/${txHash}`;
  if (chainId === '1') return `https://etherscan.io/tx/${txHash}`;
  return `https://bscscan.com/tx/${txHash}`;
}

export default function ExplorePage() {
  const { isConnected, address, chainId } = useWallet();
  const { paymentReceiverAddress } = useConfig();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([{ id: 'all', label: 'Tất cả' }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<{ id: number; type: 'usdt' } | null>(null);
  const [txModal, setTxModal] = useState<{
    open: boolean;
    status: TxStatus;
    amountDisplay: string;
    tokenLabel: string;
    productTitle?: string;
    txHash?: string | null;
    error?: string | null;
    onConfirmTransfer?: () => void | Promise<void>;
  }>({
    open: false,
    status: 'confirming',
    amountDisplay: '',
    tokenLabel: '',
  });

  useEffect(() => {
    getCategories()
      .then((list) =>
        setCategories([
          { id: 'all', label: 'Tất cả' },
          ...list.map((c) => ({ id: c.slug, label: c.name })),
        ]),
      )
      .catch(() => setCategories([{ id: 'all', label: 'All' }]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts(activeCategory === 'all' ? undefined : activeCategory)
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered =
    !search.trim()
      ? products
      : products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.creatorHandle.toLowerCase().includes(search.toLowerCase()),
      );

  const handleBuyUsdt = useCallback(
    async (product: Product) => {
      if (!isConnected || !address) {
        alert('Vui lòng kết nối ví.');
        return;
      }
      if (!paymentReceiverAddress) {
        alert('Chưa cấu hình địa chỉ nhận thanh toán.');
        return;
      }
      const ethereum = getEthereum();
      if (!ethereum) {
        alert('Không tìm thấy ví.');
        return;
      }
      const usdtAddress = getUsdtAddress(chainId);
      if (!usdtAddress) {
        alert('USDT không hỗ trợ trên mạng này. Vui lòng chuyển sang BSC (BEP20).');
        return;
      }
      const priceUsdt = product.priceUsdt ?? '0';
      if (parseFloat(priceUsdt) <= 0) return;
      const amountDisplay = formatPriceDisplay(priceUsdt);
      setBuying({ id: product.id, type: 'usdt' });
      setTxModal({
        open: true,
        status: 'confirming',
        amountDisplay,
        tokenLabel: 'USDT',
        productTitle: product.title,
        onConfirmTransfer: async () => {
          try {
            const raw = toRawAmount(priceUsdt, getUsdtDecimals(chainId));

            await checkBalance(ethereum, address, usdtAddress, raw);

            const txHash = await sendTokenTransfer(
              ethereum,
              address,
              usdtAddress,
              paymentReceiverAddress,
              raw,
            );
            setTxModal((m) => ({ ...m, status: 'pending', txHash }));

            await waitForTransaction(ethereum, txHash);

            await createOrder({
              productId: product.id,
              walletAddress: address,
              tokenType: 'usdt',
              amount: amountDisplay,
              txHash,
            });
            setTxModal((m) => ({ ...m, status: 'success' }));
          } catch (err) {
            setTxModal((m) => ({
              ...m,
              status: 'error',
              error: err instanceof Error ? err.message : 'Giao dịch thất bại',
            }));
          } finally {
            setBuying(null);
          }
        },
      });
    },
    [isConnected, address, chainId, paymentReceiverAddress],
  );

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto pb-24 bg-slate-100 dark:bg-[var(--color-background-dark)] min-h-full">
      <TransactionModal
        open={txModal.open}
        status={txModal.status}
        amountDisplay={txModal.amountDisplay}
        tokenLabel={txModal.tokenLabel}
        productTitle={txModal.productTitle}
        txHash={txModal.txHash}
        explorerTxUrl={
          txModal.txHash ? getExplorerTxUrl(chainId, txModal.txHash) : undefined
        }
        error={txModal.error}
        onConfirmTransfer={txModal.onConfirmTransfer}
        onClose={() => {
          setTxModal((m) => ({ ...m, open: false, onConfirmTransfer: undefined }));
          setBuying(null);
        }}
      />

      {/* Search bar */}
      <div className="px-4 pt-6">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search collections, items, artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[var(--color-primary-wallet)]/5 border border-slate-200 dark:border-[var(--color-primary-wallet)]/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-primary-wallet)] focus:border-transparent outline-none transition-all"
            aria-label="Tìm bộ sưu tập"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-4 py-6 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'active-filter text-white shadow-lg shadow-[var(--color-primary-wallet)]/20'
                  : 'bg-slate-100 dark:bg-[var(--color-primary-wallet)]/10 border border-slate-200 dark:border-[var(--color-primary-wallet)]/20 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[var(--color-primary-wallet)]/20'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Section title */}
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Dynamic Drops
        </h2>
        <Link
          href="/explore/featured"
          className="text-[var(--color-primary-wallet)] text-sm font-semibold hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {error && (
        <p className="px-4 pb-4 text-sm text-red-500">{error}</p>
      )}

      {loading ? (
        <p className="px-4 pb-8 text-center text-slate-500 dark:text-slate-400">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {filtered.length === 0 ? (
            <p className="col-span-2 py-12 text-center text-slate-500 dark:text-slate-400">
              Chưa có sản phẩm nào.
            </p>
          ) : (
            filtered.map((p) => (
              <ExploreProductCard
                key={p.id}
                product={p}
                onBuyUsdt={handleBuyUsdt}
                isBuying={buying?.id === p.id ? buying.type : null}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

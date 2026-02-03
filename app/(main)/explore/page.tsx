'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { CategoryPills } from '@/components/ui';
import { ProductCard } from '@/components/sections';
import { TransactionModal } from '@/components/wallet/TransactionModal';
import type { TxStatus } from '@/components/wallet/TransactionModal';
import { getCategories } from '@/lib/api/categories';
import { getProducts, type Product } from '@/lib/api/products';
import { createOrder } from '@/lib/api/orders';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import { getUsdtAddress, getUsdtDecimals, HERO_TOKEN } from '@/lib/wallet/tokens';
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
  const { tokenSymbol, paymentReceiverAddress } = useConfig();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([{ id: 'all', label: 'Tất cả' }]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<{ id: number; type: 'usdt' | 'hero' } | null>(null);
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

  const handleBuyHero = useCallback(
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
      const priceHero = product.priceHero ?? '0';
      if (parseFloat(priceHero) <= 0) return;
      const amountDisplay = formatPriceDisplay(priceHero);
      setBuying({ id: product.id, type: 'hero' });
      setTxModal({
        open: true,
        status: 'confirming',
        amountDisplay,
        tokenLabel: tokenSymbol, // Use dynamic token symbol
        productTitle: product.title,
        onConfirmTransfer: async () => {
          try {
            const raw = toRawAmount(priceHero, 18);

            await checkBalance(ethereum, address, HERO_TOKEN.address, raw);

            const txHash = await sendTokenTransfer(
              ethereum,
              address,
              HERO_TOKEN.address,
              paymentReceiverAddress,
              raw,
            );
            setTxModal((m) => ({ ...m, status: 'pending', txHash }));

            await waitForTransaction(ethereum, txHash);

            await createOrder({
              productId: product.id,
              walletAddress: address,
              tokenType: 'hero',
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
    [isConnected, address, tokenSymbol, paymentReceiverAddress],
  );

  return (
    <div className="bg-white">
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
      <div className="px-4 py-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Tìm kiếm bộ sưu tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border-none bg-[var(--color-surface-light)] pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none"
              aria-label="Search collections"
            />
          </div>
          <button
            type="button"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-dark)] text-white shadow-lg shadow-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            aria-label="Filter"
          >
            <SlidersHorizontal className="size-6" />
          </button>
        </div>
      </div>

      <div className="px-4">
        <CategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          Sản phẩm nổi bật
        </h3>
        <Link
          href="/explore/featured"
          className="flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] hover:underline"
        >
          Xem tất cả
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {error && (
        <p className="px-4 pb-4 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="px-4 pb-8 text-center text-slate-500">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4 pb-8">
          {filtered.length === 0 ? (
            <p className="col-span-2 py-8 text-center text-slate-500">
              Chưa có sản phẩm nào.
            </p>
          ) : (
            filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onBuyUsdt={handleBuyUsdt}
                onBuyHero={handleBuyHero}
                isBuying={
                  buying?.id === p.id ? buying.type : null
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

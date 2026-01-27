'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Zap } from 'lucide-react';
import { TransactionModal } from '@/components/wallet/TransactionModal';
import type { TxStatus } from '@/components/wallet/TransactionModal';
import { getProduct, type Product } from '@/lib/api/products';
import { createOrder } from '@/lib/api/orders';
import { useWallet } from '@/contexts/WalletContext';
import { getUsdtAddress, getUsdtDecimals, HERO_TOKEN } from '@/lib/wallet/tokens';
import { sendTokenTransfer, toRawAmount } from '@/lib/wallet/transfer';
import { PAYMENT_RECEIVER_ADDRESS } from '@/lib/constants';
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.id as string) ?? '';
  const { isConnected, address, chainId } = useWallet();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<'usdt' | 'hero' | null>(null);
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
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      setError('ID không hợp lệ');
      return;
    }
    setLoading(true);
    setError(null);
    getProduct(slug)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : 'Không tải được sản phẩm'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBuyUsdt = useCallback(async () => {
    if (!product || !isConnected || !address) {
      alert('Vui lòng kết nối ví.');
      return;
    }
    if (!PAYMENT_RECEIVER_ADDRESS) {
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
    setBuying('usdt');
    setTxModal({
      open: true,
      status: 'confirming',
      amountDisplay,
      tokenLabel: 'USDT',
      productTitle: product.title,
      onConfirmTransfer: async () => {
        try {
          const raw = toRawAmount(priceUsdt, getUsdtDecimals(chainId));
          const txHash = await sendTokenTransfer(
            ethereum,
            address,
            usdtAddress,
            PAYMENT_RECEIVER_ADDRESS,
            raw,
          );
          setTxModal((m) => ({ ...m, status: 'pending', txHash }));
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
  }, [product, isConnected, address, chainId]);

  const handleBuyHero = useCallback(async () => {
    if (!product || !isConnected || !address) {
      alert('Vui lòng kết nối ví.');
      return;
    }
    if (!PAYMENT_RECEIVER_ADDRESS) {
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
    setBuying('hero');
    setTxModal({
      open: true,
      status: 'confirming',
      amountDisplay,
      tokenLabel: 'HERO',
      productTitle: product.title,
      onConfirmTransfer: async () => {
        try {
          const raw = toRawAmount(priceHero, 18);
          const txHash = await sendTokenTransfer(
            ethereum,
            address,
            HERO_TOKEN.address,
            PAYMENT_RECEIVER_ADDRESS,
            raw,
          );
          setTxModal((m) => ({ ...m, status: 'pending', txHash }));
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
  }, [product, isConnected, address]);

  if (loading) {
    return (
      <div className="min-h-[40vh] bg-white px-4 py-6">
        <p className="text-slate-500">Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[40vh] bg-white px-4 py-6">
        <p className="text-red-600">{error ?? 'Không tìm thấy sản phẩm'}</p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
        >
          <ArrowLeft className="size-4" />
          Quay lại Explore
        </Link>
      </div>
    );
  }

  const priceUsdt = product.priceUsdt ?? '0';
  const priceHero = product.priceHero ?? '0';
  const hasUsdt = parseFloat(priceUsdt) > 0;
  const hasHero = parseFloat(priceHero) > 0;
  const displayUsdt = formatPriceDisplay(priceUsdt);
  const displayHero = formatPriceDisplay(priceHero);

  return (
    <div className="min-h-[40vh] bg-white pb-10">
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
        onClose={() => setTxModal((m) => ({ ...m, open: false, onConfirmTransfer: undefined }))}
      />
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
          aria-label="Quay lại"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 truncate text-base font-bold text-slate-900">
          Chi tiết sản phẩm
        </h1>
      </div>

      <div className="px-4 pt-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.imageUrl})` }}
          />
          {product.live && (
            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 shadow">
              <Zap className="size-4 text-red-500" />
              <span className="text-xs font-bold uppercase text-slate-900">Live</span>
            </div>
          )}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">{product.title}</h2>

        <div className="mt-3 flex items-center gap-2">
          {product.creatorAvatarUrl ? (
            <div
              className="size-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${product.creatorAvatarUrl})` }}
            />
          ) : (
            <div className="size-8 shrink-0 rounded-full border border-slate-200 bg-slate-100" />
          )}
          <span className="text-sm font-medium text-slate-600">
            @{product.creatorHandle}
          </span>
        </div>

        {product.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">
            {product.description}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Giá
          </p>
          <div className="flex flex-wrap gap-3">
            {hasUsdt && (
              <span className="rounded-xl bg-emerald-600 px-4 py-2 text-base font-bold text-white">
                {displayUsdt} USDT
              </span>
            )}
            {hasHero && (
              <span className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-base font-bold text-white">
                {displayHero} HERO
              </span>
            )}
            {!hasUsdt && !hasHero && (
              <span className="text-slate-400">Chưa có giá</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {hasUsdt && (
            <button
              type="button"
              onClick={handleBuyUsdt}
              disabled={buying !== null}
              className="w-full rounded-xl bg-emerald-600 py-4 text-base font-bold text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
            >
              {buying === 'usdt' ? 'Đang xử lý...' : `Mua bằng USDT (${displayUsdt} USDT)`}
            </button>
          )}
          {hasHero && (
            <button
              type="button"
              onClick={handleBuyHero}
              disabled={buying !== null}
              className="w-full rounded-xl bg-[var(--color-primary)] py-4 text-base font-bold text-white transition-opacity hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {buying === 'hero' ? 'Đang xử lý...' : `Mua bằng HERO (${displayHero} HERO)`}
            </button>
          )}
          {(!hasUsdt || !hasHero) && (
            <Link
              href="/explore"
              className="block rounded-xl border border-slate-200 py-3 text-center text-sm font-medium text-slate-600"
            >
              Xem thêm sản phẩm
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

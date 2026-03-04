'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BadgeCheck, Heart, Wallet, Zap } from 'lucide-react';
import { TransactionModal } from '@/components/wallet/TransactionModal';
import type { TxStatus } from '@/components/wallet/TransactionModal';
import { getProduct, type Product } from '@/lib/api/products';
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.id as string) ?? '';
  const { isConnected, address, chainId } = useWallet();
  const { tokenSymbol, paymentReceiverAddress } = useConfig();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<'usdt' | 'hero' | null>(null);
  const [favorited, setFavorited] = useState(false);
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
      .catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải sản phẩm'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBuyUsdt = useCallback(async () => {
    if (!product || !isConnected || !address) {
      alert('Vui lòng kết nối ví.');
      return;
    }
    if (!paymentReceiverAddress) {
      alert('Thanh toán chưa được cấu hình.');
      return;
    }
    const ethereum = getEthereum();
    if (!ethereum) {
      alert('Không tìm thấy ví.');
      return;
    }
    const usdtAddress = getUsdtAddress(chainId);
    if (!usdtAddress) {
      alert('Mạng này không hỗ trợ USDT. Vui lòng chuyển sang BSC (BEP20).');
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
          await checkBalance(ethereum, address, usdtAddress, raw, { tokenLabel: 'USDT', decimals: getUsdtDecimals(chainId) });
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
  }, [product, isConnected, address, chainId, paymentReceiverAddress]);

  const handleBuyHero = useCallback(async () => {
    if (!product || !isConnected || !address) {
      alert('Vui lòng kết nối ví.');
      return;
    }
    if (!paymentReceiverAddress) {
      alert('Thanh toán chưa được cấu hình.');
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
    const heroAddress = HERO_TOKEN.address;
    setBuying('hero');
    setTxModal({
      open: true,
      status: 'confirming',
      amountDisplay,
      tokenLabel: tokenSymbol,
      productTitle: product.title,
      onConfirmTransfer: async () => {
        try {
          const raw = toRawAmount(priceHero, HERO_TOKEN.decimals);
          await checkBalance(ethereum, address, heroAddress, raw, { tokenLabel: tokenSymbol, decimals: HERO_TOKEN.decimals });
          const txHash = await sendTokenTransfer(
            ethereum,
            address,
            heroAddress,
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
  }, [product, isConnected, address, tokenSymbol, paymentReceiverAddress]);

  if (loading) {
    return (
      <div className="min-h-[40vh] bg-slate-100 dark:bg-[var(--color-background-dark)] px-4 py-6 pb-32">
        <p className="text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[40vh] bg-slate-100 dark:bg-[var(--color-background-dark)] px-4 py-6 pb-32">
        <p className="text-red-500">{error ?? 'Không tìm thấy sản phẩm'}</p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary-wallet)]"
        >
          Quay lại Khám phá
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
  const primaryPrice = hasUsdt ? `${displayUsdt} USDT` : hasHero ? `${displayHero} ${tokenSymbol}` : '—';
  const canBuy = hasUsdt || hasHero;

  return (
    <div className="bg-slate-100 dark:bg-[var(--color-background-dark)] min-h-full pb-32">
      <TransactionModal
        open={txModal.open}
        status={txModal.status}
        amountDisplay={txModal.amountDisplay}
        tokenLabel={txModal.tokenLabel}
        productTitle={txModal.productTitle}
        txHash={txModal.txHash}
        explorerTxUrl={txModal.txHash ? getExplorerTxUrl(chainId, txModal.txHash) : undefined}
        error={txModal.error}
        onConfirmTransfer={txModal.onConfirmTransfer}
        onClose={() => {
          setTxModal((m) => ({ ...m, open: false, onConfirmTransfer: undefined }));
          setBuying(null);
        }}
      />

      <main className="max-w-2xl mx-auto">
        {/* Hero image + overlay */}
        <div className="relative px-4 py-6">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800 relative shadow-2xl shadow-[var(--color-primary-wallet)]/10">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.live && (
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-black/40 backdrop-blur-md px-2.5 py-1.5 border border-white/10">
                <Zap className="size-4 text-yellow-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Trực tiếp</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 glass-card p-5 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold">Giá hiện tại</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{primaryPrice}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-8">
          {/* Title + creator + favorite */}
          <section className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="size-6 rounded-full bg-[var(--color-primary-wallet)]/20 overflow-hidden shrink-0">
                    {product.creatorAvatarUrl ? (
                      <img src={product.creatorAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-600" />
                    )}
                  </div>
                  <span className="text-[var(--color-primary-wallet)] font-medium text-sm">@{product.creatorHandle}</span>
                  <BadgeCheck className="size-4 text-[var(--color-primary-wallet)] shrink-0" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFavorited((v) => !v)}
                className="p-2 glass-card rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                aria-label={favorited ? 'Bỏ yêu thích' : 'Yêu thích'}
              >
                <Heart className={`size-5 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Mô tả</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {product.description || 'Chưa có mô tả.'}
              </p>
            </div>
          </section>

          {/* Properties */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Thuộc tính</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Độ hiếm</span>
                <span className="text-[var(--color-primary-wallet)] font-bold">{product.live ? 'Trực tiếp' : 'Chuẩn'}</span>
              </div>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Danh mục</span>
                <span className="text-[var(--color-primary-wallet)] font-bold">{product.category || '—'}</span>
              </div>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Token</span>
                <span className="text-[var(--color-primary-wallet)] font-bold">{tokenSymbol}</span>
              </div>
              <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tồn kho</span>
                <span className="text-[var(--color-primary-wallet)] font-bold">{product.stock ?? '—'}</span>
              </div>
            </div>
          </section>

          {/* History placeholder */}
          <section className="space-y-4 pb-12">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lịch sử</h3>
            <div className="space-y-3">
              <div className="glass-card p-4 rounded-xl text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có hoạt động.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Fixed vertical buy buttons */}
      {canBuy && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-2xl mx-auto flex flex-col gap-2">
          {hasUsdt && (
            <button
              type="button"
              onClick={handleBuyUsdt}
              disabled={buying !== null}
              className="w-full h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 bg-emerald-600 hover:bg-emerald-500 transition-colors border border-emerald-500/30 shadow-xl disabled:cursor-not-allowed"
            >
              <Wallet className="size-5" />
              {buying === 'usdt' ? 'Đang xử lý...' : `Mua bằng USDT (${displayUsdt})`}
            </button>
          )}
          {hasHero && (
            <button
              type="button"
              onClick={handleBuyHero}
              disabled={buying !== null}
              className="w-full h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 bg-[var(--color-primary-wallet)] hover:opacity-90 transition-opacity border border-[var(--color-primary-wallet)]/50 shadow-xl disabled:cursor-not-allowed"
            >
              <Zap className="size-5" />
              {buying === 'hero' ? 'Đang xử lý...' : `Mua bằng ${tokenSymbol} (${displayHero})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

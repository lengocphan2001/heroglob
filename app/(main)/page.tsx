'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TrendingUp, Zap } from 'lucide-react';
import { SearchInput } from '@/components/ui';
import {
  HeroBanner,
  SectionTitle,
  CollectionCard,
  AuctionCard,
} from '@/components/sections';
import { HERO_IMAGE } from '@/lib/data/home';
import { getProducts, type Product } from '@/lib/api/products';
import { formatPriceDisplay } from '@/lib/formatPrice';
import { useWallet } from '@/contexts/WalletContext';
import { getUsdtAddress, getUsdtDecimals } from '@/lib/wallet/tokens';
import { sendTokenTransfer, toRawAmount, waitForTransaction, checkBalance } from '@/lib/wallet/transfer';
import { PAYMENT_RECEIVER_ADDRESS } from '@/lib/constants';
import { createOrder } from '@/lib/api/orders';
import { TransactionModal } from '@/components/wallet/TransactionModal';
import { ReferralSection } from '@/components/referral/ReferralSection';

function PowerActivation() {
  const { isConnected, address, chainId } = useWallet();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [txModal, setTxModal] = useState<{
    open: boolean;
    status: 'confirming' | 'pending' | 'success' | 'error';
    amountDisplay?: string;
    tokenLabel?: string;
    productTitle?: string;
    txHash?: string;
    error?: string;
  }>({ open: false, status: 'confirming' });

  // Fetch Balance
  useEffect(() => {
    if (!isConnected || !address || !chainId) return;
    const fetchBalance = async () => {
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;
      const usdtAddr = getUsdtAddress(chainId);
      if (!usdtAddr) return;

      try {
        // Raw balance call
        const data = '0x70a08231' + address.slice(2).padStart(64, '0');
        const hex = await ethereum.request({ method: 'eth_call', params: [{ to: usdtAddr, data }, 'latest'] }) as string;
        const bal = BigInt(hex);
        const decimals = getUsdtDecimals(chainId); // usually 18 for BSC
        // Simple format
        const divisor = BigInt(10) ** BigInt(decimals);
        const intPart = bal / divisor;
        const fracPart = (bal % divisor).toString().padStart(decimals, '0').slice(0, 2);
        setBalance(`${intPart}.${fracPart}`);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBalance();
    const i = setInterval(fetchBalance, 10000);
    return () => clearInterval(i);
  }, [isConnected, address, chainId]);

  const [config, setConfig] = useState<{ min: number; profit: string }>({ min: 10, profit: '1' });

  useEffect(() => {
    // Fetch dynamic config
    fetch(process.env.NEXT_PUBLIC_API_URL + '/system-config')
      .then(res => res.json())
      .then((data: Array<{ key: string; value: string }>) => {
        const minConfig = data.find(c => c.key === 'INVESTMENT_MIN_USDT');
        const profitConfig = data.find(c => c.key === 'INVESTMENT_PROFIT_PERCENT');
        setConfig({
          min: minConfig ? parseFloat(minConfig.value) : 10,
          profit: profitConfig ? profitConfig.value : '1'
        });
      })
      .catch(console.error);
  }, []);

  const handleActivate = async () => {
    if (!isConnected) return alert("Vui lòng kết nối ví!");
    if (!amount) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val < config.min) return alert(`Tối thiểu ${config.min} USDT`);

    const ethereum = (window as any).ethereum;
    const usdtAddress = getUsdtAddress(chainId);
    if (!usdtAddress) return alert("Mạng không hỗ trợ USDT");
    if (!PAYMENT_RECEIVER_ADDRESS) return alert("Lỗi cấu hình ví nhận");

    setTxModal({
      open: true,
      status: 'confirming',
      amountDisplay: val.toString(),
      tokenLabel: 'USDT',
      productTitle: 'Kích hoạt Sức Mạnh'
    });

    try {
      const raw = toRawAmount(amount, getUsdtDecimals(chainId));

      await checkBalance(ethereum, address!, usdtAddress, raw);

      setTxModal(prev => ({ ...prev, status: 'pending' })); // Pending user sign

      const txHash = await sendTokenTransfer(
        ethereum,
        address!,
        usdtAddress,
        PAYMENT_RECEIVER_ADDRESS,
        raw
      );

      setTxModal(prev => ({ ...prev, status: 'pending', txHash })); // Pending mining

      await waitForTransaction(ethereum, txHash);

      await createOrder({
        walletAddress: address!,
        tokenType: 'usdt',
        amount: amount,
        txHash,
        // No productId
      });

      setTxModal(prev => ({ ...prev, status: 'success' }));
      setAmount('');
    } catch (e: any) {
      setTxModal(prev => ({
        ...prev,
        status: 'error',
        error: e.message || "Giao dịch thất bại"
      }));
    }
  };

  return (
    <>
      <TransactionModal
        open={txModal.open}
        status={txModal.status}
        amountDisplay={txModal.amountDisplay ?? ''}
        tokenLabel={txModal.tokenLabel ?? ''}
        productTitle={txModal.productTitle}
        txHash={txModal.txHash}
        error={txModal.error}
        onClose={() => setTxModal(p => ({ ...p, open: false }))}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center">
          <h3 className="flex items-center justify-center gap-2 text-lg font-bold uppercase text-slate-800">
            <Zap className="h-5 w-5 fill-yellow-400 text-yellow-500" />
            Kích hoạt Sức Mạnh
          </h3>
        </div>

        <p className="mb-3 text-xs text-slate-500 text-center">
          Tối thiểu {config.min} USDT. Lợi nhuận hàng ngày {config.profit}%
        </p>

        <div className="relative mb-2">
          <input
            type="number"
            placeholder="Nhập số tiền"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:border-[var(--color-primary)] focus:outline-none"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            USDT
          </div>
        </div>

        <div className="mb-4 text-xs font-medium text-slate-500">
          Số dư ví: <span className="text-slate-900">{balance} USDT</span>
        </div>

        <button
          onClick={handleActivate}
          disabled={!amount}
          className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Kích hoạt ngay
        </button>
      </div>
    </>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const trending = products.slice(0, 6);
  const liveOrFeatured = products.filter((p) => p.live).length > 0
    ? products.filter((p) => p.live).slice(0, 4)
    : products.slice(0, 4);

  const floorValue = (p: Product) => {
    const usdt = parseFloat(p.priceUsdt ?? '0');
    const hero = parseFloat(p.priceHero ?? '0');
    if (usdt > 0) return `${formatPriceDisplay(p.priceUsdt)} USDT`;
    if (hero > 0) return `${formatPriceDisplay(p.priceHero)} HERO`;
    return '—';
  };

  return (
    <>
      <div className="px-4 py-5">
        <SearchInput
          placeholder="Tìm kiếm Metaverse & NFTs"
          value={search}
          onChange={setSearch}
          onFilterClick={() => { }}
        />
      </div>

      <div className="px-4 pb-8">
        <HeroBanner
          imageUrl={HERO_IMAGE}
          badge="Đang diễn ra"
          title={
            <>
              Khám phá <br /> Neon Sector
            </>
          }
          description="Khám phá các bộ sưu tập và vật phẩm độc đáo."
          ctaLabel="Xem ngay"
          ctaHref="/explore"
        />
      </div>

      <div className="px-4 pb-0 mb-6">
        <PowerActivation />
      </div>

      <div className="px-4 pb-0 mb-6">
        <ReferralSection />
      </div>

      <section>
        <SectionTitle
          title="Bộ sưu tập nổi bật"
          viewAllHref="/explore"
          viewAllLabel="Xem tất cả"
          icon={<TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />}
        />
        {loading ? (
          <div className="px-4 pb-6 text-sm text-slate-500">Loading...</div>
        ) : error ? (
          <div className="px-4 pb-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="hide-scrollbar flex gap-5 overflow-x-auto px-4 pb-6">
            {trending.length === 0 ? (
              <p className="px-4 text-sm text-slate-500">Chưa có sản phẩm nào.</p>
            ) : (
              trending.map((p) => (
                <CollectionCard
                  key={p.id}
                  href={`/nft/${p.hashId ?? p.id}`}
                  imageUrl={p.imageUrl}
                  avatarUrl={p.creatorAvatarUrl ?? undefined}
                  title={p.title}
                  floorValue={floorValue(p)}
                />
              ))
            )}
          </div>
        )}
      </section>


    </>
  );
}

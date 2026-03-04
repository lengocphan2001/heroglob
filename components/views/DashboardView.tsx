'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActivePowerCard } from '@/components/sections/wallet';
import { ReferralSection } from '@/components/referral/ReferralSection';
import { useConfig } from '@/contexts/ConfigContext';
import { getProducts, type Product } from '@/lib/api/products';
import { formatPriceDisplay } from '@/lib/formatPrice';

/* ─────────────────────────────── helpers ─────────────────────────────── */
const FEATURED_AUCTION = {
    title: 'Cosmic Resonance #42',
    currentBid: '4.50 ETH',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqHpxoWY8uRqYH4cCTgvZHWYvB87Y3dlV2-4ojnn1VzB9qICxL8-P69ewXOQByedqfyzAosn-02oD8t4AfiIkGmY36IA0-bvuh81S9xkmZqMEWJ1e9JrI6xhucaVAopoVT0hqwRDtYype_Fxnk3PnyGbdq8laAuiUHJwoWWCjapRwNgfu1oWSxVTXIOlD_LpOAcB3al539vk2_IhjQ70--TQPqg--4Q4oeo5_VigiFg54QVDsYjh9hDfC3XiF6PdJ4a_KyGE1McXU',
};

/* ───────────────────────────── component ────────────────────────────── */
export default function DashboardView() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getProducts()
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const trending = products.slice(0, 6);

    const { tokenSymbol } = useConfig();
    const floorValue = (p: Product) => {
        const usdt = parseFloat(p.priceUsdt ?? '0');
        const hero = parseFloat(p.priceHero ?? '0');
        if (usdt > 0) return `${formatPriceDisplay(p.priceUsdt)} USDT`;
        if (hero > 0) return `${formatPriceDisplay(p.priceHero)} ${tokenSymbol}`;
        return '—';
    };

    return (
        <div className="flex flex-col gap-0">
            {/* ── Featured Live Auction ── */}
            <section className="p-4 pt-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
                    {/* mesh glow */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                            background:
                                'radial-gradient(at 0% 0%, #330df2 0%, transparent 50%), radial-gradient(at 100% 0%, #7000ff 0%, transparent 50%), radial-gradient(at 100% 100%, #330df2 0%, transparent 50%), radial-gradient(at 0% 100%, #00d4ff 0%, transparent 50%)',
                        }}
                    />
                    <div className="relative z-10 p-4">
                        {/* Image */}
                        <div className="relative mb-4 w-full overflow-hidden rounded-xl bg-slate-800" style={{ aspectRatio: '1/1' }}>
                            <img
                                src={FEATURED_AUCTION.imageUrl}
                                alt="NFT đấu giá nổi bật"
                                className="h-full w-full object-cover"
                            />
                            {/* Live badge */}
                            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                ĐANG ĐẤU GIÁ
                            </div>
                        </div>

                        {/* Info row */}
                        <h2 className="mb-3 font-display text-xl font-bold text-slate-100">
                            {FEATURED_AUCTION.title}
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-400">Current Bid</p>
                                <p className="text-lg font-bold" style={{ color: '#330df2' }}>
                                    {FEATURED_AUCTION.currentBid}
                                </p>
                            </div>
                            <Link
                                href="/explore"
                                className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90"
                                style={{
                                    background: '#330df2',
                                    boxShadow: '0 8px 24px rgba(51,13,242,0.35)',
                                }}
                            >
                                Đặt giá
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Referral Section ── */}
            <div className="px-4 pb-4">
                <ReferralSection />
            </div>

            {/* ── Trending Drops ── */}
            <section className="py-2">
                <div className="mb-3 flex items-end justify-between px-4">
                    <h3 className="font-display text-lg font-bold text-slate-100">Sản phẩm nổi bật</h3>
                    <Link href="/explore" className="text-sm font-medium" style={{ color: '#330df2' }}>
                        Xem tất cả
                    </Link>
                </div>

                <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex w-[120px] shrink-0 flex-col gap-2">
                                <div className="h-[120px] w-[120px] animate-pulse rounded-xl bg-white/10" />
                                <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
                            </div>
                        ))
                    ) : trending.length === 0 ? (
                        <p className="text-sm text-slate-500">Chưa có sản phẩm nào.</p>
                    ) : (
                        trending.map((p) => (
                            <Link
                                key={p.id}
                                href={`/nft/${p.hashId ?? p.id}`}
                                className="flex w-[120px] shrink-0 flex-col gap-2"
                            >
                                <div
                                    className="h-[120px] w-[120px] overflow-hidden rounded-xl border border-white/10 bg-slate-800"
                                >
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.title}
                                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-slate-700" />
                                    )}
                                </div>
                                <p className="truncate text-xs font-bold text-slate-100">{p.title}</p>
                                <p className="truncate text-[11px] font-medium" style={{ color: '#330df2' }}>
                                    {floorValue(p)}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* ── Subscription Packages (Active Power) ── */}
            <section className="p-4 pt-4">
                <h3 className="mb-4 font-display text-lg font-bold text-slate-100">
                    Gói đăng ký
                </h3>
                <ActivePowerCard />
            </section>
        </div>
    );
}

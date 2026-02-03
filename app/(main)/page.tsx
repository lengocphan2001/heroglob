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
import { ReferralSection } from '@/components/referral/ReferralSection';
import { ActivePowerCard } from '@/components/sections/wallet';

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
      .catch((e) => setError(e instanceof Error ? e.message : 'Không thể tải'))
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
        <ActivePowerCard />
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
          <div className="px-4 pb-6 text-sm text-slate-500">Đang tải...</div>
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

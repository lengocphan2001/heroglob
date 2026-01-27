'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
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
          placeholder="Search Metaverse & NFTs"
          value={search}
          onChange={setSearch}
          onFilterClick={() => {}}
        />
      </div>

      <div className="px-4 pb-8">
        <HeroBanner
          imageUrl={HERO_IMAGE}
          badge="Live Now"
          title={
            <>
              Explore the <br /> Neon Sector
            </>
          }
          description="Discover drops and collectibles."
          ctaLabel="Enter"
          ctaHref="/explore"
        />
      </div>

      <section>
        <SectionTitle
          title="Trending Collections"
          viewAllHref="/explore"
          viewAllLabel="View All"
          icon={<TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />}
        />
        {loading ? (
          <div className="px-4 pb-6 text-sm text-slate-500">Loading...</div>
        ) : error ? (
          <div className="px-4 pb-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="hide-scrollbar flex gap-5 overflow-x-auto px-4 pb-6">
            {trending.length === 0 ? (
              <p className="px-4 text-sm text-slate-500">No products yet.</p>
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

      <section className="mt-4 px-4">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            Live Auctions
            <span className="relative flex h-3 w-3" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
            </span>
          </h3>
          <Link href="/explore" className="text-sm font-medium text-[var(--color-primary)]">
            View All
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="space-y-4">
            {liveOrFeatured.length === 0 ? (
              <p className="text-sm text-slate-500">No items yet.</p>
            ) : (
              liveOrFeatured.map((p) => (
                <AuctionCard
                  key={p.id}
                  imageUrl={p.imageUrl}
                  title={p.title}
                  timeLeft="—"
                  highestBidValue={floorValue(p)}
                  onBid={() => {}}
                />
              ))
            )}
          </div>
        )}
      </section>
    </>
  );
}

'use client';

import Link from 'next/link';
import { ShoppingBag, Zap } from 'lucide-react';
import type { Product } from '@/lib/api/products';
import { formatPriceDisplay } from '@/lib/formatPrice';

export type ExploreProductCardProps = {
  product: Product;
  onBuyUsdt?: (product: Product) => void;
  isBuying?: 'usdt' | null;
};

export function ExploreProductCard({
  product,
  onBuyUsdt,
  isBuying = null,
}: ExploreProductCardProps) {
  const priceUsdt = product.priceUsdt ?? '0';
  const hasUsdt = parseFloat(priceUsdt) > 0;
  const displayUsdt = formatPriceDisplay(priceUsdt);
  const primaryPrice = hasUsdt ? `${displayUsdt} USDT` : '—';

  const handleBagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUsdt && onBuyUsdt) onBuyUsdt(product);
  };

  return (
    <Link
      href={`/nft/${product.hashId ?? product.id}`}
      className="glass-card rounded-xl overflow-hidden flex flex-col group"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.live && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
            <Zap className="size-3.5 text-yellow-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
          @{product.creatorHandle}
        </p>
        <h3 className="font-bold text-sm truncate mb-3 text-slate-900 dark:text-slate-100">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">
              Price
            </span>
            <span className="text-sm font-bold text-[var(--color-primary-wallet)]">
              {primaryPrice}
            </span>
          </div>
          <button
            type="button"
            onClick={handleBagClick}
            disabled={isBuying !== null}
            className="size-8 rounded-lg bg-[var(--color-primary-wallet)]/20 border border-[var(--color-primary-wallet)]/30 flex items-center justify-center text-[var(--color-primary-wallet)] hover:bg-[var(--color-primary-wallet)] hover:text-white transition-colors disabled:opacity-50"
            aria-label="Mua"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

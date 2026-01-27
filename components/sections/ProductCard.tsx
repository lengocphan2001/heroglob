'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import type { Product } from '@/lib/api/products';
import { formatPriceDisplay } from '@/lib/formatPrice';

export type ProductCardProps = {
  product: Product;
  onBuyUsdt?: (product: Product) => void;
  onBuyHero?: (product: Product) => void;
  isBuying?: 'usdt' | 'hero' | null;
};

export function ProductCard({
  product,
  onBuyUsdt,
  onBuyHero,
  isBuying = null,
}: ProductCardProps) {
  const priceUsdt = product.priceUsdt ?? '0';
  const priceHero = product.priceHero ?? '0';
  const hasUsdt = parseFloat(priceUsdt) > 0;
  const hasHero = parseFloat(priceHero) > 0;
  const displayUsdt = formatPriceDisplay(priceUsdt);
  const displayHero = formatPriceDisplay(priceHero);

  const content = (
    <>
      <div className="relative aspect-square">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${product.imageUrl})` }}
          aria-hidden
        />
        {product.live && (
          <div className="absolute left-2 top-2 flex gap-1">
            <span className="flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow-sm backdrop-blur-md">
              <Zap className="size-3.5 text-red-500" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-tight text-slate-900">
                Live
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="truncate text-[14px] font-bold text-slate-900">{product.title}</h4>
        <div className="mt-2 flex items-center gap-1.5">
          {product.creatorAvatarUrl ? (
            <div
              className="size-4 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${product.creatorAvatarUrl})` }}
              aria-hidden
            />
          ) : (
            <div className="size-4 shrink-0 rounded-full border border-slate-200 bg-slate-100" />
          )}
          <span className="truncate text-[10px] font-medium text-slate-500">
            @{product.creatorHandle}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {hasUsdt && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
              {displayUsdt} USDT
            </span>
          )}
          {hasHero && (
            <span className="rounded-md bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
              {displayHero} HERO
            </span>
          )}
          {!hasUsdt && !hasHero && (
            <span className="text-[10px] text-slate-400">—</span>
          )}
        </div>
        {(hasUsdt || hasHero) && (onBuyUsdt || onBuyHero) && (
          <div className="mt-2 flex gap-1.5" onClick={(e) => e.preventDefault()}>
            {hasUsdt && onBuyUsdt && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBuyUsdt(product);
                }}
                disabled={isBuying !== null}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-[11px] font-bold text-white transition-opacity hover:bg-emerald-700 disabled:opacity-50"
              >
                {isBuying === 'usdt' ? '...' : 'Buy USDT'}
              </button>
            )}
            {hasHero && onBuyHero && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBuyHero(product);
                }}
                disabled={isBuying !== null}
                className="flex-1 rounded-lg bg-[var(--color-primary)] py-2 text-[11px] font-bold text-white transition-opacity hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {isBuying === 'hero' ? '...' : 'Buy HERO'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="nft-card group">
      <Link href={`/nft/${product.hashId ?? product.id}`}>{content}</Link>
    </div>
  );
}

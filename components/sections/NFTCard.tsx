import Link from 'next/link';
import { Zap } from 'lucide-react';

export type NFTCardProps = {
  href?: string;
  imageUrl: string;
  title: string;
  creatorAvatarUrl?: string;
  creatorHandle: string;
  price: string;
  priceVariant?: 'primary' | 'dark';
  live?: boolean;
};

export function NFTCard({
  href = '#',
  imageUrl,
  title,
  creatorAvatarUrl,
  creatorHandle,
  price,
  priceVariant = 'dark',
  live = false,
}: NFTCardProps) {
  const content = (
    <>
      <div className="relative aspect-square">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden
        />
        {live && (
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
        <h4 className="truncate text-[14px] font-bold text-slate-900">{title}</h4>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {creatorAvatarUrl ? (
              <div
                className="size-4 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 bg-cover bg-center"
                style={{ backgroundImage: `url(${creatorAvatarUrl})` }}
                aria-hidden
              />
            ) : (
              <div className="size-4 shrink-0 rounded-full border border-slate-200 bg-slate-100" />
            )}
            <span className="truncate text-[10px] font-medium text-slate-500">
              @{creatorHandle}
            </span>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-bold text-white ${
              priceVariant === 'primary'
                ? 'bg-[var(--color-primary)]'
                : 'bg-[var(--color-accent-dark)]'
            }`}
          >
            {price}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <div className="nft-card group">
      {href ? <Link href={href}>{content}</Link> : content}
    </div>
  );
}

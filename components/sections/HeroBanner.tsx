import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui';

export type HeroBannerProps = {
  imageUrl: string;
  badge?: string;
  title: React.ReactNode;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  stats?: string;
};

export function HeroBanner({
  imageUrl,
  badge = 'Live Now',
  title,
  description = 'Join 12.4k explorers in the newest district.',
  ctaLabel = 'Enter',
  ctaHref = '#',
  stats,
}: HeroBannerProps) {
  return (
    <div className="group relative h-80 w-full overflow-hidden rounded-3xl soft-shadow">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent), url(${imageUrl})`,
        }}
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 w-full p-8">
        {badge && (
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="live">{badge}</Badge>
          </div>
        )}
        <h2 className="mb-3 text-3xl font-bold leading-tight text-white">{title}</h2>
        <div className="flex items-center justify-between">
          <p className="max-w-[220px] text-sm text-white/80">{description}</p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-lg transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {stats && <p className="mt-2 text-xs text-white/60">{stats}</p>}
      </div>
    </div>
  );
}

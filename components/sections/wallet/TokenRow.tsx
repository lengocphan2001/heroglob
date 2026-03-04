import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export type TokenRowProps = {
  href?: string;
  iconUrl: string;
  name: string;
  symbol: string;
  networkLabel?: string;
  amount: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  onWithdraw?: () => void;
};

const changeColors = {
  positive: { color: '#34d399' },
  negative: { color: '#f87171' },
  neutral: { color: '#64748b' },
};

export function TokenRow({
  href = '#',
  iconUrl,
  name,
  symbol,
  networkLabel,
  amount,
  change,
  changeType = 'neutral',
  onWithdraw,
}: TokenRowProps) {
  const symbolLine = networkLabel ? `${symbol} · ${networkLabel}` : symbol;

  const content = (
    <>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <img
            src={iconUrl}
            alt={`${symbol} icon`}
            className="size-8 object-cover"
            onError={(e) => { e.currentTarget.src = '/file.svg'; }}
          />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{name}</p>
          <p className="text-xs text-slate-500">{symbolLine}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-bold text-slate-900 dark:text-slate-100">{amount}</p>
          {change != null && (
            <p className="text-[10px] font-bold" style={changeColors[changeType]}>
              {change}
            </p>
          )}
        </div>
        {onWithdraw && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWithdraw();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-primary-wallet)]/30 bg-[var(--color-primary-wallet)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>Rút</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </>
  );

  const rowClass =
    'flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all bg-slate-100 dark:bg-[var(--color-surface-dark)] border-transparent dark:border-[var(--color-border-dark)] hover:border-[var(--color-primary-wallet)]/30';

  return href && !onWithdraw ? (
    <Link href={href} className={rowClass}>
      {content}
    </Link>
  ) : (
    <div className={rowClass}>{content}</div>
  );
}

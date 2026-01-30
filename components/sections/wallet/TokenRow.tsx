import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export type TokenRowProps = {
  href?: string;
  iconUrl: string;
  name: string;
  symbol: string;
  /** Nhãn mạng, vd: BEP20, ERC20 */
  networkLabel?: string;
  amount: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  onWithdraw?: () => void;
};

const changeClass = {
  positive: 'text-emerald-600',
  negative: 'text-rose-500',
  neutral: 'text-slate-400',
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
  const symbolLine = networkLabel ? `${symbol} (${networkLabel})` : symbol;
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 p-1">
          <img
            src={iconUrl}
            alt={`${symbol} icon`}
            className="size-full object-cover"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              e.currentTarget.src = '/file.svg';
            }}
          />
        </div>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-xs font-medium text-slate-400">{symbolLine}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-bold text-slate-900">{amount}</p>
          {change != null && (
            <p className={`text-[10px] font-bold ${changeClass[changeType]}`}>{change}</p>
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
            className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Rút
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </>
  );

  const className =
    'flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-[var(--color-primary)]/20';

  return href && !onWithdraw ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

import Link from 'next/link';

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
}: TokenRowProps) {
  const symbolLine = networkLabel ? `${symbol} (${networkLabel})` : symbol;
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50 p-1">
          <div
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${iconUrl})` }}
            aria-hidden
          />
        </div>
        <div>
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-xs font-medium text-slate-400">{symbolLine}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-slate-900">{amount}</p>
        {change != null && (
          <p className={`text-[10px] font-bold ${changeClass[changeType]}`}>{change}</p>
        )}
      </div>
    </>
  );

  const className =
    'flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-[var(--color-primary)]/20';

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

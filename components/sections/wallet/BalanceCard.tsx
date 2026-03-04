import { Eye } from 'lucide-react';

export type BalanceCardProps = {
  totalUsd: string;
  totalCrypto?: string;
  changePercent?: string;
  tokenSymbols?: string[];
};

export function BalanceCard({
  totalUsd,
  totalCrypto,
  changePercent = '—',
  tokenSymbols = ['USDT', 'TOKEN'],
}: BalanceCardProps) {
  const isPositive = changePercent !== '—' && changePercent.startsWith('+');
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 shadow-2xl border border-white/10"
      style={{
        backgroundColor: 'var(--color-primary-wallet)',
        backgroundImage: `
          radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
          radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
          radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
          radial-gradient(at 0% 50%, hsla(260,82%,50%,1) 0, transparent 50%),
          radial-gradient(at 100% 50%, hsla(262,82%,50%,1) 0, transparent 50%),
          radial-gradient(at 0% 100%, hsla(253,16%,7%,1) 0, transparent 50%),
          radial-gradient(at 50% 100%, hsla(225,39%,30%,1) 0, transparent 50%),
          radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)
        `,
      }}
    >
      <div className="absolute -bottom-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl" aria-hidden />
      <div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"
        aria-hidden
      />

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <p className="text-white/70 text-sm font-medium">Ví chính</p>
          <button type="button" className="text-white/50 hover:text-white/70 transition-colors" aria-label="Toggle visibility">
            <Eye className="size-5" />
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-white tracking-tight">{totalUsd}</h3>
          {changePercent !== '—' && (
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded-lg ${isPositive ? 'text-emerald-400 bg-emerald-400/20' : 'text-red-400 bg-red-400/20'}`}
            >
              {changePercent}
            </span>
          )}
        </div>
        {totalCrypto != null && (
          <p className="mt-1 text-sm text-white/70">≈ {totalCrypto}</p>
        )}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex -space-x-2">
            {tokenSymbols.map((t) => (
              <div
                key={t}
                className="size-8 rounded-full border-2 border-[var(--color-surface-dark)] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white"
              >
                {t.slice(0, 3)}
              </div>
            ))}
          </div>
          <p className="text-white/60 text-xs">Cập nhật: Vừa xong</p>
        </div>
      </div>
    </div>
  );
}

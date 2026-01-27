import { TrendingUp } from 'lucide-react';

export type BalanceCardProps = {
  totalUsd: string;
  totalCrypto: string;
  changePercent?: string;
};

export function BalanceCard({
  totalUsd,
  totalCrypto,
  changePercent = '+2.4%',
}: BalanceCardProps) {
  return (
    <div className="wallet-gradient-card relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-[var(--color-primary)]/30">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-black/10 blur-3xl" aria-hidden />
      <div className="relative z-10">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/70">
          Total Balance
        </p>
        <h1 className="mb-2 text-[40px] font-bold leading-none tracking-tight text-white">
          {totalUsd}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white/90">≈ {totalCrypto}</p>
          <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
            <TrendingUp className="size-3" aria-hidden />
            {changePercent}
          </span>
        </div>
      </div>
    </div>
  );
}

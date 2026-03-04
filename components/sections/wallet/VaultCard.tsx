import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';

type Props = {
  title?: string;
  subtitle?: string;
};

export function VaultCard({
  title,
  subtitle = 'Earn up to 12% APY on your idle assets.',
}: Props) {
  const { projectName } = useConfig();
  const displayTitle = title || `${projectName} Vault`;
  return (
    <div className="bg-gradient-to-r from-[var(--color-primary-wallet)]/20 to-[var(--color-primary-wallet)]/5 rounded-xl border border-[var(--color-primary-wallet)]/30 p-5 flex items-center gap-4">
      <div className="size-12 rounded-xl bg-[var(--color-primary-wallet)] flex items-center justify-center shrink-0">
        <Lock className="size-6 text-white" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[var(--color-primary-wallet)]">{displayTitle}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <Link
        href="/staking"
        className="bg-[var(--color-primary-wallet)] text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 transition-all shrink-0"
      >
        Stake
      </Link>
    </div>
  );
}

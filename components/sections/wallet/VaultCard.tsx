import { ShieldCheck } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';

type Props = {
  title?: string;
  subtitle?: string;
};

export function VaultCard({
  title,
  subtitle = 'Biometric protection active',
}: Props) {
  const { projectName } = useConfig();
  const displayTitle = title || `${projectName} Vault`;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
        <ShieldCheck className="size-5 text-[var(--color-primary)]" aria-hidden />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-900">{displayTitle}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

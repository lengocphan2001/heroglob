import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Plus } from 'lucide-react';

const actions = [
  { id: 'send', label: 'Chuyển', href: '/wallet/send', icon: ArrowUpRight },
  { id: 'receive', label: 'Nhận', href: '/wallet/receive', icon: ArrowDownLeft },
  { id: 'swap', label: 'Đổi', href: '/wallet/swap', icon: ArrowLeftRight },
  { id: 'buy', label: 'Mua', href: '/wallet/buy', icon: Plus },
];

export function ActionGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map(({ id, label, href, icon: Icon }) => (
        <div key={id} className="flex flex-col items-center gap-2">
          <Link
            href={href}
            className="size-14 rounded-2xl bg-[var(--color-primary-wallet)]/10 dark:bg-[var(--color-primary-wallet)]/20 border border-[var(--color-primary-wallet)]/20 dark:border-[var(--color-primary-wallet)]/40 flex items-center justify-center text-[var(--color-primary-wallet)] hover:bg-[var(--color-primary-wallet)] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-wallet)]/40"
            aria-label={label}
          >
            <Icon className="size-6" />
          </Link>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
      ))}
    </div>
  );
}

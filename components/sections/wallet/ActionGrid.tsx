import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Plus } from 'lucide-react';

const actions = [
  {
    id: 'send',
    label: 'Send',
    href: '/wallet/send',
    icon: ArrowUpRight,
    variant: 'primary' as const,
  },
  {
    id: 'receive',
    label: 'Receive',
    href: '/wallet/receive',
    icon: ArrowDownLeft,
    variant: 'purple' as const,
  },
  {
    id: 'swap',
    label: 'Swap',
    href: '/wallet/swap',
    icon: ArrowLeftRight,
    variant: 'outline' as const,
  },
  {
    id: 'buy',
    label: 'Buy',
    href: '/wallet/buy',
    icon: Plus,
    variant: 'outline' as const,
  },
];

const variantClass = {
  primary: 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20',
  purple: 'bg-purple-600 text-white shadow-lg shadow-purple-600/20',
  outline:
    'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50',
};

export function ActionGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {actions.map(({ id, label, href, icon: Icon, variant }) => (
        <div key={id} className="flex flex-col items-center gap-2">
          <Link
            href={href}
            className={`flex w-full aspect-square items-center justify-center rounded-2xl transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 ${variantClass[variant]}`}
            aria-label={label}
          >
            <Icon className="size-6" />
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

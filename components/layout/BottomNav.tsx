'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Zap, Wallet, User, type LucideProps } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
};

const defaultItems: NavItem[] = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/explore', label: 'Khám phá', icon: Compass },
  { href: '/active-power', label: 'Kích hoạt', icon: Zap },
  { href: '/wallet', label: 'Ví', icon: Wallet },
  { href: '/profile', label: 'Cá nhân', icon: User },
];

type Props = {
  items?: NavItem[];
};

export function BottomNav({ items = defaultItems }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="z-50 border-t border-slate-200 bg-white pt-3 pb-[env(safe-area-inset-bottom,20px)] w-full"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex w-full items-center justify-around px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 px-2 text-[11px] font-medium transition-colors ${isActive
                ? 'text-[var(--color-primary)] bg-transparent'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="h-6 w-6 shrink-0"
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

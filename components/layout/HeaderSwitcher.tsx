'use client';

import { usePathname } from 'next/navigation';
import { ExploreHeader } from './ExploreHeader';
import { SiteHeader } from './SiteHeader';
import { WalletHeader } from './WalletHeader';

export function HeaderSwitcher() {
  const pathname = usePathname();
  const isExplore = pathname === '/explore' || pathname.startsWith('/explore/');
  const isWallet = pathname === '/wallet' || pathname.startsWith('/wallet/');

  if (isExplore) return <ExploreHeader />;
  if (isWallet) return <WalletHeader />;
  return <SiteHeader />;
}

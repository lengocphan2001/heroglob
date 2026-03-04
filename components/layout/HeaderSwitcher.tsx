'use client';

import { SiteHeader } from './SiteHeader';

/** Same header as home on all pages: logo + project name + Connect. */
export function HeaderSwitcher() {
  return <SiteHeader logoHref="/home" />;
}


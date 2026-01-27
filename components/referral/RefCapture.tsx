'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { getStoredRefCode, setStoredRefCode, registerReferral } from '@/lib/api/referrals';

/** Lưu ?ref= vào localStorage khi load; gọi API register khi đã kết nối ví. */
export function RefCapture() {
  const searchParams = useSearchParams();
  const { address } = useWallet();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref?.trim()) setStoredRefCode(ref.trim());
  }, [searchParams]);

  useEffect(() => {
    if (!address) return;
    const refCode = getStoredRefCode();
    if (!refCode) return;
    registerReferral(address, refCode)
      .then(() => setStoredRefCode(null))
      .catch(() => {});
  }, [address]);

  return null;
}

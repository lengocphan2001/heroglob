import { api } from '../api';

export async function getReferralCode(walletAddress: string): Promise<{ code: string }> {
  return api<{ code: string }>('referrals/code', {
    params: { walletAddress },
  });
}

export async function registerReferral(walletAddress: string, refCode: string): Promise<{ ok: boolean; message?: string }> {
  return api<{ ok: boolean; message?: string }>('referrals/register', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, refCode }),
  });
}

export async function getReferralStats(walletAddress: string): Promise<{ totalReferred: number }> {
  return api<{ totalReferred: number }>('referrals/stats', {
    params: { walletAddress },
  });
}

const REF_STORAGE_KEY = 'heroglob_ref';

export function getStoredRefCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REF_STORAGE_KEY);
}

export function setStoredRefCode(code: string | null): void {
  if (typeof window === 'undefined') return;
  if (code) localStorage.setItem(REF_STORAGE_KEY, code);
  else localStorage.removeItem(REF_STORAGE_KEY);
}

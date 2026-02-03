'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function MainRoot() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');

    if (token) {
      // If authenticated, redirect to home
      router.replace('/home');
    } else {
      // If not authenticated, redirect to onboarding
      router.replace('/');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex h-full items-center justify-center bg-slate-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
    </div>
  );
}

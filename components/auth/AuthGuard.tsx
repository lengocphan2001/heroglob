'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useWallet } from '@/contexts/WalletContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isConnected, isInitializing } = useWallet();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Skip check while initializing wallet
        if (isInitializing) return;

        const token = Cookies.get('token');

        // If no token, they must go to onboarding (/) unless they are already there
        if (!token) {
            const isPublic = pathname === '/' || pathname === '/login' || pathname === '/register';
            if (!isPublic) {
                router.replace('/');
            }
            setIsAuthorized(false);
            return;
        }

        // If we have a token but wallet not connected? 
        // We probably should let WalletContext handle restoration.
        // But for "main" pages, we usually expect a connection.
        // However, some users might just have a token session.

        setIsAuthorized(true);
    }, [isInitializing, isConnected, pathname, router]);

    // Show nothing or a loader while determining auth state for protected routes
    if (isInitializing || (!isAuthorized && pathname !== '/' && pathname !== '/login' && pathname !== '/register')) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
                    <p className="text-sm text-slate-500 font-medium">Đang bảo mật kết nối...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

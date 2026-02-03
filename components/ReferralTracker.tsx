'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';

export function ReferralTracker() {
    const searchParams = useSearchParams();

    const config = useConfig();

    useEffect(() => {
        const referralCode = searchParams.get('ref');
        if (referralCode) {
            localStorage.setItem('referralCode', referralCode);
        }

        // Set page title from project name
        document.title = config.projectName;
    }, [searchParams, config.projectName]);

    return null;
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            localStorage.setItem('heroglob_ref', ref);
        }
    }, [searchParams]);

    return null;
}

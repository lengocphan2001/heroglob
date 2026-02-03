'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ActivePowerCard } from '@/components/sections/wallet';

export default function ActivePowerPage() {
    const router = useRouter();

    return (
        <div className="relative mx-auto flex max-w-md flex-col bg-white min-h-full">
            {/* Top App Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between">
                <button onClick={() => router.back()} className="text-slate-900 flex size-12 shrink-0 items-center">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">Năng Lượng Kích Hoạt</h2>
                <div className="w-12"></div>
            </div>

            <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100 bg-white pt-6">
                <div className="px-6 pb-6">
                    <ActivePowerCard />
                </div>
            </div>
        </div>
    );
}

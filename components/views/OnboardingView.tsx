'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Wallet, HelpCircle, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import Cookies from 'js-cookie';

export default function OnboardingView() {
    const router = useRouter();
    const { connect, isConnecting, isConnected, isInitializing } = useWallet();
    const { projectName, projectLogo } = useConfig();
    const isWorking = isInitializing || isConnecting;

    // Redirect to home if user becomes authenticated
    useEffect(() => {
        const token = Cookies.get('token');
        if (token && isConnected) {
            router.push('/home');
        }
    }, [isConnected, router]);

    const handleConnect = async () => {
        await connect();
    };

    if (isInitializing) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
                    <p className="text-sm text-slate-500 font-medium">Đang kiểm tra ví...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10">
                {/* Icon */}
                <div className="mb-10 relative">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6 duration-500 overflow-hidden">
                        {projectLogo ? (
                            <img src={projectLogo} alt={projectName} className="w-full h-full object-cover" />
                        ) : (
                            <ShoppingCart className="w-12 h-12 text-emerald-500" />
                        )}
                    </div>
                </div>

                {/* Typography */}
                <h1 className="text-3xl font-bold text-slate-800 mb-2 leading-tight">
                    Khám phá <br />
                    <span className="text-emerald-500">Metaverse & NFTs</span>
                </h1>

                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-12">
                    Tham gia hệ sinh thái {projectName} để sở hữu các tài sản số độc đáo và gia tăng thu nhập.
                </p>

                {/* Action */}
                <div className="w-full space-y-4 max-w-xs mx-auto">
                    <button
                        onClick={handleConnect}
                        disabled={isWorking}
                        className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        <div className="bg-slate-900/10 p-1.5 rounded-lg transition-colors group-hover:bg-slate-900/20">
                            <Wallet className="w-5 h-5 text-slate-900" />
                        </div>
                        {isWorking ? 'Đang xử lý...' : 'Kết nối Ví '}
                    </button>

                    <button className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium hover:text-emerald-600 transition-colors mx-auto">
                        SafePal là gì? <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="py-6 text-center z-10">
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    BẢO MẬT BỞI CÔNG NGHỆ WEB3
                </div>
            </div>
        </div>
    );
}

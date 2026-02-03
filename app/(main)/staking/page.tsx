'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import { ArrowLeft, DollarSign, TrendingUp } from 'lucide-react';

interface Investment {
    id: number;
    amount: number;
    product: {
        title: string;
        description: string;
    };
    createdAt: string;
    status: string;
}

export default function StakingPage() {
    const router = useRouter();
    const { address } = useWallet();
    const { tokenSymbol } = useConfig();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [totalStaked, setTotalStaked] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) {
            router.push('/');
            return;
        }

        fetchInvestments();
    }, [address, router]);

    const fetchInvestments = async () => {
        if (!address) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/investments?walletAddress=${address}`);
            if (res.ok) {
                const data = await res.json();
                setInvestments(data);

                // Calculate totals
                const staked = data.reduce((sum: number, inv: Investment) => sum + inv.amount, 0);
                setTotalStaked(staked);
                // Assuming 10% APY for demo
                setTotalRewards(staked * 0.1);
            }
        } catch (error) {
            console.error('Error fetching investments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative mx-auto flex max-w-md flex-col bg-white min-h-screen pb-24">
            {/* Top App Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between">
                <button onClick={() => router.back()} className="text-slate-900 flex size-12 shrink-0 items-center">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">Staking</h2>
                <div className="w-12"></div>
            </div>

            <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100 bg-white pt-6">
                <div className="px-6 pb-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#330df2]"></div>
                        </div>
                    ) : (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Tổng Đã Stake</p>
                                    <p className="text-2xl font-bold text-slate-900">{totalStaked.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400 font-medium">HERO</p>
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Tổng Phần Thưởng</p>
                                    <p className="text-2xl font-bold text-[#330df2]">{totalRewards.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400 font-medium">HERO</p>
                                </div>
                            </div>

                            {/* APY Info Card */}
                            <div className="bg-gradient-to-br from-[#330df2] to-[#7c3aed] rounded-3xl p-6 mb-8 text-white shadow-xl shadow-[#330df2]/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg">APY Hiện Tại</h3>
                                </div>
                                <p className="text-4xl font-bold mb-1 ml-1">10.0%</p>
                                <p className="text-sm opacity-80 ml-1 font-medium">Lợi nhuận phần trăm hàng năm</p>
                            </div>

                            {/* Investments List */}
                            <h3 className="text-slate-900 text-lg font-bold mb-4 px-2">Gói Đang Stake</h3>
                            {investments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-3xl p-8">
                                    <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
                                    <p className="text-slate-600 font-medium font-lg">Không có gói stake nào</p>
                                    <p className="text-sm text-slate-400 mt-2 mb-6 font-medium">Bắt đầu stake để nhận thưởng!</p>
                                    <button
                                        onClick={() => router.push('/explore')}
                                        className="px-6 py-3 bg-[#330df2] text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#330df2]/20 w-full"
                                    >
                                        Khám Phá Gói Stake
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {investments.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className="bg-slate-50 rounded-2xl p-4 shadow-sm border border-slate-100"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 pr-4">
                                                    <h4 className="font-bold text-slate-900 line-clamp-1">{inv.product.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium bg-white px-2 py-1 rounded-lg w-fit">
                                                        {new Date(inv.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${inv.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Số Tiền Stake</p>
                                                    <p className="text-base font-bold text-slate-900">{inv.amount.toFixed(2)} {tokenSymbol}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 font-medium mb-0.5">Thưởng Dự Kiến</p>
                                                    <p className="text-base font-bold text-[#330df2]">{(inv.amount * 0.1).toFixed(2)} {tokenSymbol}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, Users, Copy, Share2 } from 'lucide-react';

interface ReferralStats {
    totalReferrals: number;
    totalEarnings: number;
    referralCode: string;
}

interface Referral {
    id: number;
    referredWallet: string;
    createdAt: string;
    totalSpent: number;
}

export default function ReferralsPage() {
    const router = useRouter();
    const { address } = useWallet();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!address) {
            router.push('/');
            return;
        }

        fetchReferralData();
    }, [address, router]);

    const fetchReferralData = async () => {
        if (!address) return;

        try {
            // Fetch stats
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/stats?walletAddress=${address}`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch referral code
            const codeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/code?walletAddress=${address}`);
            if (codeRes.ok) {
                const codeData = await codeRes.json();
                setStats(prev => prev ? { ...prev, referralCode: codeData.code } : null);
            }

            // Fetch referral list
            const listRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals?walletAddress=${address}`);
            if (listRes.ok) {
                const listData = await listRes.json();
                setReferrals(listData);
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = () => {
        if (stats?.referralCode) {
            const link = `${window.location.origin}?ref=${stats.referralCode}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="relative mx-auto flex max-w-md flex-col bg-white min-h-screen pb-24">
            {/* Top App Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between">
                <button onClick={() => router.back()} className="text-slate-900 flex size-12 shrink-0 items-center">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">Referrals</h2>
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
                                    <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Total Referrals</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats?.totalReferrals || 0}</p>
                                </div>
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <p className="text-slate-500 text-xs uppercase mb-1 font-semibold tracking-wider">Total Earnings</p>
                                    <p className="text-2xl font-bold text-[#330df2]">{stats?.totalEarnings || 0} HERO</p>
                                </div>
                            </div>

                            {/* Referral Link */}
                            <div className="bg-gradient-to-br from-[#330df2] to-[#7c3aed] rounded-3xl p-6 mb-8 text-white shadow-xl shadow-[#330df2]/20">
                                <h3 className="font-bold text-lg mb-2">Your Referral Code</h3>
                                <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center justify-between mb-4 border border-white/20">
                                    <code className="font-mono text-base font-bold tracking-widest">{stats?.referralCode || '...'}</code>
                                    <button onClick={copyReferralLink} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                                {copied && <p className="text-xs text-green-300 mb-2 font-medium">✓ Link copied to clipboard!</p>}
                                <button
                                    onClick={copyReferralLink}
                                    className="w-full bg-white text-[#330df2] rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Share Referral Link
                                </button>
                            </div>

                            {/* Referral List */}
                            <h3 className="text-slate-900 text-lg font-bold mb-4 px-2">Referral History</h3>
                            {referrals.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-3xl p-8">
                                    <Users className="w-16 h-16 text-slate-300 mb-4" />
                                    <p className="text-slate-600 font-medium">No referrals yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Share your link to start earning!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {referrals.map((ref) => (
                                        <div
                                            key={ref.id}
                                            className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between"
                                        >
                                            <div>
                                                <p className="font-mono text-sm font-bold text-slate-900">{formatAddress(ref.referredWallet)}</p>
                                                <p className="text-xs text-slate-500 mt-1 font-medium">
                                                    Joined {new Date(ref.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#330df2]">{ref.totalSpent} HERO</p>
                                                <p className="text-xs text-slate-500 font-medium">Total Spent</p>
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

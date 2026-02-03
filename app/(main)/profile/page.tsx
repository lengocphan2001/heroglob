'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, Share2, Wallet, Grid3x3, Users, DollarSign, Shield, Settings, ArrowLeft } from 'lucide-react';

interface UserStats {
  heroBalance: number;
  usdtBalance: number;
  ethBalance: number;
  usdValue: number;
  nftCount: number;
  referralCount: number;
  stakingRewards: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { address, disconnect } = useWallet();
  const [stats, setStats] = useState<UserStats>({
    heroBalance: 0,
    usdtBalance: 0,
    ethBalance: 0,
    usdValue: 0,
    nftCount: 0,
    referralCount: 0,
    stakingRewards: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    fetchUserStats();
  }, [address, router]);

  const fetchUserStats = async () => {
    if (!address) return;

    try {
      const balanceRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/balance?walletAddress=${address}`);
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setStats(prev => ({
          ...prev,
          heroBalance: parseFloat(balanceData.heroBalance || '0'),
          usdtBalance: parseFloat(balanceData.usdtBalance || '0'),
          ethBalance: parseFloat(balanceData.ethBalance || '0'),
          usdValue: parseFloat(balanceData.usdValue || '0'),
        }));
      }

      const nftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nfts?walletAddress=${address}`);
      if (nftRes.ok) {
        const nftData = await nftRes.json();
        setStats(prev => ({ ...prev, nftCount: nftData.length || 0 }));
      }

      const refRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/stats?walletAddress=${address}`);
      if (refRes.ok) {
        const refData = await refRes.json();
        setStats(prev => ({ ...prev, referralCount: refData.totalReferrals || 0 }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address) {
    return null;
  }

  return (
    <div className="relative mx-auto flex max-w-md flex-col bg-white min-h-screen pb-24">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center bg-white/95 backdrop-blur-md p-4 pb-2 justify-between">
        <button onClick={() => router.back()} className="text-slate-900 flex size-12 shrink-0 items-center">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 text-center">Hồ Sơ</h2>
        <button className="flex w-12 items-center justify-end text-slate-900">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-6 pt-2 pb-6">
        <div className="flex w-full flex-col gap-4 items-center mb-6">
          <div className="flex gap-4 flex-col items-center relative">
            {/* Avatar */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-full min-h-32 w-32 border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-white text-5xl font-bold">
                  {address.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-1 right-1 bg-[#330df2] text-white rounded-full p-1 border-2 border-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-slate-900 text-2xl font-bold">Nhà Thám Hiểm</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 text-base font-medium">{formatAddress(address)}</p>
                <button onClick={copyAddress} className="text-[#330df2] cursor-pointer">
                  <Copy className="w-4 h-4" />
                </button>
                {copied && <span className="text-xs text-green-500">Đã sao chép!</span>}
              </div>
              <p className="text-slate-500 text-sm font-normal mt-1 flex items-center gap-1">
                Thành Viên Đã Xác Minh
              </p>
            </div>
          </div>
        </div>

        {/* Balance Card - Matching WalletPage style roughly */}
        <div className="flex items-stretch justify-between gap-4 rounded-3xl bg-gradient-to-br from-[#330df2] to-[#7c3aed] p-6 shadow-xl text-white">
          <div className="flex flex-[2_2_0px] flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Thu Nhập Ví</p>
              <p className="text-white text-3xl font-bold">{stats.heroBalance.toFixed(2)} HERO</p>
              <p className="text-white/80 text-sm font-medium">
                {stats.ethBalance.toFixed(4)} ETH / ${stats.usdValue.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => router.push('/wallet')}
              className="mt-2 w-fit rounded-xl bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30"
            >
              Quản Lý Ví
            </button>
          </div>
          <div className="flex items-center justify-center opacity-80">
            <Wallet className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Content Section - Matching WalletPage structure */}
      <div className="mt-2 flex-1 rounded-t-[40px] border-t border-slate-100 bg-white pt-6">
        <h3 className="text-slate-900 text-lg font-bold px-8 pb-4">Tài Sản & Cộng Đồng</h3>

        <div className="flex flex-col gap-2 px-6">
          {/* My NFTs */}
          <button
            onClick={() => router.push('/nfts')}
            className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left"
          >
            <div className="text-[#330df2] flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <Grid3x3 className="w-6 h-6" />
            </div>
            <p className="text-slate-900 text-base font-bold flex-1">NFTs Của Tôi</p>
            <span className="text-slate-500 text-sm font-medium">{stats.nftCount} Vật phẩm</span>
            <div className="shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>

          {/* Referral History */}
          <button
            onClick={() => router.push('/referrals')}
            className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left"
          >
            <div className="text-[#330df2] flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-slate-900 text-base font-bold flex-1">Lịch Sử Giới Thiệu</p>
            <span className="text-slate-500 text-sm font-medium">{stats.referralCount} Bạn</span>
            <div className="shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>

          {/* Staking Rewards */}
          <button
            onClick={() => router.push('/staking')}
            className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left"
          >
            <div className="text-[#330df2] flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-slate-900 text-base font-bold flex-1">Phần Thưởng Staking</p>
            <span className="text-slate-500 text-sm font-medium">{stats.stakingRewards.toFixed(2)} HERO</span>
            <div className="shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>
        </div>

        <h3 className="text-slate-900 text-lg font-bold px-8 pt-8 pb-4">Tài Khoản</h3>

        <div className="flex flex-col gap-2 px-6 pb-8">
          {/* Security */}
          <button className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left">
            <div className="text-[#330df2] flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-slate-900 text-base font-bold flex-1">Bảo Mật</p>
            <div className="shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>

          {/* Settings */}
          <button className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left">
            <div className="text-[#330df2] flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <Settings className="w-6 h-6" />
            </div>
            <p className="text-slate-900 text-base font-bold flex-1">Cài Đặt</p>
            <div className="shrink-0 text-slate-400 group-hover:translate-x-1 transition-transform">
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </div>
          </button>

          {/* Disconnect */}
          <button
            onClick={disconnect}
            className="flex items-center gap-4 bg-red-50 hover:bg-red-100 px-5 py-4 rounded-2xl transition-colors group w-full text-left mt-4"
          >
            <div className="text-red-500 flex items-center justify-center rounded-xl bg-white shrink-0 size-12 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <p className="text-red-500 text-base font-bold flex-1">Ngắt Kết Nối Ví</p>
          </button>
        </div>
      </div>
    </div>
  );
}

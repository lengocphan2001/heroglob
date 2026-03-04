'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import {
  Copy,
  BadgeCheck,
  QrCode,
  LayoutGrid,
  UserPlus,
  Wallet,
  Shield,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface UserStats {
  heroBalance: number;
  usdtBalance: number;
  ethBalance: number;
  usdValue: number;
  nftCount: number;
  referralCount: number;
  stakingRewards: number;
  totalEarnings?: number;
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
  const [userName, setUserName] = useState<string | null>(null);
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
        setStats((prev) => ({
          ...prev,
          heroBalance: parseFloat(balanceData.heroBalance || '0'),
          usdtBalance: parseFloat(balanceData.usdtBalance || '0'),
          ethBalance: parseFloat(balanceData.ethBalance || '0'),
          usdValue: parseFloat(balanceData.usdValue || '0'),
        }));
        setUserName(typeof balanceData.name === 'string' ? balanceData.name : null);
      }
      const nftRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nfts?walletAddress=${address}`);
      if (nftRes.ok) {
        const nftData = await nftRes.json();
        setStats((prev) => ({ ...prev, nftCount: Array.isArray(nftData) ? nftData.length : 0 }));
      }
      const refRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/stats?walletAddress=${address}`);
      if (refRes.ok) {
        const refData = await refRes.json();
        setStats((prev) => ({
          ...prev,
          referralCount: refData.totalReferrals || 0,
          totalEarnings: refData.totalEarnings ?? prev.totalEarnings,
        }));
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

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!address) return null;

  const nameFromApi = userName?.trim() || '';

  return (
    <div className="flex flex-col min-h-full bg-slate-100 dark:bg-[var(--color-background-dark)] pb-24">
      <div className="flex-1 min-h-0">
        {/* Profile section */}
        <div className="flex flex-col items-center px-4 py-8">
          <div className="relative">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-32 w-32 border-4 border-[var(--color-primary-wallet)] shadow-lg shadow-[var(--color-primary-wallet)]/20"
              style={{
                backgroundImage: `url(https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(address)})`,
              }}
              aria-hidden
            />
            <div className="absolute bottom-1 right-1 bg-[var(--color-primary-wallet)] text-white rounded-full p-1 border-2 border-[var(--color-background-dark)] dark:border-[var(--color-background-dark)] flex items-center justify-center">
              <BadgeCheck className="size-4" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Họ tên</p>
            <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">
              {nameFromApi || '—'}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {formatAddress(address)}
              </p>
              <button
                type="button"
                onClick={copyAddress}
                className="text-[var(--color-primary-wallet)] cursor-pointer p-0.5 hover:opacity-80"
                aria-label="Sao chép địa chỉ"
              >
                <Copy className="size-4" />
              </button>
              {copied && <span className="text-xs text-emerald-500">Đã sao chép!</span>}
            </div>
          </div>
          <div className="flex w-full max-w-md gap-3 mt-8">
            <button
              type="button"
              className="flex-1 bg-[var(--color-primary-wallet)] hover:bg-[var(--color-primary-wallet)]/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[var(--color-primary-wallet)]/25"
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              type="button"
              className="px-4 bg-[var(--color-primary-wallet)]/10 dark:bg-[var(--color-primary-wallet)]/20 text-[var(--color-primary-wallet)] border border-[var(--color-primary-wallet)]/30 font-bold rounded-xl flex items-center justify-center"
              aria-label="QR code"
            >
              <QrCode className="size-5" />
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 px-4 py-2">
          <div className="flex flex-col gap-1 rounded-xl bg-slate-100 dark:bg-[var(--color-primary-wallet)]/10 border border-slate-200 dark:border-[var(--color-primary-wallet)]/20 p-4 items-center text-center">
            <p className="text-[var(--color-primary-wallet)] text-xl font-bold">{stats.nftCount}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              NFT
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-slate-100 dark:bg-[var(--color-primary-wallet)]/10 border border-slate-200 dark:border-[var(--color-primary-wallet)]/20 p-4 items-center text-center">
            <p className="text-[var(--color-primary-wallet)] text-xl font-bold">
              {stats.referralCount >= 1000 ? `${(stats.referralCount / 1000).toFixed(1)}k` : stats.referralCount}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              Người theo dõi
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-slate-100 dark:bg-[var(--color-primary-wallet)]/10 border border-slate-200 dark:border-[var(--color-primary-wallet)]/20 p-4 items-center text-center">
            <p className="text-[var(--color-primary-wallet)] text-xl font-bold">
              {stats.stakingRewards >= 1000 ? `${(stats.stakingRewards / 1000).toFixed(1)}k` : Math.round(stats.stakingRewards)}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              Đã stake
            </p>
          </div>
        </div>

        {/* Sections menu */}
        <div className="px-4 py-6 space-y-2">
          <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-[0.1em] px-1 mb-4">
            Tài sản & Quản lý
          </h3>

          <Link
            href="/nfts"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[var(--color-primary-wallet)]/5 hover:bg-slate-100 dark:hover:bg-[var(--color-primary-wallet)]/10 transition-colors border border-transparent hover:border-[var(--color-primary-wallet)]/20"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-[var(--color-primary-wallet)]/20 flex items-center justify-center text-[var(--color-primary-wallet)]">
                <LayoutGrid className="size-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">NFT của tôi</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Xem bộ sưu tập số của bạn</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-400 shrink-0" />
          </Link>

          <Link
            href="/referrals"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[var(--color-primary-wallet)]/5 hover:bg-slate-100 dark:hover:bg-[var(--color-primary-wallet)]/10 transition-colors border border-transparent hover:border-[var(--color-primary-wallet)]/20"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-[var(--color-primary-wallet)]/20 flex items-center justify-center text-[var(--color-primary-wallet)]">
                <UserPlus className="size-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Lịch sử giới thiệu</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Đã nhận {stats.totalEarnings ?? 0} từ mời giới thiệu
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-400 shrink-0" />
          </Link>

          <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-[0.1em] px-1 pt-6 mb-4">
            Tài khoản
          </h3>

          <Link
            href="/profile/security"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[var(--color-primary-wallet)]/5 hover:bg-slate-100 dark:hover:bg-[var(--color-primary-wallet)]/10 transition-colors border border-transparent hover:border-[var(--color-primary-wallet)]/20"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-[var(--color-primary-wallet)]/20 flex items-center justify-center text-[var(--color-primary-wallet)]">
                <Shield className="size-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Bảo mật</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">2FA, Passkeys, Nhật ký phiên</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-400 shrink-0" />
          </Link>

          <Link
            href="/wallet/settings"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[var(--color-primary-wallet)]/5 hover:bg-slate-100 dark:hover:bg-[var(--color-primary-wallet)]/10 transition-colors border border-transparent hover:border-[var(--color-primary-wallet)]/20"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-[var(--color-primary-wallet)]/20 flex items-center justify-center text-[var(--color-primary-wallet)]">
                <Settings className="size-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Cài đặt</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Thông báo, Ngôn ngữ, Giao diện</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-400 shrink-0" />
          </Link>

          <div className="pt-8 pb-12 flex justify-center">
            <button
              type="button"
              onClick={disconnect}
              className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-500/10 px-6 py-2 rounded-lg transition-colors"
            >
              <LogOut className="size-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

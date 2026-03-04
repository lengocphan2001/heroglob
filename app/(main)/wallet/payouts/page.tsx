'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyPayouts, type PayoutItem } from '@/lib/api/payouts';
import { useWallet } from '@/contexts/WalletContext';
import { useConfig } from '@/contexts/ConfigContext';
import { ArrowLeft, Calendar, ShoppingBag, Zap, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ScheduledPayoutsPage() {
    const router = useRouter();
    const { isConnected } = useWallet();
    const { tokenSymbol } = useConfig();
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const paidOnly = payouts
        .filter((p) => p.status === 'paid')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    useEffect(() => {
        if (!isConnected) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        getMyPayouts()
            .then(setPayouts)
            .catch((err) => {
                console.error('Failed to fetch payouts:', err);
                setError('Không thể tải lịch trả thưởng');
            })
            .finally(() => setLoading(false));
    }, [isConnected]);

    const getSourceLabel = (p: PayoutItem) => {
        if (p.type === 'order_daily' && p.orderId) return `Đơn hàng #${p.orderId}`;
        if (p.type === 'investment_daily' && p.investmentId) return 'Kích hoạt';
        return p.type === 'order_daily' ? 'Đơn hàng' : 'Kích hoạt';
    };

    const getSourceIcon = (p: PayoutItem) => {
        if (p.type === 'order_daily') return <ShoppingBag className="w-4 h-4 text-blue-500" />;
        return <Zap className="w-4 h-4 text-amber-500" />;
    };

    return (
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white dark:bg-[var(--color-background-dark)]">
            <div className="sticky top-0 z-10 glass-light px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lịch trả thưởng</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Các kỳ thưởng đã được ghi vào số dư trong ứng dụng của bạn.
                </p>
            </div>

            <div className="flex-1 px-6 py-4">
                {!isConnected ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Kết nối ví để xem lịch trả thưởng.
                    </p>
                ) : loading ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
                ) : error ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{error}</p>
                ) : paidOnly.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Chưa có kỳ thưởng nào đã trả.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {paidOnly.map((payout) => (
                            <div
                                key={payout.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[var(--color-surface-dark)] p-4 shadow-sm"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-white/10">
                                        {getSourceIcon(payout)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                            {getSourceLabel(payout)}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            {payout.scheduledAt ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(payout.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {format(new Date(payout.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> Đã trả
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                        +{Number(payout.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {payout.type === 'investment_daily' ? 'USDT' : tokenSymbol}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

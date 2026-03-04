'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactionHistory, type TransactionHistoryItem } from '@/lib/api/transactions';
import { useConfig } from '@/contexts/ConfigContext';
import { useWallet } from '@/contexts/WalletContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, Gift, Zap, ShoppingBag, Users, ArrowLeft, Sparkles } from 'lucide-react';

export default function HistoryPage() {
    const router = useRouter();
    const { tokenSymbol } = useConfig();
    const { isConnected } = useWallet();
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const sorted = [...transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    useEffect(() => {
        if (!isConnected) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        getTransactionHistory()
            .then(setTransactions)
            .catch((err) => {
                console.error('Failed to fetch transactions:', err);
                setError('Không thể tải lịch sử');
            })
            .finally(() => setLoading(false));
    }, [isConnected]);

    const getTransactionIcon = (transaction: TransactionHistoryItem) => {
        if (transaction.type === 'order') return <ShoppingBag className="w-4 h-4 text-blue-500" />;
        if (transaction.type === 'commission') return <Users className="w-4 h-4 text-orange-500" />;
        if (transaction.type === 'nft_reward') return <Sparkles className="w-4 h-4 text-yellow-500" />;
        if (transaction.metadata?.payoutType === 'rank_daily') return <Gift className="w-4 h-4 text-purple-500" />;
        if (transaction.metadata?.payoutType === 'investment_daily') return <TrendingUp className="w-4 h-4 text-green-500" />;
        return <Zap className="w-4 h-4 text-blue-500" />;
    };

    const getTokenLabel = (tokenType?: string) => {
        if (tokenType === 'usdt') return 'USDT';
        if (tokenType === 'hero') return tokenSymbol;
        return tokenSymbol;
    };

    return (
        <div className="relative mx-auto flex min-h-full max-w-md flex-col bg-white dark:bg-[var(--color-background-dark)]">
            <div className="sticky top-0 z-10 glass-light px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lịch sử giao dịch</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Các giao dịch đã hoàn thành (đơn hàng, hoa hồng, thưởng).
                </p>
            </div>

            <div className="flex-1 px-6 py-4">
                {!isConnected ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Kết nối ví để xem lịch sử.
                    </p>
                ) : loading ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
                ) : error ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{error}</p>
                ) : sorted.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Chưa có giao dịch nào.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {sorted.map((transaction) => {
                            const isPositive = transaction.amount > 0;
                            const amountColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                            const amountPrefix = isPositive ? '+' : '';

                            return (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[var(--color-surface-dark)] p-4 shadow-sm"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-white/10">
                                            {getTransactionIcon(transaction)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                                {transaction.description}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-bold ${amountColor}`}>
                                            {amountPrefix}
                                            {Math.abs(transaction.amount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 4,
                                            })}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{getTokenLabel(transaction.tokenType)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactionHistory, type TransactionHistoryItem } from '@/lib/api/transactions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, Gift, Zap, ShoppingBag, Users, ArrowRight, Sparkles } from 'lucide-react';

export function HistoryTab() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTransactionHistory()
            .then((data) => setTransactions(data.slice(0, 5))) // Only show 5 most recent
            .catch((err) => {
                console.error('Failed to fetch transactions:', err);
                setError('Không thể tải lịch sử');
            })
            .finally(() => setLoading(false));
    }, []);

    const getTransactionIcon = (transaction: TransactionHistoryItem) => {
        if (transaction.type === 'order') {
            return <ShoppingBag className="w-4 h-4 text-blue-500" />;
        }
        if (transaction.type === 'commission') {
            return <Users className="w-4 h-4 text-orange-500" />;
        }
        if (transaction.type === 'nft_reward') {
            return <Sparkles className="w-4 h-4 text-yellow-500" />;
        }
        if (transaction.metadata?.payoutType === 'rank_daily') {
            return <Gift className="w-4 h-4 text-purple-500" />;
        }
        if (transaction.metadata?.payoutType === 'investment_daily') {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        }
        return <Zap className="w-4 h-4 text-blue-500" />;
    };

    const getTokenLabel = (tokenType?: string) => {
        if (tokenType === 'usdt') return 'USDT';
        if (tokenType === 'hero') return 'HERO';
        return 'HERO';
    };

    if (loading) {
        return (
            <div className="px-6 pt-4">
                <p className="py-8 text-center text-sm text-slate-500">Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 pt-4">
                <p className="py-8 text-center text-sm text-slate-500">{error}</p>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="px-6 pt-4">
                <p className="py-8 text-center text-sm text-slate-500">Chưa có giao dịch.</p>
            </div>
        );
    }

    return (
        <div className="px-6 pt-4 pb-4">
            <div className="space-y-3">
                {transactions.map((transaction) => {
                    const isPositive = transaction.amount > 0;
                    const amountColor = isPositive ? 'text-green-600' : 'text-red-600';
                    const amountPrefix = isPositive ? '+' : '';

                    return (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-slate-50">
                                    {getTransactionIcon(transaction)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{transaction.description}</p>
                                    <p className="text-xs text-slate-500">
                                        {formatDistanceToNow(new Date(transaction.createdAt), {
                                            addSuffix: true,
                                            locale: vi,
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${amountColor}`}>
                                    {amountPrefix}
                                    {Math.abs(transaction.amount).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                                <p className="text-xs text-slate-500">{getTokenLabel(transaction.tokenType)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => router.push('/wallet/history')}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

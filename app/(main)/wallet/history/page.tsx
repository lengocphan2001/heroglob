'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTransactionHistory, type TransactionHistoryItem } from '@/lib/api/transactions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TrendingUp, Gift, Zap, ShoppingBag, Users, ArrowLeft, Filter, Sparkles } from 'lucide-react';

type FilterType = 'all' | 'order' | 'commission' | 'payout' | 'nft_reward';

export default function HistoryPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        setLoading(true);
        setError(null);
        getTransactionHistory()
            .then((data) => {
                setTransactions(data);
                setFilteredTransactions(data);
            })
            .catch((err) => {
                console.error('Failed to fetch transactions:', err);
                setError('Không thể tải lịch sử');
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(transactions.filter((t) => t.type === activeFilter));
        }
    }, [activeFilter, transactions]);

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

    const filters: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'Tất cả' },
        { id: 'order', label: 'Đơn hàng' },
        { id: 'nft_reward', label: 'NFT' },
        { id: 'commission', label: 'Hoa hồng' },
        { id: 'payout', label: 'Thưởng' },
    ];

    return (
        <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Lịch sử giao dịch</h1>
                </div>

                {/* Filter Tabs */}
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            type="button"
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeFilter === filter.id
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-4">
                {loading ? (
                    <p className="py-8 text-center text-sm text-slate-500">Đang tải...</p>
                ) : error ? (
                    <p className="py-8 text-center text-sm text-slate-500">{error}</p>
                ) : filteredTransactions.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                        {activeFilter === 'all' ? 'Chưa có giao dịch.' : 'Không có giao dịch nào.'}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.map((transaction) => {
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
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { api } from '@/lib/api';

type Investment = {
    amount: string;
    status: string;
    dailyProfitPercent: string;
};

export function ActivePowerCard() {
    const [invested, setInvested] = useState(0);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [activating, setActivating] = useState(false);

    useEffect(() => {
        fetchInvestments();
    }, []);

    const fetchInvestments = async () => {
        try {
            setLoading(true);
            const data = await api<Investment[]>('investments');
            const total = data
                .filter((i) => i.status === 'active')
                .reduce((sum, item) => sum + Number(item.amount), 0);
            setInvested(total);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        try {
            setActivating(true);
            await api('investments/activate', {
                method: 'POST',
                body: JSON.stringify({ amount: Number(amount) }),
            });
            setAmount('');
            await fetchInvestments();
            alert('Activated successfully!');
        } catch (e: any) {
            alert(e.message || 'Failed to activate');
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Zap className="size-5 text-[var(--color-primary)]" aria-hidden />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-900">
                        Active Power
                    </p>
                    <p className="text-xs text-slate-500">
                        {loading ? '...' : `${invested.toFixed(2)} USDT Invested`}
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount USDT"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                    onClick={handleActivate}
                    disabled={activating || !amount}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {activating ? '...' : 'Activate'}
                </button>
            </div>
        </div>
    );
}

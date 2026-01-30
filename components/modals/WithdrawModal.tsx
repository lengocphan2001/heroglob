'use client';

import { useState } from 'react';
import { createWithdrawal } from '@/lib/api/withdrawals';
import { X } from 'lucide-react';
import { toast } from 'sonner';

type WithdrawModalProps = {
    isOpen: boolean;
    onClose: () => void;
    tokenType: 'usdt' | 'hero';
    balance: number;
    onSuccess: () => void;
};

export function WithdrawModal({ isOpen, onClose, tokenType, balance, onSuccess }: WithdrawModalProps) {
    const [toAddress, setToAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            toast.error('Số tiền không hợp lệ');
            return;
        }

        if (withdrawAmount > balance) {
            toast.error('Số dư không đủ');
            return;
        }

        if (!toAddress || toAddress.length !== 42 || !toAddress.startsWith('0x')) {
            toast.error('Địa chỉ ví không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await createWithdrawal(toAddress, withdrawAmount, tokenType);
            toast.success('Yêu cầu rút tiền đã được gửi');
            setToAddress('');
            setAmount('');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Rút tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    const tokenLabel = tokenType === 'usdt' ? 'USDT' : 'HERO';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Rút {tokenLabel}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Balance */}
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-600">Số dư khả dụng</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tokenLabel}
                        </p>
                    </div>

                    {/* To Address */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Địa chỉ ví nhận
                        </label>
                        <input
                            type="text"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="0x..."
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Số tiền
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-20 text-slate-900 placeholder-slate-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(balance.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                Max
                            </button>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Vui lòng kiểm tra kỹ địa chỉ ví. Giao dịch không thể hoàn tác.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[var(--color-primary)] py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : `Rút ${tokenLabel}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

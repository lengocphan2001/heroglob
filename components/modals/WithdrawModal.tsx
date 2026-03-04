'use client';

import { useState } from 'react';
import { createWithdrawal } from '@/lib/api/withdrawals';
import { useConfig } from '@/contexts/ConfigContext';
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
    const { tokenSymbol } = useConfig();
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

    const tokenLabel = tokenType === 'usdt' ? 'USDT' : tokenSymbol;

    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[var(--color-primary-wallet)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-wallet)]/20 dark:border-[var(--color-border-dark)] dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-surface)] p-6 shadow-xl dark:border-[var(--color-border-dark)] dark:bg-[var(--color-surface-dark)]"
                role="dialog"
                aria-modal
                aria-labelledby="withdraw-modal-title"
            >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 id="withdraw-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Rút {tokenLabel}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Balance */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[var(--color-border-dark)] dark:bg-white/5">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Số dư khả dụng</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tokenLabel}
                        </p>
                    </div>

                    {/* To Address */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Địa chỉ ví nhận
                        </label>
                        <input
                            type="text"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            placeholder="0x..."
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
                                className={`${inputClass} pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(balance.toString())}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
                            >
                                Tối đa
                            </button>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 dark:border-amber-400/20 dark:bg-amber-500/10">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            ⚠️ Vui lòng kiểm tra kỹ địa chỉ ví. Giao dịch không thể hoàn tác.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[var(--color-primary-wallet)] py-3.5 font-bold text-white shadow-lg shadow-[var(--color-primary-wallet)]/25 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? 'Đang xử lý...' : `Rút ${tokenLabel}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

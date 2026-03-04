'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, Button } from '@/components/ui';
import { useConfig } from '@/contexts/ConfigContext';
import { useBalance } from '@/contexts/BalanceContext';
import { useWallet } from '@/contexts/WalletContext';
import { getUsdtAddress, getUsdtDecimals } from '@/lib/wallet/tokens';
import { sendTokenTransfer, toRawAmount, waitForTransaction, checkBalance } from '@/lib/wallet/transfer';

type Investment = {
    amount: string;
    status: string;
    dailyProfitPercent: string;
};

type Package = {
    id: number;
    name: string;
    price: string;
    dailyProfitPercent: string;
    durationDays: number;
};

function getEthereum() {
    if (typeof window === 'undefined') return undefined;
    return window.ethereum;
}

export function ActivePowerCard() {
    const config = useConfig();
    const { refetch: refetchBalance } = useBalance();
    const { isConnected, address, chainId } = useWallet();
    const [invested, setInvested] = useState(0);
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loadingPkgs, setLoadingPkgs] = useState(true);

    // Modal state
    const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
    const [activateStep, setActivateStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        fetchInvestments();
        fetchPackages();
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

    const fetchPackages = async () => {
        try {
            setLoadingPkgs(true);
            const data = await api<Package[]>('active-power');
            setPackages(data);
        } catch (e) {
            console.error('Failed to fetch packages', e);
        } finally {
            setLoadingPkgs(false);
        }
    };

    const onSelectPkg = (pkg: Package) => {
        setSelectedPkg(pkg);
        setActivateStep('confirm');
        setErrorMsg('');
    };

    const handlePayWithWallet = async () => {
        if (!selectedPkg || !isConnected || !address) {
            setErrorMsg('Vui lòng kết nối ví trước.');
            setActivateStep('error');
            return;
        }
        if (!config.paymentReceiverAddress?.trim()) {
            setErrorMsg('Thanh toán chưa được cấu hình. Vui lòng thử lại sau.');
            setActivateStep('error');
            return;
        }
        const ethereum = getEthereum();
        if (!ethereum) {
            setErrorMsg('Không tìm thấy ví. Cài MetaMask hoặc ví tương thích.');
            setActivateStep('error');
            return;
        }
        const usdtAddress = getUsdtAddress(chainId);
        if (!usdtAddress) {
            setErrorMsg('Mạng này không hỗ trợ USDT. Vui lòng chuyển sang BSC (BEP20).');
            setActivateStep('error');
            return;
        }
        const amountStr = String(selectedPkg.price);
        setActivateStep('processing');
        try {
            const raw = toRawAmount(amountStr, getUsdtDecimals(chainId));
            await checkBalance(ethereum, address, usdtAddress, raw, { tokenLabel: 'USDT', decimals: getUsdtDecimals(chainId) });
            const txHash = await sendTokenTransfer(
                ethereum,
                address,
                usdtAddress,
                config.paymentReceiverAddress,
                raw,
            );
            await waitForTransaction(ethereum, txHash);
            await api('investments/activate-with-payment', {
                method: 'POST',
                body: JSON.stringify({
                    packageId: selectedPkg.id,
                    txHash,
                    amount: amountStr,
                }),
            });
            await fetchInvestments();
            refetchBalance();
            setActivateStep('success');
        } catch (e: any) {
            setActivateStep('error');
            setErrorMsg(e.message || 'Thanh toán hoặc kích hoạt thất bại.');
        }
    };

    const handleCloseModal = () => {
        if (activateStep === 'processing') return;
        setSelectedPkg(null);
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Summary card */}
                <div className="glass-card-subtle rounded-xl p-5 flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--color-primary-wallet)]/20 text-[var(--color-primary-wallet)]">
                        <Zap className="size-6" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Kích hoạt
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {loading ? 'Đang tải...' : `${invested.toFixed(2)} USDT đã đầu tư`}
                        </p>
                    </div>
                </div>

                {/* Package list */}
                {loadingPkgs ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-xl glass-card-subtle" />
                        ))}
                    </div>
                ) : packages.length === 0 ? (
                    <div className="glass-card-subtle rounded-xl p-8 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có gói nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gói</h3>
                        <div className="flex flex-col gap-3">
                            {packages.map((pkg, idx) => {
                                const isPopular = idx === Math.floor(packages.length / 2);
                                return (
                                    <div
                                        key={pkg.id}
                                        className={`rounded-xl p-4 flex items-center justify-between gap-3 transition-colors ${
                                            isPopular
                                                ? 'bg-[var(--color-primary-wallet)]/10 border-2 border-[var(--color-primary-wallet)]/30'
                                                : 'glass-card-subtle hover:border-[var(--color-primary-wallet)]/20'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.name}</span>
                                                {isPopular && (
                                                    <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white bg-[var(--color-primary-wallet)]">
                                                        PHỔ BIẾN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                <span>{pkg.durationDays} ngày</span>
                                                <span className="font-semibold text-emerald-500">+{pkg.dailyProfitPercent}%/ngày</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                {Number(pkg.price)} USDT
                                            </span>
                                            <button
                                                onClick={() => onSelectPkg(pkg)}
                                                className="gradient-button rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-[var(--color-primary-wallet)]/30 hover:opacity-90 transition-opacity"
                                            >
                                                Kích hoạt
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Activation Modal ── */}
            <Modal isOpen={!!selectedPkg} onClose={handleCloseModal} title={activateStep === 'confirm' ? 'Xác nhận kích hoạt' : ''}>
                {selectedPkg && (
                    <div className="space-y-4">
                        {activateStep === 'confirm' && (
                            <>
                                <div className="rounded-xl glass-card-subtle p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Gói</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedPkg.name}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Thời hạn</span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedPkg.durationDays} ngày</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Lợi nhuận mỗi ngày</span>
                                        <span className="text-sm font-semibold text-emerald-500">+{selectedPkg.dailyProfitPercent}%</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between">
                                        <span className="text-base font-medium text-slate-700 dark:text-slate-200">Tổng</span>
                                        <span className="text-base font-bold text-[var(--color-primary-wallet)]">{Number(selectedPkg.price)} USDT</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={handlePayWithWallet}
                                        className="w-full rounded-xl py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2"
                                    >
                                        <Wallet className="h-4 w-4" />
                                        Thanh toán bằng ví (USDT)
                                    </button>
                                    <button
                                        onClick={handleCloseModal}
                                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </>
                        )}

                        {activateStep === 'processing' && (
                            <div className="py-8 text-center space-y-3">
                                <div className="animate-spin mx-auto h-8 w-8 border-4 border-slate-200 dark:border-white/10 border-t-[var(--color-primary-wallet)] rounded-full" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Đang xử lý kích hoạt...</p>
                            </div>
                        )}

                        {activateStep === 'success' && (
                            <div className="py-6 text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                                    <CheckCircle className="h-8 w-8 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Kích hoạt thành công!</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Gói <strong className="text-slate-700 dark:text-slate-200">{selectedPkg.name}</strong> đã được kích hoạt.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full rounded-xl py-3 text-sm font-bold text-white gradient-button"
                                >
                                    Xong
                                </button>
                            </div>
                        )}

                        {activateStep === 'error' && (
                            <div className="py-6 text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                                    <AlertTriangle className="h-8 w-8 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Kích hoạt thất bại</h3>
                                    <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
                                </div>
                                <button
                                    onClick={() => setActivateStep('confirm')}
                                    className="w-full rounded-xl glass-card-subtle py-3 text-sm font-bold text-slate-700 dark:text-slate-100 hover:bg-white/5"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

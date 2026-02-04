'use client';

import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { Modal, Button } from '@/components/ui';
import { useConfig } from '@/contexts/ConfigContext';

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

export function ActivePowerCard() {
    const { projectName } = useConfig();
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

    const handleConfirmActivate = async () => {
        if (!selectedPkg) return;
        setActivateStep('processing');
        try {
            await api('investments/activate', {
                method: 'POST',
                body: JSON.stringify({ packageId: selectedPkg.id }),
            });
            await fetchInvestments();
            setActivateStep('success');
        } catch (e: any) {
            setActivateStep('error');
            setErrorMsg(e.message || 'Activation failed');
        }
    };

    const handleCloseModal = () => {
        if (activateStep === 'processing') return;
        setSelectedPkg(null);
    };

    return (
        <>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                        <Zap className="size-5 text-[var(--color-primary)]" aria-hidden />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-900">
                            Năng Lượng Kích Hoạt
                        </p>
                        <p className="text-xs text-slate-500">
                            {loading ? 'Đang tải...' : `${invested.toFixed(2)} USDT Đã Đầu Tư`}
                        </p>
                    </div>
                </div>

                <div className="mt-2 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">Gói Có Sẵn</h3>
                    {loadingPkgs ? (
                        <p className="text-xs text-slate-500">Đang tải gói...</p>
                    ) : packages.length === 0 ? (
                        <p className="text-xs text-slate-500">Không có gói nào.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-800">{pkg.name}</p>
                                            <p className="text-xs text-slate-500">{pkg.durationDays} ngày</p>
                                        </div>
                                        <span className="text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded text-xs">
                                            {Number(pkg.price)} USDT
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-xs">
                                            <span className="text-green-600 font-semibold">+{pkg.dailyProfitPercent}%</span> / ngày
                                        </div>
                                        <button
                                            onClick={() => onSelectPkg(pkg)}
                                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                                        >
                                            Kích hoạt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={!!selectedPkg} onClose={handleCloseModal} title={activateStep === 'confirm' ? 'Xác Nhận Kích Hoạt' : ''}>
                {selectedPkg && (
                    <div className="space-y-4">
                        {activateStep === 'confirm' && (
                            <>
                                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500">Gói</span>
                                        <span className="text-sm font-semibold text-slate-900">{selectedPkg.name}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500">Thời hạn</span>
                                        <span className="text-sm font-semibold text-slate-900">{selectedPkg.durationDays} ngày</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm text-slate-500">Lợi nhuận ngày</span>
                                        <span className="text-sm font-semibold text-green-600">+{selectedPkg.dailyProfitPercent}%</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between">
                                        <span className="text-base font-medium text-slate-900">Tổng giá</span>
                                        <span className="text-base font-bold text-[var(--color-primary)]">{Number(selectedPkg.price)} USDT</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                                    <Info className="h-4 w-4 shrink-0" />
                                    <p>Số tiền sẽ được trích từ ví {projectName} của bạn. Hành động này không thể hoàn tác.</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleCloseModal}
                                        className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleConfirmActivate}
                                        className="flex-1 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </>
                        )}

                        {activateStep === 'processing' && (
                            <div className="py-8 text-center space-y-3">
                                <div className="animate-spin text-[var(--color-primary)] mx-auto h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" />
                                <p className="text-slate-600 font-medium">Đang xử lý kích hoạt...</p>
                            </div>
                        )}

                        {activateStep === 'success' && (
                            <div className="py-6 text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Kích Hoạt Thành Công!</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Gói <strong>{selectedPkg.name}</strong> đã được kích hoạt ngay bây giờ.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800"
                                >
                                    Xong
                                </button>
                            </div>
                        )}

                        {activateStep === 'error' && (
                            <div className="py-6 text-center space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Kích Hoạt Thất Bại</h3>
                                    <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
                                </div>
                                <button
                                    onClick={() => setActivateStep('confirm')}
                                    className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200"
                                >
                                    Thử Lại
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

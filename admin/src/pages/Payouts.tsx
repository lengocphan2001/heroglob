import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { payoutsApi, type Payout } from '../api/payouts';
import { commissionsApi, type Commission } from '../api/commissions';
import { useTokenConfig } from '../contexts/ConfigContext';
import { Eye, Trash2 } from 'lucide-react';

type FilterType = 'all' | 'pending' | 'paid';

function getGroupKey(p: Payout): string {
    if (p.type === 'order_daily' && p.orderId != null) return `order-${p.orderId}`;
    if (p.type === 'investment_daily' && p.investmentId != null) return `inv-${p.investmentId}`;
    return `single-${p.id}`;
}

function getSourceLabel(p: Payout): string {
    if (p.type === 'order_daily' && p.orderId) return `Order #${p.orderId}`;
    if (p.type === 'investment_daily' && p.investmentId) return `Active Power #${p.investmentId}`;
    return p.type === 'order_daily' ? 'Order' : 'Active Power';
}

function getCycleParams(row: GroupRow): { orderId?: number; investmentId?: number } {
    const first = row.payouts[0];
    if (first.type === 'order_daily' && first.orderId != null) return { orderId: first.orderId };
    if (first.type === 'investment_daily' && first.investmentId != null) return { investmentId: first.investmentId };
    return {};
}


type GroupRow = {
    key: string;
    label: string;
    type: string;
    userId: number;
    userDisplay: string;
    count: number;
    totalAmount: number;
    paidCount: number;
    pendingCount: number;
    firstScheduled: string | null;
    lastScheduled: string | null;
    payouts: Payout[];
};

function getCommissionSourceLabel(source?: string | null): string {
    if (source === 'investment_daily') return 'Active Power';
    if (source === 'nft_reward') return 'NFT';
    if (source === 'order') return 'Đơn hàng';
    return '—';
}

export function Payouts() {
    const { tokenSymbol } = useTokenConfig();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [viewGroup, setViewGroup] = useState<GroupRow | null>(null);
    const [removing, setRemoving] = useState<string | number | null>(null);

    /** Product payouts = token (from settings); package payouts = USDT. */
    const getTokenLabel = (payoutType: string) => (payoutType === 'investment_daily' ? 'USDT' : tokenSymbol);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const [payoutData, commissionData] = await Promise.all([
                payoutsApi.getAll(),
                commissionsApi.getAll().catch(() => []).then((r) => (Array.isArray(r) ? r : [])),
            ]);
            setPayouts(payoutData);
            setCommissions(Array.isArray(commissionData) ? commissionData : []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCycle = async (row: GroupRow) => {
        const params = getCycleParams(row);
        if (!params.orderId && !params.investmentId) return;
        const pendingCount = row.pendingCount;
        if (pendingCount === 0) {
            toast.info('Chu kỳ này không còn kỳ trả đang chờ.');
            return;
        }
        if (!confirm(`Xóa ${pendingCount} kỳ trả đang chờ của ${row.label}? Chỉ các kỳ chưa trả sẽ bị xóa.`)) return;
        setRemoving(row.key);
        try {
            const res = await payoutsApi.deleteCycle(params);
            toast.success(res.message);
            setViewGroup(null);
            await fetchPayouts();
        } catch (e: any) {
            toast.error(e.message || 'Không thể xóa chu kỳ');
        } finally {
            setRemoving(null);
        }
    };

    const handleRemovePayout = async (payoutId: number) => {
        if (!confirm('Xóa kỳ trả này (chỉ áp dụng với kỳ đang chờ)?')) return;
        setRemoving(payoutId);
        try {
            const res = await payoutsApi.deletePayout(payoutId);
            if (res.deleted) {
                toast.success(res.message);
                setViewGroup((g) => {
                    if (!g) return null;
                    const next = g.payouts.filter((p) => p.id !== payoutId);
                    return next.length === 0 ? null : { ...g, payouts: next };
                });
                await fetchPayouts();
            } else {
                toast.error(res.message);
            }
        } catch (e: any) {
            toast.error(e.message || 'Không thể xóa kỳ trả');
        } finally {
            setRemoving(null);
        }
    };

    const filteredByStatus = useMemo(() => {
        if (filter === 'all') return payouts;
        if (filter === 'pending') return payouts.filter((p) => p.status === 'pending');
        return payouts.filter((p) => p.status === 'paid');
    }, [payouts, filter]);

    const groups = useMemo((): GroupRow[] => {
        const map = new Map<string, Payout[]>();
        for (const p of filteredByStatus) {
            const key = getGroupKey(p);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        }
        const rows: GroupRow[] = [];
        map.forEach((list, key) => {
            const first = list[0];
            const label = getSourceLabel(first);
            const totalAmount = list.reduce((s, p) => s + Number(p.amount), 0);
            const paidCount = list.filter((p) => p.status === 'paid').length;
            const pendingCount = list.filter((p) => p.status === 'pending').length;
            const scheduled = list
                .map((p) => p.scheduledAt)
                .filter((x): x is string => x != null && x !== '');
            const firstScheduled = scheduled.length ? scheduled.sort()[0] : null;
            const lastScheduled = scheduled.length ? scheduled.sort().reverse()[0] : null;
            rows.push({
                key,
                label,
                type: first.type,
                userId: first.userId,
                userDisplay: first.user?.name || `User #${first.userId}`,
                count: list.length,
                totalAmount,
                paidCount,
                pendingCount,
                firstScheduled,
                lastScheduled,
                payouts: list.sort((a, b) => (a.scheduledAt || a.createdAt).localeCompare(b.scheduledAt || b.createdAt)),
            });
        });
        rows.sort((a, b) => (b.lastScheduled || b.payouts[0]?.createdAt || '').localeCompare(a.lastScheduled || a.payouts[0]?.createdAt || ''));
        return rows;
    }, [filteredByStatus]);

    const cols = 7;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Lịch trả thưởng / Payout
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Gộp theo đơn hàng / gói Active Power. Bấm View để xem từng kỳ trả.
                </p>
            </div>

            <div className="flex gap-2">
                {(['all', 'pending', 'paid'] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                            filter === f
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                    >
                        {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Đang chờ' : 'Đã trả'}
                    </button>
                ))}
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3">Nguồn</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Số kỳ</th>
                                <th className="px-6 py-3">Tổng tiền (token)</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3">Từ ngày → Đến ngày</th>
                                <th className="px-6 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={cols} className="px-6 py-4 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : groups.length === 0 ? (
                                <tr>
                                    <td colSpan={cols} className="px-6 py-4 text-center">
                                        {filter === 'all' ? 'Chưa có payout nào.' : 'Không có bản ghi nào.'}
                                    </td>
                                </tr>
                            ) : (
                                groups.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {row.label}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                                            {row.userDisplay}
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.count} kỳ
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">
                                            +{row.totalAmount.toFixed(4)} {getTokenLabel(row.type)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {row.paidCount > 0 && `${row.paidCount} đã trả`}
                                                {row.paidCount > 0 && row.pendingCount > 0 && ', '}
                                                {row.pendingCount > 0 && `${row.pendingCount} chờ`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {row.firstScheduled && row.lastScheduled
                                                ? `${new Date(row.firstScheduled).toLocaleDateString('vi-VN')} → ${new Date(row.lastScheduled).toLocaleDateString('vi-VN')}`
                                                : row.firstScheduled
                                                    ? new Date(row.firstScheduled).toLocaleDateString('vi-VN')
                                                    : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewGroup(row)}
                                                    className="gap-1"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                                {row.pendingCount > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveCycle(row)}
                                                        disabled={removing === row.key}
                                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Xóa chu kỳ
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Hoa hồng 10% cho người giới thiệu">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Khi user nhận thưởng (Active Power hoặc NFT hàng ngày), người giới thiệu của họ nhận 10% (USDT với Active Power và {tokenSymbol} với NFT). Danh sách dưới đây là các hoa hồng đã trả.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3">Ngày</th>
                                <th className="px-6 py-3">Người giới thiệu (referrer)</th>
                                <th className="px-6 py-3">Từ ví (referred)</th>
                                <th className="px-6 py-3">Nguồn</th>
                                <th className="px-6 py-3">Số tiền</th>
                                <th className="px-6 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-zinc-500">
                                        Chưa có hoa hồng nào hoặc không thể tải.
                                    </td>
                                </tr>
                            ) : (
                                commissions
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .slice(0, 100)
                                    .map((c) => (
                                        <tr key={c.id} className="border-b bg-white dark:border-zinc-700 dark:bg-zinc-900">
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{c.referrerWallet?.slice(0, 6)}...{c.referrerWallet?.slice(-4)}</td>
                                            <td className="px-6 py-4 font-mono text-xs">{c.fromWallet?.slice(0, 6)}...{c.fromWallet?.slice(-4)}</td>
                                            <td className="px-6 py-4">{getCommissionSourceLabel(c.source)}</td>
                                            <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                                                +{Number(c.amount).toFixed(4)} {c.tokenType === 'hero' ? tokenSymbol : (c.tokenType?.toUpperCase() ?? '')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${c.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'}`}>
                                                    {c.status === 'completed' ? 'Đã trả' : 'Chờ'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={!!viewGroup}
                onClose={() => setViewGroup(null)}
                title={viewGroup ? `${viewGroup.label} – ${viewGroup.count} kỳ trả` : ''}
                className="max-w-4xl max-h-[85vh] flex flex-col"
            >
                {viewGroup && (
                    <>
                        {viewGroup.pendingCount > 0 && (
                            <div className="flex justify-end pb-2 border-b border-zinc-200 dark:border-zinc-700">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveCycle(viewGroup)}
                                    disabled={removing === viewGroup.key}
                                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Xóa toàn bộ chu kỳ (chỉ kỳ chờ)
                                </Button>
                            </div>
                        )}
                        <div className="overflow-x-auto flex-1 min-h-0">
                            <table className="w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
                                <thead className="text-xs uppercase text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Số tiền (token)</th>
                                        <th className="px-4 py-2">Trạng thái</th>
                                        <th className="px-4 py-2">Ngày trả (dự kiến)</th>
                                        <th className="px-4 py-2">Tạo lúc</th>
                                        <th className="px-4 py-2 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewGroup.payouts.map((p) => (
                                        <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-700">
                                            <td className="px-4 py-2 font-medium">#{p.id}</td>
                                            <td className="px-4 py-2 text-green-600 dark:text-green-400">+{Number(p.amount).toFixed(4)} {getTokenLabel(viewGroup.type)}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        p.status === 'pending'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                                            : p.status === 'paid'
                                                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                                                    }`}
                                                >
                                                    {p.status === 'pending' ? 'Chờ trả' : p.status === 'paid' ? 'Đã trả' : p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {p.scheduledAt ? new Date(p.scheduledAt).toLocaleString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-4 py-2">{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                                            <td className="px-4 py-2 text-right">
                                                {p.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemovePayout(p.id)}
                                                        disabled={removing === p.id}
                                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Xóa
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

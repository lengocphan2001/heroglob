import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { withdrawalsApi, type Withdrawal } from '../api/withdrawals';
import { Check, X, ExternalLink } from 'lucide-react';

export function Withdrawals() {
    const [list, setList] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
    const [txHash, setTxHash] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [action, setAction] = useState<'approve' | 'reject'>('approve');

    const load = async () => {
        try {
            setLoading(true);
            const data = await withdrawalsApi.getAll();
            setList(data);
        } catch (e: any) {
            toast.error(e.message || 'Lỗi tải danh sách rút tiền');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openApprove = (w: Withdrawal) => {
        setSelectedWithdrawal(w);
        setAction('approve');
        setTxHash('');
        setIsModalOpen(true);
    };

    const openReject = (w: Withdrawal) => {
        setSelectedWithdrawal(w);
        setAction('reject');
        setRejectReason('');
        setIsModalOpen(true);
    };

    const handleAction = async () => {
        if (!selectedWithdrawal) return;

        try {
            setProcessing(true);
            const status = action === 'approve' ? 'completed' : 'rejected';
            await withdrawalsApi.updateStatus(selectedWithdrawal.id, status, txHash, rejectReason);
            toast.success(action === 'approve' ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu');
            setIsModalOpen(false);
            load();
        } catch (e: any) {
            toast.error(e.message || 'Lỗi khi xử lý');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Quản lý Rút tiền
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Xử lý các yêu cầu rút USDT/HERO của người dùng
                </p>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Số tiền</th>
                                <th className="px-6 py-3">Địa chỉ nhận</th>
                                <th className="px-6 py-3">Trạng thái</th>
                                <th className="px-6 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Đang tải...</td>
                                </tr>
                            ) : list.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Chưa có yêu cầu nào.</td>
                                </tr>
                            ) : (
                                list.map((w) => (
                                    <tr key={w.id} className="bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">#{w.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-mono text-zinc-400">{w.walletAddress.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                                {Number(w.amount).toLocaleString()} {w.tokenType.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 group">
                                                <span className="text-xs font-mono truncate max-w-[120px]" title={w.toAddress}>
                                                    {w.toAddress.slice(0, 10)}...{w.toAddress.slice(-6)}
                                                </span>
                                                <a
                                                    href={`https://bscscan.com/address/${w.toAddress}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="opacity-0 group-hover:opacity-100 text-blue-500"
                                                >
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                w.status === 'completed' ? 'success' :
                                                    w.status === 'pending' ? 'warning' :
                                                        w.status === 'rejected' ? 'danger' : 'default'
                                            }>
                                                {w.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {w.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="primary" onClick={() => openApprove(w)}>
                                                        <Check className="size-3 mr-1" /> Duyệt
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => openReject(w)}>
                                                        <X className="size-3 mr-1" /> Từ chối
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={action === 'approve' ? 'Duyệt yêu cầu rút tiền' : 'Từ chối yêu cầu rút tiền'}
            >
                <div className="space-y-4 pt-2">
                    {action === 'approve' ? (
                        <>
                            <p className="text-sm text-zinc-500">
                                Nhập mã giao dịch (Tx Hash) sau khi bạn đã chuyển tiền từ ví của mình.
                            </p>
                            <Input
                                label="Transaction Hash (Tx Hash)"
                                placeholder="0x..."
                                value={txHash}
                                onChange={(e) => setTxHash(e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-zinc-500">
                                Vui lòng nhập lý do từ chối. Số tiền sẽ được hoàn trả vào số dư của người dùng.
                            </p>
                            <Input
                                label="Lý do từ chối"
                                placeholder="Lý do..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button
                            variant={action === 'approve' ? 'primary' : 'danger'}
                            className="flex-1"
                            onClick={handleAction}
                            loading={processing}
                        >
                            Xác nhận {action === 'approve' ? 'Hoàn tất' : 'Từ chối'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

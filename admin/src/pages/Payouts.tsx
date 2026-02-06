import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { payoutsApi, type Payout, type PendingReward } from '../api/payouts';

export function Payouts() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
    const [selectedRewards, setSelectedRewards] = useState<PendingReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPending, setLoadingPending] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);

    useEffect(() => {
        fetchPayouts();
        fetchPendingRewards();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const data = await payoutsApi.getAll();
            setPayouts(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load payouts');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRewards = async () => {
        try {
            setLoadingPending(true);
            const data = await payoutsApi.getPending();
            setPendingRewards(data);
            setSelectedRewards([]); // Reset selection on refresh
        } catch (error) {
            console.error(error);
            toast.error('Failed to load pending rewards');
        } finally {
            setLoadingPending(false);
        }
    };

    const handleTriggerPayout = async () => {
        const isSelective = selectedRewards.length > 0;
        const confirmMsg = isSelective
            ? `Bạn có chắc chắn muốn chạy payout cho ${selectedRewards.length} mục đã chọn không?`
            : 'Bạn có chắc chắn muốn chạy payout cho TẤT CẢ các mục không?';

        if (!confirm(confirmMsg)) return;

        try {
            setIsTriggering(true);
            const res = await payoutsApi.triggerPayout(isSelective ? selectedRewards : undefined);
            if (res.success) {
                toast.success(res.message);
                fetchPayouts();
                fetchPendingRewards();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to trigger manual payout');
        } finally {
            setIsTriggering(false);
        }
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRewards([...pendingRewards]);
        } else {
            setSelectedRewards([]);
        }
    };

    const toggleSelect = (reward: PendingReward) => {
        const isSelected = selectedRewards.some(r =>
            r.userId === reward.userId &&
            r.type === reward.type &&
            r.investmentId === reward.investmentId &&
            r.nftId === reward.nftId
        );

        if (isSelected) {
            setSelectedRewards(selectedRewards.filter(r =>
                !(r.userId === reward.userId &&
                    r.type === reward.type &&
                    r.investmentId === reward.investmentId &&
                    r.nftId === reward.nftId)
            ));
        } else {
            setSelectedRewards([...selectedRewards, reward]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        Quản lý Payout
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Xem preview và thực hiện trả lãi thủ công
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchPendingRewards}
                        disabled={loadingPending || isTriggering}
                        loading={loadingPending}
                        variant="secondary"
                    >
                        Làm mới Preview
                    </Button>
                    <Button
                        onClick={handleTriggerPayout}
                        disabled={isTriggering || (pendingRewards.length === 0 && selectedRewards.length === 0)}
                        loading={isTriggering}
                        variant="primary"
                    >
                        {selectedRewards.length > 0
                            ? `Payout ${selectedRewards.length} mục đã chọn`
                            : 'Chạy Toàn Bộ Payout'}
                    </Button>
                </div>
            </div>

            {/* Pending Rewards Section */}
            <div className="space-y-2">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Phần thưởng đang chờ (Preview)
                </h2>
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                            <thead className="text-xs uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-300 dark:border-zinc-700"
                                            onChange={toggleSelectAll}
                                            checked={pendingRewards.length > 0 && selectedRewards.length === pendingRewards.length}
                                        />
                                    </th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Loại</th>
                                    <th className="px-6 py-3">Số tiền</th>
                                    <th className="px-6 py-3">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingPending ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">Đang tải preview...</td>
                                    </tr>
                                ) : pendingRewards.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">Không có phần thưởng nào đang chờ.</td>
                                    </tr>
                                ) : (
                                    pendingRewards.map((reward, idx) => (
                                        <tr
                                            key={`${reward.userId}-${reward.type}-${reward.investmentId}-${reward.nftId}-${idx}`}
                                            className="border-b bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                                    checked={selectedRewards.some(r =>
                                                        r.userId === reward.userId &&
                                                        r.type === reward.type &&
                                                        r.investmentId === reward.investmentId &&
                                                        r.nftId === reward.nftId
                                                    )}
                                                    onChange={() => toggleSelect(reward)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                {reward.userName || `User #${reward.userId}`}
                                                <div className="text-xs text-zinc-400">{reward.wallet}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${reward.type === 'rank_daily' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    reward.type === 'investment_daily' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {reward.type === 'rank_daily' ? 'Rank' :
                                                        reward.type === 'investment_daily' ? 'Investment' : 'NFT'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                                                {Number(reward.amount).toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {reward.investmentId ? `Inv #${reward.investmentId}` :
                                                    reward.nftId ? `NFT #${reward.nftId}` :
                                                        reward.metadata?.referrals ? `${reward.metadata.referrals} referrals` : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Lịch sử Payout
                </h2>
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
                            <thead className="text-xs uppercase text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Số tiền (USDT)</th>
                                    <th className="px-6 py-3">Tx Hash</th>
                                    <th className="px-6 py-3">Ngày giờ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : payouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            Chưa có payout nào.
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.map((payout) => (
                                        <tr
                                            key={payout.id}
                                            className="border-b bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                        >
                                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                                #{payout.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                {payout.user?.name || `User #${payout.userId}`}
                                                {payout.user?.walletAddress && (
                                                    <div className="text-xs text-zinc-400">
                                                        {payout.user.walletAddress.slice(0, 6)}...{payout.user.walletAddress.slice(-4)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-green-600">
                                                +{Number(payout.amount).toFixed(4)}
                                            </td>
                                            <td className="px-6 py-4 text-xs">
                                                {payout.txHash ? (
                                                    <a
                                                        href={`https://bscscan.com/tx/${payout.txHash}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {payout.txHash.slice(0, 10)}...
                                                    </a>
                                                ) : (
                                                    <span className="text-zinc-400">Internal</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(payout.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

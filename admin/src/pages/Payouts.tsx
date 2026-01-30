import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { payoutsApi, type Payout } from '../api/payouts';

export function Payouts() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    Lịch sử Payout
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Danh sách trả lãi hàng ngày
                </p>
            </div>

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
    );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/users';
import { getUserOrders } from '../api/orders';
import { getUserCommissions } from '../api/commissions';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '../components/ui/Table';
import { ArrowLeft, Wallet, User as UserIcon, Calendar, Trophy, Users as UsersIcon, ShoppingBag, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { formatPriceDisplay } from '../utils/formatPrice';

export function UserDetail() {
    const { id } = useParams<{ id: string }>();

    const { data: userData, isLoading: isLoadingUser } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUser(id!),
        enabled: !!id,
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['user-orders', userData?.walletAddress],
        queryFn: () => getUserOrders(userData?.walletAddress!),
        enabled: !!userData?.walletAddress,
    });

    const { data: commissions = [], isLoading: isLoadingCommissions } = useQuery({
        queryKey: ['user-commissions', userData?.walletAddress],
        queryFn: () => getUserCommissions(userData?.walletAddress!),
        enabled: !!userData?.walletAddress,
    });

    if (isLoadingUser) {
        return <div className="p-8 text-center text-zinc-500">Đang tải thông tin người dùng...</div>;
    }

    if (!userData) {
        return <div className="p-8 text-center text-red-500">Không tìm thấy người dùng.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/users">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Chi tiết người dùng
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="md:col-span-2 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <UserIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{userData.name}</h2>
                                <p className="text-sm text-zinc-500">{userData.email || 'Chưa cập nhật email'}</p>
                            </div>
                        </div>
                        <Badge variant={userData.role === 'admin' ? 'danger' : 'default'}>
                            {userData.role.toUpperCase()}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Địa chỉ ví</p>
                                <p className="text-sm font-mono break-all">{userData.walletAddress || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Rank</p>
                                <Badge variant="warning">{userData.rank}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Ngày tham gia</p>
                                <p className="text-sm">{format(new Date(userData.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <UsersIcon className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Mã giới thiệu (Của tôi)</p>
                                <p className="text-sm font-bold text-indigo-600">{userData.referralCode || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <UserIcon className="h-5 w-5 text-zinc-400" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold">Người giới thiệu</p>
                                {userData.referrer ? (
                                    <Link to={`/users/${userData.referrer.id}`} className="text-sm font-bold text-indigo-600 hover:underline">
                                        {userData.referrer.name}
                                    </Link>
                                ) : (
                                    <p className="text-sm">Trực tiếp</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Balances */}
                <Card className="flex flex-col justify-center space-y-6 text-center">
                    <div>
                        <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Số dư HERO</p>
                        <p className="text-3xl font-black text-indigo-600">{Number(userData.heroBalance).toLocaleString()} HERO</p>
                    </div>
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm text-zinc-500 uppercase font-bold tracking-wider">Số dư USDT</p>
                        <p className="text-3xl font-black text-emerald-600">{Number(userData.usdtBalance).toLocaleString()} USDT</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Referrals */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-indigo-500" />
                            Thành viên đã giới thiệu ({userData.referralCount})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <thead>
                                <TableRow>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Ví</TableHead>
                                    <TableHead>Ngày tham gia</TableHead>
                                </TableRow>
                            </thead>
                            <TableBody>
                                {userData.referrals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-zinc-500">Chưa giới thiệu ai.</TableCell>
                                    </TableRow>
                                ) : (
                                    userData.referrals.map((ref: any) => (
                                        <TableRow key={ref.id}>
                                            <TableCell className="font-medium">
                                                <Link to={`/users/${ref.id}`} className="hover:text-indigo-600">
                                                    {ref.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-xs font-mono">{ref.walletAddress?.slice(0, 6)}...{ref.walletAddress?.slice(-4)}</TableCell>
                                            <TableCell className="text-xs text-zinc-500">{format(new Date(ref.createdAt), 'dd/MM/yyyy')}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Orders */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-emerald-500" />
                            Lịch sử mua hàng ({orders.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <thead>
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead>Số lượng</TableHead>
                                    <TableHead>Tổng chi</TableHead>
                                </TableRow>
                            </thead>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-zinc-500">Chưa có giao dịch.</TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{order.title}</TableCell>
                                            <TableCell>x{order.quantity}</TableCell>
                                            <TableCell className="font-bold text-emerald-600">{order.totalSpent.toLocaleString()} USDT</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            {/* Commissions */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-amber-500" />
                        Lịch sử hoa hồng
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <thead>
                            <TableRow>
                                <TableHead>Từ người dùng</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Token</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thời gian</TableHead>
                            </TableRow>
                        </thead>
                        <TableBody>
                            {isLoadingCommissions ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-zinc-500">Đang tải...</TableCell>
                                </TableRow>
                            ) : commissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-zinc-500">Chưa có hoa hồng.</TableCell>
                                </TableRow>
                            ) : (
                                commissions.map((comm: any) => (
                                    <TableRow key={comm.id}>
                                        <TableCell className="text-xs font-mono">{comm.fromWallet?.slice(0, 10)}...{comm.fromWallet?.slice(-4)}</TableCell>
                                        <TableCell className="font-bold">{formatPriceDisplay(comm.amount)}</TableCell>
                                        <TableCell className="uppercase text-xs">{comm.tokenType}</TableCell>
                                        <TableCell>
                                            <Badge variant={comm.status === 'completed' ? 'success' : 'default'}>
                                                {comm.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-zinc-500">{format(new Date(comm.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}

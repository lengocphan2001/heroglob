import { useState } from 'react';
import { LucideSearch, Plus, Filter, Pencil, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';
import { getUsers, getAdminUserDetail, type User, type UserDetailPayload } from '../api/users';
import { useTokenConfig } from '../contexts/ConfigContext';
import { format } from 'date-fns';

type DetailTab = 'info' | 'payouts' | 'orders' | 'investments' | 'commissions' | 'withdrawals';

export function Users() {
  const { tokenSymbol } = useTokenConfig();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailData, setDetailData] = useState<UserDetailPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('info');

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const filtered = users.filter(
    (u: User) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.walletAddress || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleViewDetail = async (user: User) => {
    setDetailUser(user);
    setDetailData(null);
    setDetailTab('info');
    setDetailLoading(true);
    try {
      const data = await getAdminUserDetail(user.id);
      setDetailData(data);
    } catch (e) {
      toast.error('Không thể tải chi tiết người dùng');
      setDetailUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for save logic
    toast.success(editingUser ? 'Cập nhật người dùng thành công' : 'Đã thêm người dùng');
    setIsFormOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Người dùng
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quản lý tài khoản và vai trò
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên, email hoặc ví..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<LucideSearch className="h-4 w-4" />}
            />
          </div>
        </div>
        <Table>
          <thead>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ví</TableHead>
              <TableHead>USDT</TableHead>
              <TableHead>{tokenSymbol}</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                  </TableCell>
                  <TableCell>
                    {u.email || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {u.walletAddress ? (
                      <span title={u.walletAddress}>
                        {u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{Number(u.usdtBalance).toLocaleString()}</TableCell>
                  <TableCell>{Number(u.heroBalance).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      u.rank === 'max' ? 'warning' :
                        u.rank === 'legendary' ? 'warning' :
                          u.rank === 'epic' ? 'info' :
                            u.rank === 'rare' ? 'success' :
                              'default'
                    }>
                      {u.rank}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'editor' ? 'info' : 'default'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetail(u)} title="Xem chi tiết">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? 'Sửa thông tin' : 'Thêm người dùng'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-sm text-zinc-500">Chức năng đang phát triển...</p>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Họ tên
            </label>
            <Input
              defaultValue={editingUser?.name}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu
            </Button>
          </div>
        </form>
      </Modal>

      {/* User detail modal */}
      <Modal
        isOpen={!!detailUser}
        onClose={() => { setDetailUser(null); setDetailData(null); }}
        title={detailUser ? `${detailUser.name} (#${detailUser.id})` : ''}
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden p-4">
          {detailLoading ? (
            <p className="py-8 text-center text-zinc-500 dark:text-zinc-300">Đang tải...</p>
          ) : detailData ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4 border-b border-zinc-200 dark:border-zinc-600 pb-3">
                {(['info', 'payouts', 'orders', 'investments', 'commissions', 'withdrawals'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDetailTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      detailTab === tab
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {tab === 'info' && 'Thông tin'}
                    {tab === 'payouts' && `Payouts (${detailData.payouts.length})`}
                    {tab === 'orders' && `Đơn hàng (${detailData.orders.length})`}
                    {tab === 'investments' && `Đầu tư (${detailData.investments.length})`}
                    {tab === 'commissions' && `Hoa hồng (${detailData.commissions.length})`}
                    {tab === 'withdrawals' && `Rút tiền (${detailData.withdrawals.length})`}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {detailTab === 'info' && (
                  <div className="space-y-5 text-sm text-zinc-900 dark:text-zinc-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Họ tên</span><span className="font-medium">{detailData.user.name}</span></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Email</span><span className="font-medium">{detailData.user.email || '—'}</span></div>
                      <div className="sm:col-span-2"><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Ví</span><span className="font-mono text-xs break-all text-zinc-800 dark:text-zinc-200">{detailData.user.walletAddress || '—'}</span></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">USDT</span><span className="font-medium">{Number(detailData.user.usdtBalance).toLocaleString()}</span></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">{tokenSymbol}</span><span className="font-medium">{Number(detailData.user.heroBalance).toLocaleString()}</span></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Rank</span><Badge variant="default">{detailData.user.rank}</Badge></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Vai trò</span><Badge variant={detailData.user.role === 'admin' ? 'danger' : 'default'}>{detailData.user.role}</Badge></div>
                      <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Ngày tạo</span><span className="font-medium">{format(new Date(detailData.user.createdAt), 'dd/MM/yyyy HH:mm')}</span></div>
                    </div>
                    {/* Referral block */}
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-3">
                      <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">Giới thiệu</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Mã giới thiệu</span><span className="font-medium font-mono">{detailData.user.referralCode || '—'}</span></div>
                        <div className="sm:col-span-2"><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Link giới thiệu</span>
                          {detailData.user.referralCode ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs break-all text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
                                {(typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ? `${String(import.meta.env.VITE_APP_URL).replace(/\/$/, '')}?ref=${detailData.user.referralCode}` : (typeof window !== 'undefined' ? `${window.location.origin.replace(/\/$/, '')}?ref=${detailData.user.referralCode}` : `?ref=${detailData.user.referralCode}`)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) ? String(import.meta.env.VITE_APP_URL).replace(/\/$/, '') : (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '');
                                  const link = base ? `${base}?ref=${detailData.user.referralCode}` : '';
                                  if (link && detailData.user.referralCode) {
                                    navigator.clipboard.writeText(link);
                                    toast.success('Đã sao chép link');
                                  }
                                }}
                              >
                                Sao chép
                              </Button>
                            </div>
                          ) : (
                            <span className="text-zinc-500 dark:text-zinc-400">—</span>
                          )}
                        </div>
                        <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Được giới thiệu bởi</span><span className="font-medium">{detailData.referrer ? `${detailData.referrer.name} (#${detailData.referrer.id}${detailData.referrer.referralCode ? ` · ${detailData.referrer.referralCode}` : ''})` : '—'}</span></div>
                        <div><span className="text-zinc-500 dark:text-zinc-400 block mb-0.5">Số người đã giới thiệu</span><span className="font-medium">{detailData.totalReferred}</span></div>
                      </div>
                    </div>
                  </div>
                )}
                {detailTab === 'payouts' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-zinc-900 dark:text-zinc-100">
                      <thead><tr className="border-b border-zinc-200 dark:border-zinc-600 text-left"><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">ID</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Số tiền</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Loại</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Trạng thái</th><th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">Ngày trả</th></tr></thead>
                      <tbody>
                        {detailData.payouts.length === 0 ? <tr><td colSpan={5} className="py-4 text-zinc-500 dark:text-zinc-400">Không có</td></tr> : detailData.payouts.map((p) => (
                          <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-700">
                            <td className="py-2 pr-4">#{p.id}</td>
                            <td className="py-2 pr-4 text-green-600 dark:text-green-400">+{Number(p.amount).toFixed(4)}</td>
                            <td className="py-2 pr-4">{p.type}</td>
                            <td className="py-2 pr-4">{p.status}</td>
                            <td className="py-2">{p.scheduledAt ? format(new Date(p.scheduledAt), 'dd/MM/yyyy HH:mm') : format(new Date(p.createdAt), 'dd/MM/yyyy')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {detailTab === 'orders' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-zinc-900 dark:text-zinc-100">
                      <thead><tr className="border-b border-zinc-200 dark:border-zinc-600 text-left"><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">ID</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Sản phẩm</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Số tiền</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Trạng thái</th><th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">Ngày</th></tr></thead>
                      <tbody>
                        {detailData.orders.length === 0 ? <tr><td colSpan={5} className="py-4 text-zinc-500 dark:text-zinc-400">Không có</td></tr> : detailData.orders.map((o) => (
                          <tr key={o.id} className="border-b border-zinc-100 dark:border-zinc-700">
                            <td className="py-2 pr-4">#{o.id}</td>
                            <td className="py-2 pr-4">{o.product?.title ?? o.productId ?? '—'}</td>
                            <td className="py-2 pr-4">{Number(o.amount).toLocaleString()}</td>
                            <td className="py-2 pr-4">{o.status}</td>
                            <td className="py-2">{format(new Date(o.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {detailTab === 'investments' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-zinc-900 dark:text-zinc-100">
                      <thead><tr className="border-b border-zinc-200 dark:border-zinc-600 text-left"><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">ID</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Số tiền</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Lãi/ngày %</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Trạng thái</th><th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">Ngày tạo</th></tr></thead>
                      <tbody>
                        {detailData.investments.length === 0 ? <tr><td colSpan={5} className="py-4 text-zinc-500 dark:text-zinc-400">Không có</td></tr> : detailData.investments.map((inv) => (
                          <tr key={inv.id} className="border-b border-zinc-100 dark:border-zinc-700">
                            <td className="py-2 pr-4">#{inv.id}</td>
                            <td className="py-2 pr-4">{Number(inv.amount).toLocaleString()}</td>
                            <td className="py-2 pr-4">{Number(inv.dailyProfitPercent)}%</td>
                            <td className="py-2 pr-4">{inv.status}</td>
                            <td className="py-2">{format(new Date(inv.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {detailTab === 'commissions' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-zinc-900 dark:text-zinc-100">
                      <thead><tr className="border-b border-zinc-200 dark:border-zinc-600 text-left"><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">ID</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Từ ví</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Số tiền</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Trạng thái</th><th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">Ngày</th></tr></thead>
                      <tbody>
                        {detailData.commissions.length === 0 ? <tr><td colSpan={5} className="py-4 text-zinc-500 dark:text-zinc-400">Không có</td></tr> : detailData.commissions.map((c) => (
                          <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-700">
                            <td className="py-2 pr-4">#{c.id}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{c.fromWallet.slice(0, 8)}...</td>
                            <td className="py-2 pr-4 text-green-600 dark:text-green-400">+{c.amount}</td>
                            <td className="py-2 pr-4">{c.status}</td>
                            <td className="py-2">{format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {detailTab === 'withdrawals' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-zinc-900 dark:text-zinc-100">
                      <thead><tr className="border-b border-zinc-200 dark:border-zinc-600 text-left"><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">ID</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Đến</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Số tiền</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Token</th><th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">Trạng thái</th><th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">Ngày</th></tr></thead>
                      <tbody>
                        {detailData.withdrawals.length === 0 ? <tr><td colSpan={6} className="py-4 text-zinc-500 dark:text-zinc-400">Không có</td></tr> : detailData.withdrawals.map((w) => (
                          <tr key={w.id} className="border-b border-zinc-100 dark:border-zinc-700">
                            <td className="py-2 pr-4">#{w.id}</td>
                            <td className="py-2 pr-4 font-mono text-xs">{w.toAddress.slice(0, 10)}...</td>
                            <td className="py-2 pr-4">{w.amount}</td>
                            <td className="py-2 pr-4">{w.tokenType}</td>
                            <td className="py-2 pr-4">{w.status}</td>
                            <td className="py-2">{format(new Date(w.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : detailUser && !detailLoading ? (
            <p className="py-4 text-zinc-500 dark:text-zinc-300">Không tải được dữ liệu.</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  LucideTrendingUp,
  LucideUsers,
  LucideShoppingCart,
  LucideDollarSign,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getDashboardStats, type DashboardStats } from '../api/stats';

const statusVariant = {
  completed: 'success' as const,
  processing: 'info' as const,
  pending: 'warning' as const,
};

export function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = () => {
    setLoading(true);
    getDashboardStats()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const stats = [
    {
      label: 'Tổng doanh thu',
      value: data ? data.revenue.formatted : '...',
      change: '+0%', // Placeholder until historical data implemented
      icon: LucideDollarSign,
      color: 'bg-emerald-500',
    },
    {
      label: 'Người dùng',
      value: data ? data.users.total.toLocaleString() : '...',
      change: data?.users.growth || '+0%',
      icon: LucideUsers,
      color: 'bg-indigo-500',
    },
    {
      label: 'Đơn hàng',
      value: data ? data.orders.total.toLocaleString() : '...',
      change: data?.orders.growth || '+0%',
      icon: LucideShoppingCart,
      color: 'bg-amber-500',
    },
    {
      label: 'Tăng trưởng',
      value: '24.3%', // Placeholder
      change: '+4.1%',
      icon: LucideTrendingUp,
      color: 'bg-sky-500',
    },
  ];

  if (loading) return <div className="p-8 text-center text-zinc-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Đơn hàng gần đây
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Các giao dịch mới nhất từ ​​người dùng.
          </p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    {s.change} so với tháng trước
                  </p>
                </div>
                <div
                  className={
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ' +
                    s.color
                  }
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Đơn hàng gần đây" action={<span className="text-xs text-zinc-500">5 gần nhất</span>}>
        <Table>
          <thead>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {data?.recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-zinc-500">
                  Chưa có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              data?.recentOrders.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">#{row.id}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={row.customer}>{row.customer}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status as keyof typeof statusVariant] || 'default'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

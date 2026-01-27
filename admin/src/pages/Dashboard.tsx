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

const stats = [
  {
    label: 'Tổng doanh thu',
    value: '124.5M',
    change: '+12.5%',
    icon: LucideDollarSign,
    color: 'bg-emerald-500',
  },
  {
    label: 'Người dùng',
    value: '2,840',
    change: '+8.2%',
    icon: LucideUsers,
    color: 'bg-indigo-500',
  },
  {
    label: 'Đơn hàng',
    value: '1,204',
    change: '-2.4%',
    icon: LucideShoppingCart,
    color: 'bg-amber-500',
  },
  {
    label: 'Tăng trưởng',
    value: '24.3%',
    change: '+4.1%',
    icon: LucideTrendingUp,
    color: 'bg-sky-500',
  },
];

const recentOrders = [
  { id: '#ORD-001', customer: 'Nguyễn Văn A', amount: '1,250,000', status: 'completed' as const },
  { id: '#ORD-002', customer: 'Trần Thị B', amount: '890,000', status: 'processing' as const },
  { id: '#ORD-003', customer: 'Lê Văn C', amount: '2,100,000', status: 'completed' as const },
  { id: '#ORD-004', customer: 'Phạm Thị D', amount: '450,000', status: 'pending' as const },
  { id: '#ORD-005', customer: 'Hoàng Văn E', amount: '1,780,000', status: 'completed' as const },
];

const statusVariant = {
  completed: 'success' as const,
  processing: 'info' as const,
  pending: 'warning' as const,
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tổng quan hoạt động và thống kê
        </p>
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
            {recentOrders.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.amount} ₫</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[row.status]}>
                    {row.status === 'completed'
                      ? 'Hoàn thành'
                      : row.status === 'processing'
                        ? 'Đang xử lý'
                        : 'Chờ xử lý'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

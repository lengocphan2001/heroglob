import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { getOrders, type Order } from '../api/orders';

const BSC_TX = 'https://bscscan.com/tx/';

export function Orders() {
  const [list, setList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getOrders()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải đơn hàng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('vi-VN');
    } catch {
      return s;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Đơn hàng
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Danh sách đơn hàng từ giao dịch mua sản phẩm
        </p>
      </div>

      <Card>
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="py-8 text-center text-zinc-500">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Ví</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>TxHash</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-zinc-500">
                      Chưa có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">{o.id}</TableCell>
                      <TableCell className="max-w-[180px]">
                        <span className="font-mono text-xs text-zinc-500" title={String(o.productId)}>
                          {o.product?.hashId ?? `#${o.productId}`}
                        </span>
                        {o.product?.title && (
                          <span className="mt-0.5 block truncate text-sm text-zinc-700 dark:text-zinc-300">
                            {o.product.title}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate font-mono text-xs" title={o.walletAddress}>
                        {o.walletAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant={o.tokenType === 'usdt' ? 'success' : 'default'}>
                          {o.tokenType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {o.amount} {o.tokenType === 'usdt' ? 'USDT' : 'HERO'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={o.status === 'completed' ? 'success' : 'default'}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {o.txHash ? (
                          <a
                            href={`${BSC_TX}${o.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                          >
                            {o.txHash.slice(0, 10)}…
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500">
                        {formatDate(o.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

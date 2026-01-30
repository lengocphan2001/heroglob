import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Check, Eye, Bell, BellOff } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { getOrders, updateOrderStatus, type Order } from '../api/orders';

const BSC_TX = 'https://bscscan.com/tx/';
const POLL_INTERVAL = 30000; // 30 seconds

export function Orders() {
  const [list, setList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Detail Modal state
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    order: Order | null;
  }>({ open: false, order: null });

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    orderId: number | null;
    status: string;
    action: 'approve' | 'reject';
  }>({
    open: false,
    orderId: null,
    status: '',
    action: 'approve',
  });

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef<number>(0);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3');
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (!soundEnabled) {
      // Turning ON: try to play immediately to unlock audio context
      audioRef.current.play()
        .then(() => {
          // Determine if we should pause immediately or let it play? 
          // Let's let it play a short beep or just reset.
          // For this file, it's likely a short notification sound. Let it play.
          setSoundEnabled(true);
        })
        .catch(e => {
          console.error("Audio unlock failed:", e);
          alert("Không thể phát âm thanh. Vui lòng kiểm tra cài đặt trình duyệt.");
        });
    } else {
      setSoundEnabled(false);
    }
  };

  const playSound = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await getOrders();

      // Detection logic
      const pendingCount = data.filter(o => o.status === 'pending').length;

      // If we have existing list (not first load) and count increased
      if (list.length > 0 && pendingCount > lastCountRef.current) {
        playSound();
      }
      // Or just total count increased (new order of any status?)
      else if (list.length > 0 && data.length > list.length) {
        playSound();
      }

      lastCountRef.current = pendingCount;
      setList(data);
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'Lỗi tải đơn hàng');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // ... Update Status functions etc ...
  const openConfirm = (id: number, status: string) => {
    setConfirmModal({
      open: true,
      orderId: id,
      status,
      action: status === 'completed' ? 'approve' : 'reject',
    });
  };

  const handleUpdateStatus = async () => {
    const { orderId, status } = confirmModal;
    if (!orderId) return;

    setProcessing(orderId);
    setConfirmModal(prev => ({ ...prev, open: false }));

    try {
      const updated = await updateOrderStatus(orderId, status);
      setList(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Lỗi cập nhật');
    } finally {
      setProcessing(null);
      setConfirmModal(prev => ({ ...prev, open: false, orderId: null }));
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('vi-VN');
    } catch {
      return s;
    }
  };

  return (
    <div className="space-y-6">
      <OrderDetailModal
        isOpen={detailModal.open}
        order={detailModal.order}
        onClose={() => setDetailModal({ open: false, order: null })}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.action === 'approve' ? 'Duyệt đơn hàng?' : 'Từ chối đơn hàng?'}
        description={confirmModal.action === 'approve'
          ? 'Bạn có chắc chắn muốn xác nhận đơn hàng này đã thanh toán thành công?'
          : 'Bạn có chắc chắn muốn từ chối đơn hàng này?'}
        cancelText="Hủy"
        confirmText={confirmModal.action === 'approve' ? 'Xác nhận' : 'Từ chối'}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={handleUpdateStatus}
        variant={confirmModal.action === 'approve' ? 'primary' : 'danger' as any}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Đơn hàng
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Danh sách đơn hàng. Tự động làm mới mỗi 30s.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={toggleSound}
          title={soundEnabled ? "Tắt thông báo âm thanh" : "Bật thông báo âm thanh"}
        >
          {soundEnabled ? (
            <><Bell className="mr-2 h-4 w-4" /> Bật âm thanh</>
          ) : (
            <><BellOff className="mr-2 h-4 w-4" /> Tắt âm thanh</>
          )}
        </Button>
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
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
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
                        <Badge variant={
                          o.status === 'completed' ? 'success' :
                            o.status === 'pending' ? 'warning' : 'default'
                        }>
                          {o.status === 'completed' ? 'Hoàn thành' :
                            o.status === 'pending' ? 'Chờ xử lý' :
                              o.status === 'rejected' ? 'Đã hủy' : o.status}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDetailModal({ open: true, order: o })}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {o.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openConfirm(o.id, 'completed')}
                              loading={processing === o.id}
                              title="Duyệt"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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

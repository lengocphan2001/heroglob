
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { type Order } from '../../api/orders';

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
    if (!order) return null;

    const formatDate = (s: string) => {
        try {
            return new Date(s).toLocaleString('vi-VN');
        } catch {
            return s;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết đơn hàng #${order.id}`}>
            <div className="space-y-4">
                {/* Helper to show row of Key: Value */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="font-medium text-zinc-500">Mã đơn hàng:</div>
                    <div className="col-span-2 font-mono text-zinc-900 dark:text-zinc-100">{order.id}</div>

                    <div className="font-medium text-zinc-500">Khách hàng (Ví):</div>
                    <div className="col-span-2 break-all font-mono text-zinc-900 dark:text-zinc-100">{order.walletAddress}</div>

                    <div className="font-medium text-zinc-500">Sản phẩm:</div>
                    <div className="col-span-2 text-zinc-900 dark:text-zinc-100">
                        {order.productId ? (
                            <>
                                <div>ID: {order.product?.hashId ?? `#${order.productId}`}</div>
                                {order.product?.title && <div className="text-zinc-500">{order.product.title}</div>}
                            </>
                        ) : (
                            <span className="italic text-zinc-400">Không có (Kích hoạt nguồn)</span>
                        )}
                    </div>

                    <div className="font-medium text-zinc-500">Số tiền:</div>
                    <div className="col-span-2 font-bold text-zinc-900 dark:text-zinc-100">
                        {order.amount} {order.tokenType.toUpperCase()}
                    </div>

                    <div className="font-medium text-zinc-500">Transaction Hash:</div>
                    <div className="col-span-2">
                        {order.txHash ? (
                            <a
                                href={`https://bscscan.com/tx/${order.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-[var(--color-primary)] hover:underline"
                            >
                                {order.txHash}
                            </a>
                        ) : (
                            <span className="text-zinc-400">---</span>
                        )}
                    </div>

                    <div className="font-medium text-zinc-500">Trạng thái:</div>
                    <div className="col-span-2">
                        <Badge variant={
                            order.status === 'completed' ? 'success' :
                                order.status === 'pending' ? 'warning' : 'default'
                        }>
                            {order.status}
                        </Badge>
                    </div>

                    <div className="font-medium text-zinc-500">Ngày tạo:</div>
                    <div className="col-span-2 text-zinc-900 dark:text-zinc-100">{formatDate(order.createdAt)}</div>
                </div>
            </div>
        </Modal>
    );
}

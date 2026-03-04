'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, TriangleAlert } from 'lucide-react';

export type TxStatus = 'confirming' | 'pending' | 'success' | 'error';

export type TransactionModalProps = {
  open: boolean;
  status: TxStatus;
  amountDisplay: string;
  tokenLabel: string;
  productTitle?: string;
  txHash?: string | null;
  explorerTxUrl?: string;
  error?: string | null;
  onClose: () => void;
  /** Khi có: bước "đọc kỹ" hiển thị trước, user bấm "Mở ví" mới gửi giao dịch. Tránh nhầm 2e-15 / $0 trong ví. */
  onConfirmTransfer?: () => void | Promise<void>;
};

export function TransactionModal({
  open,
  status,
  amountDisplay,
  tokenLabel,
  productTitle,
  txHash,
  explorerTxUrl,
  error,
  onClose,
  onConfirmTransfer,
}: TransactionModalProps) {
  const [openingWallet, setOpeningWallet] = useState(false);
  const transferStartedRef = useRef(false);

  useEffect(() => {
    if (open) transferStartedRef.current = false;
  }, [open]);

  if (!open) return null;

  const isPreConfirm = status === 'confirming' && onConfirmTransfer != null;

  const statusConfig = {
    confirming: {
      icon: isPreConfirm ? (
        <TriangleAlert className="size-12 text-amber-500" aria-hidden />
      ) : (
        <Loader2 className="size-12 animate-spin text-[var(--color-primary-wallet)]" aria-hidden />
      ),
      title: isPreConfirm ? 'Đọc kỹ trước khi mở ví' : 'Chờ xác nhận',
      message: isPreConfirm
        ? 'Sau khi bấm "Mở ví", cửa sổ ví sẽ mở.'
        : 'Vui lòng xác nhận giao dịch trong ví của bạn.',
    },
    pending: {
      icon: <Loader2 className="size-12 animate-spin text-amber-500" aria-hidden />,
      title: 'Đang xử lý',
      message: 'Giao dịch đã gửi, đang chờ xác nhận trên blockchain.',
    },
    success: {
      icon: <CheckCircle className="size-12 text-emerald-500" aria-hidden />,
      title: 'Thành công',
      message: 'Thanh toán đã hoàn tất. Đơn hàng đã được ghi nhận.',
    },
    error: {
      icon: <XCircle className="size-12 text-red-500" aria-hidden />,
      title: 'Thất bại',
      message: error ?? 'Giao dịch thất bại.',
    },
  };

  const config = statusConfig[status];

  const handleOpenWallet = async () => {
    if (!onConfirmTransfer || openingWallet) return;
    if (transferStartedRef.current) return;
    transferStartedRef.current = true;
    setOpeningWallet(true);
    try {
      await onConfirmTransfer();
    } finally {
      setOpeningWallet(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-surface)] p-6 shadow-xl dark:border-[var(--color-border-dark)] dark:bg-[var(--color-surface-dark)]"
        role="dialog"
        aria-modal
        aria-labelledby="tx-modal-title"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex justify-center">{config.icon}</div>
          <h3 id="tx-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {config.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{config.message}</p>

          <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[var(--color-border-dark)] dark:bg-white/5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Số tiền: <strong className="text-slate-900 dark:text-slate-100">{amountDisplay} {tokenLabel}</strong>
            </p>
            {productTitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{productTitle}</p>
            )}
            {status === 'confirming' && !isPreConfirm && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Trên ví có thể hiển thị số khác; số tiền thực tế là {amountDisplay} {tokenLabel}.
              </p>
            )}
          </div>
          {txHash && explorerTxUrl && (
            <a
              href={explorerTxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-medium text-[var(--color-primary-wallet)] hover:underline"
            >
              Xem trên Explorer
            </a>
          )}
          <div className="mt-6 flex w-full flex-col gap-2">
            {isPreConfirm ? (
              <>
                <button
                  type="button"
                  onClick={handleOpenWallet}
                  disabled={openingWallet}
                  className="w-full rounded-xl bg-[var(--color-primary-wallet)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary-wallet)]/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {openingWallet ? 'Đang mở ví…' : 'Mở ví để thanh toán'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-[var(--color-primary-wallet)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary-wallet)]/25 transition hover:brightness-110"
              >
                {status === 'success' || status === 'error' ? 'Đóng' : 'Hủy'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowLeft, ChevronDown, ChevronRight, Users, User } from 'lucide-react';

export type TreeNode = {
  wallet: string;
  name?: string | null;
  level: number;
  joinedAt?: string | null;
  children: TreeNode[];
};

function formatAddress(addr: string) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function TreeLevel({
  node,
  isRoot,
  defaultExpanded = true,
}: {
  node: TreeNode;
  isRoot?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const levelLabel = node.level === 0 ? 'Bạn' : `F${node.level}`;

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          isRoot
            ? 'border-[var(--color-primary-wallet)]/50 bg-[var(--color-primary-wallet)]/10 dark:bg-[var(--color-primary-wallet)]/20'
            : 'border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)]'
        }`}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500"
          aria-expanded={expanded}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-wallet)]">
              {levelLabel}
            </span>
            {node.name && (
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{node.name}</span>
            )}
          </div>
          <p className="font-mono text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">
            {formatAddress(node.wallet)}
          </p>
          {node.joinedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Tham gia {new Date(node.joinedAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
        {hasChildren && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {node.children.length} tuyến dưới
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-4 mt-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
          {node.children.map((child) => (
            <TreeLevel key={child.wallet} node={child} defaultExpanded={child.level < 2} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReferralTreePage() {
  const router = useRouter();
  const { address } = useWallet();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/referrals/tree?walletAddress=${encodeURIComponent(address)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.wallet) setTree(data);
        else setTree(null);
      })
      .catch(() => setError('Không thể tải cây phân cấp'))
      .finally(() => setLoading(false));
  }, [address, router]);

  const totalNodes = (node: TreeNode): number =>
    1 + node.children.reduce((sum, c) => sum + totalNodes(c), 0);

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-background)] dark:bg-[var(--color-background-dark)]">
      <div className="sticky top-0 z-10 glass-light px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/referrals"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex-1">
            Cây phân cấp
          </h1>
          <div className="w-10" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Mạng lưới tuyến dưới của bạn (F1, F2, F3...)
        </p>
      </div>

      <div className="flex-1 px-4 pb-24 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-wallet)] border-t-transparent"
              aria-hidden
            />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <Link href="/referrals" className="mt-4 inline-block text-sm text-[var(--color-primary-wallet)] font-semibold">
              Quay lại Giới thiệu
            </Link>
          </div>
        ) : tree && totalNodes(tree) === 1 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-[var(--color-border-dark)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] py-16 px-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[var(--color-primary-wallet)]/10">
              <Users className="h-8 w-8 text-[var(--color-primary-wallet)]" />
            </div>
            <p className="font-medium text-slate-700 dark:text-slate-300">Chưa có tuyến dưới</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Chia sẻ mã giới thiệu để mở rộng mạng lưới
            </p>
            <Link
              href="/referrals"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary-wallet)] px-5 py-2.5 font-semibold text-white"
            >
              Đến trang Giới thiệu
            </Link>
          </div>
        ) : tree ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Tổng số thành viên trong mạng</span>
              <span className="text-lg font-bold text-[var(--color-primary-wallet)]">{totalNodes(tree)}</span>
            </div>
            <TreeLevel node={tree} isRoot defaultExpanded={true} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

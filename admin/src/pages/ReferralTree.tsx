import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getReferralTree, type TreeNode } from '../api/referrals';
import { toast } from 'sonner';
import { GitBranch, ChevronDown, ChevronRight, User, Users, Search } from 'lucide-react';

function formatWallet(addr: string) {
  if (!addr) return '—';
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
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
  const levelLabel = node.level === 0 ? 'Gốc' : `F${node.level}`;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
          isRoot
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20'
            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        }`}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((e) => !e)}
          className="flex size-8 shrink-0 items-center justify-center rounded border border-zinc-200 dark:border-zinc-600 text-zinc-500"
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mr-2">
            {levelLabel}
          </span>
          {node.name && (
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{node.name}</span>
          )}
          <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5" title={node.wallet}>
            {formatWallet(node.wallet)}
          </p>
          {node.joinedAt && (
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(node.joinedAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
        {hasChildren && (
          <span className="text-xs text-zinc-500 shrink-0">{node.children.length} tuyến dưới</span>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-6 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-1">
          {node.children.map((child) => (
            <TreeLevel key={child.wallet} node={child} defaultExpanded={child.level < 2} />
          ))}
        </div>
      )}
    </div>
  );
}

function totalNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + totalNodes(c), 0);
}

export function ReferralTree() {
  const [wallet, setWallet] = useState('');
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    const w = wallet.trim();
    if (!w) {
      toast.error('Nhập địa chỉ ví');
      return;
    }
    setLoading(true);
    setTree(null);
    try {
      const data = await getReferralTree(w);
      setTree(data);
      if (data.wallet) {
        toast.success('Đã tải cây phân cấp');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Không thể tải cây phân cấp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Cây phân cấp</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Xem mạng lưới tuyến dưới (F1, F2, F3...) của một địa chỉ ví
        </p>
      </div>

      <Card title="Chọn ví (gốc cây)">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[280px]">
            <Input
              label="Địa chỉ ví"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleLoad}
            disabled={loading}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Đang tải...' : 'Xem cây'}
          </Button>
        </div>
      </Card>

      {tree && (
        <Card title="Kết quả">
          {!tree.wallet ? (
            <p className="text-zinc-500 dark:text-zinc-400">Không có dữ liệu. Kiểm tra địa chỉ ví.</p>
          ) : totalNodes(tree) === 1 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Users className="h-12 w-12 text-zinc-400 mb-4" />
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Ví này chưa có tuyến dưới</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-3 mb-4">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Tổng thành viên trong mạng</span>
                <span className="text-xl font-bold text-[var(--color-primary)]">{totalNodes(tree)}</span>
              </div>
              <TreeLevel node={tree} isRoot defaultExpanded={true} />
            </>
          )}
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LucideSearch, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { getProducts, deleteProduct, type Product } from '../api/products';
import { formatPriceDisplay } from '../utils/formatPrice';

export function Products() {
  const navigate = useNavigate();
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getProducts()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    setDeletingId(id);
    deleteProduct(id)
      .then(() => load())
      .catch((e) => alert(e instanceof Error ? e.message : 'Xóa thất bại'))
      .finally(() => setDeletingId(null));
  };

  const filtered = list.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.creatorHandle.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Sản phẩm (Explore)
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quản lý sản phẩm hiển thị trên trang Explore
          </p>
        </div>
        <Link to="/products/new">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên hoặc creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<LucideSearch className="h-4 w-4" />}
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="py-8 text-center text-zinc-500">Đang tải...</p>
        ) : (
          <Table>
            <thead>
              <TableRow>
                <TableHead>Hình</TableHead>
                <TableHead>Hash ID</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>USDT</TableHead>
                <TableHead>HERO</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Live</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </thead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                    Chưa có sản phẩm nào. Nhấn &quot;Thêm sản phẩm&quot; để tạo.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div
                        className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-100 bg-cover bg-center"
                        style={{ backgroundImage: `url(${p.imageUrl})` }}
                      />
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate font-mono text-xs text-zinc-500" title={p.hashId ?? ''}>
                      {p.hashId ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>@{p.creatorHandle}</TableCell>
                    <TableCell>
                      {formatPriceDisplay(p.priceUsdt ?? '0')} USDT
                    </TableCell>
                    <TableCell>
                      {formatPriceDisplay(p.priceHero ?? '0')} HERO
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Badge variant={p.live ? 'success' : 'default'}>
                        {p.live ? 'Live' : '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(p.id)}
                        loading={deletingId === p.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

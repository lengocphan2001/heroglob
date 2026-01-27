import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../api/categories';

export function Categories() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ slug: '', name: '', sortOrder: 0 });

  const load = () => {
    setLoading(true);
    setError(null);
    getCategories()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải danh mục'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (editingId == null) {
      setForm({ slug: '', name: '', sortOrder: 0 });
      return;
    }
    const c = list.find((x) => x.id === editingId);
    if (c) setForm({ slug: c.slug, name: c.name, sortOrder: c.sortOrder });
  }, [editingId, list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.trim() || !form.name.trim()) return;
    setSaving(true);
    const payload = { slug: form.slug.trim(), name: form.name.trim(), sortOrder: form.sortOrder };
    (editingId
      ? updateCategory(editingId, payload)
      : createCategory(payload)
    )
      .then(() => {
        load();
        setEditingId(null);
        setForm({ slug: '', name: '', sortOrder: 0 });
      })
      .catch((e) => alert(e instanceof Error ? e.message : 'Lỗi'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Xóa danh mục này? Sản phẩm đang dùng sẽ giữ nguyên giá trị danh mục cũ.')) return;
    setDeletingId(id);
    deleteCategory(id)
      .then(() => load())
      .catch((e) => alert(e instanceof Error ? e.message : 'Xóa thất bại'))
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Danh mục sản phẩm
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Quản lý danh mục dùng cho sản phẩm (Explore)
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
          <div className="w-48">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Slug
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="digital-art"
              required
            />
          </div>
          <div className="w-48">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tên hiển thị
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Digital Art"
              required
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Thứ tự
            </label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </div>
          <Button type="submit" variant="primary" loading={saving}>
            {editingId ? 'Cập nhật' : 'Thêm danh mục'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
              Hủy
            </Button>
          )}
        </form>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {loading ? (
          <p className="py-8 text-center text-zinc-500">Đang tải...</p>
        ) : (
          <Table>
            <thead>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </thead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-zinc-500">
                    Chưa có danh mục. Thêm danh mục bên trên.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.id}</TableCell>
                    <TableCell className="font-mono text-sm">{c.slug}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.sortOrder}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(c.id)}
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(c.id)}
                        loading={deletingId === c.id}
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

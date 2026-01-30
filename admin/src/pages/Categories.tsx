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
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { toast } from 'sonner';
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

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ slug: '', name: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories()
      .then(setList)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi tải danh mục'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ slug: '', name: '', sortOrder: 0 });
    setIsFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ slug: c.slug, name: c.name, sortOrder: c.sortOrder });
    setIsFormOpen(true);
  };

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
        toast.success(editingId ? 'Cập nhật thành công' : 'Đã thêm danh mục');
        load();
        setIsFormOpen(false);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi'))
      .finally(() => setSaving(false));
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    setDeleting(true);
    deleteCategory(deleteId)
      .then(() => {
        toast.success('Đã xóa danh mục');
        load();
        setDeleteId(null);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Xóa thất bại'))
      .finally(() => setDeleting(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Danh mục sản phẩm
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quản lý danh mục dùng cho sản phẩm (Explore)
          </p>
        </div>
        <Button onClick={openCreate} variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card>
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
                    Chưa có danh mục.
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => confirmDelete(c.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
          <div>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Thứ tự
            </label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa danh mục?"
        description="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        isLoading={deleting}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { LucideSearch, Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';
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
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { toast } from 'sonner';
import {
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  type Product,
  type CreateProductPayload
} from '../api/products';
import { getCategories } from '../api/categories';
import { formatPriceDisplay } from '../utils/formatPrice';

const defaultForm: CreateProductPayload = {
  title: '',
  description: '',
  imageUrl: '',
  creatorAvatarUrl: '',
  creatorHandle: '',
  priceUsdt: '0',
  priceHero: '0',
  priceVariant: 'dark',
  category: 'all',
  live: false,
};

export function Products() {
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(defaultForm);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setList)
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    getCategories()
      .then((list) =>
        setCategories([
          { id: 'all', slug: 'all', name: 'All' },
          ...list.map((c) => ({ id: c.slug, slug: c.slug, name: c.name })),
        ]),
      )
      .catch(() => { });
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? '',
      imageUrl: p.imageUrl,
      creatorAvatarUrl: p.creatorAvatarUrl ?? '',
      creatorHandle: p.creatorHandle,
      priceUsdt: p.priceUsdt ?? '0',
      priceHero: p.priceHero ?? '0',
      priceVariant: (p.priceVariant as 'primary' | 'dark') || 'dark',
      category: p.category || 'all',
      live: p.live,
    });
    setIsFormOpen(true);
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    setDeleting(true);
    deleteProduct(deleteId)
      .then(() => {
        toast.success("Đã xóa sản phẩm");
        load();
        setDeleteId(null);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Xóa thất bại'))
      .finally(() => setDeleting(false));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload ảnh thất bại');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, creatorAvatarUrl: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload avatar thất bại');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      description: form.description || null,
      creatorAvatarUrl: form.creatorAvatarUrl || null,
      category: form.category || 'all',
      priceVariant: form.priceVariant || 'dark',
      priceUsdt: form.priceUsdt ?? '0',
      priceHero: form.priceHero ?? '0',
    };
    (editingId ? updateProduct(editingId, payload) : createProduct(payload))
      .then(() => {
        toast.success(editingId ? 'Cập nhật thành công' : 'Đã tạo sản phẩm');
        load();
        setIsFormOpen(false);
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Lỗi lưu');
      })
      .finally(() => setSaving(false));
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
        <Button onClick={openCreate} variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(p)}
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => confirmDelete(p.id)}
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

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-1">
          <Input
            label="Tiêu đề"
            name="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="Aetheria Shard #042"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Mô tả (tùy chọn)
            </label>
            <textarea
              name="description"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Hình ảnh sản phẩm <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
              {form.imageUrl ? (
                <div className="relative shrink-0">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg border border-zinc-200 object-cover dark:border-zinc-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -right-2 -top-2 bg-white shadow-sm dark:bg-zinc-800"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                  >
                    ×
                  </Button>
                </div>
              ) : null}
              <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
                {uploadingImage ? (
                  <span className="text-xs text-zinc-500">Đang tải lên...</span>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-zinc-400" />
                    <span className="text-center text-xs text-zinc-500">
                      {form.imageUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Creator handle (@handle)"
              name="creatorHandle"
              value={form.creatorHandle}
              onChange={(e) => setForm((f) => ({ ...f, creatorHandle: e.target.value }))}
              required
              placeholder="nova"
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Avatar creator (tùy chọn)
              </label>
              <div className="flex items-start gap-4">
                {form.creatorAvatarUrl ? (
                  <div className="relative shrink-0">
                    <img
                      src={form.creatorAvatarUrl}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-600"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -right-1 -top-1 h-5 w-5 p-0 text-xs bg-white rounded-full shadow-sm dark:bg-zinc-800"
                      onClick={() => setForm((f) => ({ ...f, creatorAvatarUrl: '' }))}
                    >
                      ×
                    </Button>
                  </div>
                ) : null}
                <label className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-indigo-500">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarUpload}
                  />
                  <ImagePlus className="h-4 w-4 text-zinc-400" />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá USDT"
              name="priceUsdt"
              type="text"
              inputMode="decimal"
              value={form.priceUsdt ?? '0'}
              onChange={(e) => setForm((f) => ({ ...f, priceUsdt: e.target.value || '0' }))}
              placeholder="0"
            />
            <Input
              label="Giá HERO"
              name="priceHero"
              type="text"
              inputMode="decimal"
              value={form.priceHero ?? '0'}
              onChange={(e) => setForm((f) => ({ ...f, priceHero: e.target.value || '0' }))}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kiểu giá (màu badge)
              </label>
              <select
                name="priceVariant"
                value={form.priceVariant ?? 'dark'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceVariant: e.target.value as 'primary' | 'dark' }))
                }
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="dark">Dark</option>
                <option value="primary">Primary</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Danh mục
              </label>
              <select
                name="category"
                value={form.category ?? 'all'}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="live"
              checked={form.live ?? false}
              onChange={(e) => setForm((f) => ({ ...f, live: e.target.checked }))}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
            />
            <label htmlFor="live" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Hiển thị badge Live
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" loading={saving} className="flex-1">
              {editingId ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        description="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        isLoading={deleting}
      />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
  getProduct,
  createProduct,
  updateProduct,
  uploadProductImage,
  type CreateProductPayload,
} from '../api/products';
import { getCategories } from '../api/categories';
import { ImagePlus } from 'lucide-react';

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

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateProductPayload>(defaultForm);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setError(null);
    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload ảnh thất bại');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setError(null);
    setUploadingAvatar(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, creatorAvatarUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload avatar thất bại');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    getCategories()
      .then((list) =>
        setCategories([
          { id: 'all', slug: 'all', name: 'All' },
          ...list.map((c) => ({ id: c.slug, slug: c.slug, name: c.name })),
        ]),
      )
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(Number(id))
      .then((p) =>
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
        }),
      )
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    (isEdit ? updateProduct(Number(id), payload) : createProduct(payload))
      .then(() => navigate('/products'))
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Lỗi lưu');
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        </h1>
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Sản phẩm sẽ hiển thị trên trang Explore (FE)
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Input
            label="Tiêu đề"
            name="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="Hero Global Shard #042"
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
                    className="absolute -right-2 -top-2"
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

          <Input
            label="Creator handle (hiển thị @handle)"
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
                    className="h-16 w-16 rounded-full border border-zinc-200 object-cover dark:border-zinc-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -right-1 -top-1 text-xs"
                    onClick={() => setForm((f) => ({ ...f, creatorAvatarUrl: '' }))}
                  >
                    ×
                  </Button>
                </div>
              ) : null}
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-indigo-500">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarUpload}
                />
                {uploadingAvatar ? (
                  <span className="text-[10px] text-zinc-500">...</span>
                ) : (
                  <ImagePlus className="h-5 w-5 text-zinc-400" />
                )}
              </label>
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

          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={saving}>
              {isEdit ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
              Hủy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

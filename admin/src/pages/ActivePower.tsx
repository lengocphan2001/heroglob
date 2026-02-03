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
    getPackages,
    createPackage,
    updatePackage,
    deletePackage,
    type ActivePowerPackage,
} from '../api/active-power';

export function ActivePower() {
    const [list, setList] = useState<ActivePowerPackage[]>([]);
    const [loading, setLoading] = useState(true);

    // Form Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: '',
        price: '',
        dailyProfitPercent: '',
        durationDays: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const load = () => {
        setLoading(true);
        getPackages()
            .then(setList)
            .catch((e) => toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', price: '', dailyProfitPercent: '', durationDays: 0, isActive: true });
        setIsFormOpen(true);
    };

    const openEdit = (c: ActivePowerPackage) => {
        setEditingId(c.id);
        setForm({
            name: c.name,
            price: c.price,
            dailyProfitPercent: c.dailyProfitPercent,
            durationDays: c.durationDays,
            isActive: c.isActive
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        const payload = { ...form };
        (editingId
            ? updatePackage(editingId, payload)
            : createPackage(payload)
        )
            .then(() => {
                toast.success(editingId ? 'Cập nhật thành công' : 'Đã thêm gói');
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
        deletePackage(deleteId)
            .then(() => {
                toast.success('Đã xóa gói');
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
                        Active Power Packages
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Quản lý các gói Active Power
                    </p>
                </div>
                <Button onClick={openCreate} variant="primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm gói mới
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
                                <TableHead>Tên gói</TableHead>
                                <TableHead>Giá (USDT)</TableHead>
                                <TableHead>Lợi nhuận (%)</TableHead>
                                <TableHead>Thời hạn (Ngày)</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </thead>
                        <TableBody>
                            {list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-zinc-500">
                                        Chưa có gói nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-mono text-sm">{c.id}</TableCell>
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell>{Number(c.price).toFixed(2)}</TableCell>
                                        <TableCell>{c.dailyProfitPercent}%</TableCell>
                                        <TableCell>{c.durationDays}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
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
                title={editingId ? 'Cập nhật gói' : 'Thêm gói mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Tên gói
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Gói cơ bản"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Giá (USDT)
                        </label>
                        <Input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            placeholder="100"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Lợi nhuận hàng ngày (%)
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={form.dailyProfitPercent}
                            onChange={(e) => setForm((f) => ({ ...f, dailyProfitPercent: e.target.value }))}
                            placeholder="1.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Thời hạn (Ngày)
                        </label>
                        <Input
                            type="number"
                            value={form.durationDays}
                            onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) || 0 }))}
                            placeholder="30"
                            required
                        />
                    </div>
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kích hoạt</span>
                        </label>
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
                title="Xóa gói?"
                description="Bạn có chắc chắn muốn xóa gói này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                isLoading={deleting}
            />
        </div>
    );
}

import { useState } from 'react';
import { LucideSearch, Plus, Filter, Pencil, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { toast } from 'sonner';

import { useQuery } from '@tanstack/react-query';
import { getUsers, type User } from '../api/users';
import { format } from 'date-fns';

export function Users() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const filtered = users.filter(
    (u: User) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.walletAddress || '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for save logic
    toast.success(editingUser ? 'Cập nhật người dùng thành công' : 'Đã thêm người dùng');
    setIsFormOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Người dùng
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Quản lý tài khoản và vai trò
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Bộ lọc
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên, email hoặc ví..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<LucideSearch className="h-4 w-4" />}
            />
          </div>
        </div>
        <Table>
          <thead>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ví</TableHead>
              <TableHead>USDT</TableHead>
              <TableHead>HERO</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-zinc-500">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                  </TableCell>
                  <TableCell>
                    {u.email || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {u.walletAddress ? (
                      <span title={u.walletAddress}>
                        {u.walletAddress.slice(0, 6)}...{u.walletAddress.slice(-4)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{Number(u.usdtBalance).toLocaleString()}</TableCell>
                  <TableCell>{Number(u.heroBalance).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      u.rank === 'max' ? 'warning' :
                        u.rank === 'legendary' ? 'warning' :
                          u.rank === 'epic' ? 'info' :
                            u.rank === 'rare' ? 'success' :
                              'default'
                    }>
                      {u.rank}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'editor' ? 'info' : 'default'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {format(new Date(u.createdAt), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/users/${u.id}`}>
                        <Button variant="ghost" size="icon" title="Chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? 'Sửa thông tin' : 'Thêm người dùng'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-sm text-zinc-500">Chức năng đang phát triển...</p>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Họ tên
            </label>
            <Input
              defaultValue={editingUser?.name}
              placeholder="Nhập họ tên"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Lưu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

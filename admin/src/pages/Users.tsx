import { useState } from 'react';
import { LucideSearch } from 'lucide-react';
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

const mockUsers = [
  { id: '1', name: 'Nguyễn Văn A', email: 'a@example.com', role: 'admin', status: 'active' as const },
  { id: '2', name: 'Trần Thị B', email: 'b@example.com', role: 'editor', status: 'active' as const },
  { id: '3', name: 'Lê Văn C', email: 'c@example.com', role: 'user', status: 'inactive' as const },
  { id: '4', name: 'Phạm Thị D', email: 'd@example.com', role: 'user', status: 'active' as const },
  { id: '5', name: 'Hoàng Văn E', email: 'e@example.com', role: 'editor', status: 'active' as const },
];

export function Users() {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

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
      </div>

      <Card>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<LucideSearch className="h-4 w-4" />}
            />
          </div>
          <Button variant="primary">Thêm người dùng</Button>
        </div>
        <Table>
          <thead>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </thead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-zinc-500">
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'editor' ? 'info' : 'default'}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.status === 'active' ? 'success' : 'default'}>
                    {u.status === 'active' ? 'Hoạt động' : 'Tắt'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Sửa
                  </Button>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

import type { ComponentType } from 'react';
import { LayoutDashboard, Users, Package, FolderTree, ShoppingBag, Settings, Banknote } from 'lucide-react';

export type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Người dùng', path: '/users', icon: Users },
  { label: 'Danh mục', path: '/categories', icon: FolderTree },
  { label: 'Sản phẩm (Explore)', path: '/products', icon: Package },
  { label: 'Đơn hàng', path: '/orders', icon: ShoppingBag },
  { label: 'Lịch sử Payout', path: '/payouts', icon: Banknote },
  { label: 'Cài đặt', path: '/settings', icon: Settings },
];

export function getBreadcrumb(pathname: string): { label: string; path?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard', path: '/dashboard' }];
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'Người dùng',
    categories: 'Danh mục',
    products: 'Sản phẩm',
    orders: 'Đơn hàng',
    payouts: 'Lịch sử Payout',
    settings: 'Cài đặt',
    new: 'Thêm mới',
    edit: 'Chỉnh sửa',
  };
  const result: { label: string; path?: string }[] = [];
  let acc = '';
  for (const seg of segments) {
    acc += '/' + seg;
    const label = map[seg] ?? seg;
    result.push({ label, path: result.length === segments.length - 1 ? undefined : acc });
  }
  return result;
}

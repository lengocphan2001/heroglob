import { ChevronDown, LogOut, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBreadcrumb } from '../../config/nav';
import { Dropdown } from '../ui/Dropdown';

type HeaderProps = {
  title?: string;
  pathname?: string;
};

export function Header({ title, pathname: pathnameProp }: HeaderProps) {
  const { pathname: locationPath } = useLocation();
  const pathname = pathnameProp ?? locationPath;
  const { user, logout } = useAuth();
  const breadcrumbs = getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-zinc-400 dark:text-zinc-500" aria-hidden>
                /
              </span>
            )}
            {b.path ? (
              <Link
                to={b.path}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {b.label}
              </Link>
            ) : (
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {title ?? b.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Dropdown
          align="right"
          trigger={
            <span className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </div>
              <span className="max-w-[120px] truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {user?.name ?? user?.email}
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </span>
          }
          items={[
            {
              label: 'Hồ sơ',
              icon: <User className="h-4 w-4" />,
              onClick: () => {},
            },
            {
              label: 'Đăng xuất',
              icon: <LogOut className="h-4 w-4" />,
              onClick: logout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}

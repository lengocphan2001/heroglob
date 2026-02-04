import Link from 'next/link';
import { useConfig } from '@/contexts/ConfigContext';

export function Header() {
  const { projectName } = useConfig();
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-100">
          {projectName}
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Trang chủ
          </Link>
        </nav>
      </div>
    </header>
  );
}

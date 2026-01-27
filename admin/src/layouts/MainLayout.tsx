import { Outlet, useLocation } from 'react-router-dom';
import { Header, Sidebar } from '../components/layout';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="pl-60">
        <Header pathname={location.pathname} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

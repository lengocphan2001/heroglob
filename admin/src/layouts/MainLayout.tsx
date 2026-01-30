import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header, Sidebar } from '../components/layout';
import { cn } from '../utils/cn';

export function MainLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className={cn("transition-all duration-300 ease-in-out", isCollapsed ? "pl-20" : "pl-64")}>
        <Header pathname={location.pathname} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

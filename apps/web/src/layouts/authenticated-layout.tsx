import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Sidebar, Header } from '@/components/shell';
import { cn } from '@/lib/utils';

export function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className={cn(
            'flex-1 overflow-auto',
            'p-4 md:p-6 lg:p-8'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/nav/Sidebar';
import { Topbar } from '@/components/nav/Topbar';
import { ToastContainer } from '@/components/ui/toast';
import { useToasts } from '@/store/ui';
import { setToastStore } from '@/lib/toast';
import { useEffect } from 'react';

export function AppLayout() {
  const toastStore = useToasts();

  // Initialize toast store for standalone functions
  useEffect(() => {
    setToastStore(toastStore);
  }, [toastStore]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}

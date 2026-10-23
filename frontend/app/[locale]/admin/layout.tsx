'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { AuthGuard } from '@/components/auth-guard';
import { ToastProvider } from '@/components/toast-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Menu latéral en tiroir sur mobile/tablette, fixe à partir de lg.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard requiredRole="ADMIN">
      {/* ToastProvider : indispensable au useToast() des notifications push admin. */}
      <ToastProvider>
        <div className="min-h-screen bg-paper transition-colors duration-300">
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:ml-64">
            <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
            <main>{children}</main>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}

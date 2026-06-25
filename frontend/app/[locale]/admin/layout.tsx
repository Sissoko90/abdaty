'use client';

import { AdminSidebar } from '@/components/admin-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { ToastProvider } from '@/components/toast-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="ADMIN">
      {/* ToastProvider : indispensable au useToast() des notifications push admin. */}
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <AdminSidebar />
          <main className="ml-64 min-h-screen pt-4">
            {children}
          </main>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}

"use client";

import { Sidebar } from '@/components/shared/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

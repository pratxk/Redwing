"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/features/auth/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, loading, isClient } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isClient || loading) return;

    if (requireAuth && !user) {
      // User is not authenticated but auth is required
      router.push(redirectTo);
    } else if (!requireAuth && user) {
      // User is authenticated but auth is not required (e.g., login page)
      router.push('/dashboard');
    }
  }, [user, loading, isClient, requireAuth, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If auth is not required and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null;
  }

  // Render children if authentication state matches requirements
  return <>{children}</>;
} 
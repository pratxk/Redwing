"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/features/auth/AuthContext';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading, hasValidToken, isClient } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isClient || loading) return;

    if (requireAuth) {
      // If user is not authenticated and we have a valid token, wait for auth check
      if (!user && hasValidToken) {
        // Token exists but user data is still loading, wait
        return;
      }
      
      // If no user and no valid token, redirect to login
      if (!user && !hasValidToken) {
        router.push('/auth/login');
      }
    } else {
      // For public routes (like login), redirect authenticated users to dashboard
      if (user && hasValidToken) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, hasValidToken, isClient, requireAuth, router]);

  // Show loading spinner while checking authentication
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // For protected routes, don't render children if not authenticated
  if (requireAuth && !user && !hasValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // For public routes, don't render children if authenticated
  if (!requireAuth && user && hasValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return <>{children}</>;
} 
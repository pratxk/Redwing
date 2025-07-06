// Auth middleware

import { NextRequest, NextResponse } from 'next/server';
import { ROLES, ROLE_PERMISSIONS } from '@/constants/roles';

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Role-based route protection
  const userRole = request.cookies.get('user-role')?.value as keyof typeof ROLES;
  
  if (!userRole) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Check permissions for specific routes
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Admin routes
  if (pathname.startsWith('/admin') && userRole !== ROLES.SUPER_ADMIN) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // User management routes
  if (pathname.startsWith('/users') && !permissions.canManageUsers) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Organization management routes
  if (pathname.startsWith('/organizations') && !permissions.canManageOrganizations) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Drone management routes
  if (pathname.startsWith('/drones') && !permissions.canManageDrones) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Mission management routes
  if (pathname.startsWith('/missions') && !permissions.canManageMissions) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Site management routes
  if (pathname.startsWith('/sites') && !permissions.canManageSites) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const response = authMiddleware(request);
    
    if (response.status !== 200) {
      return response;
    }

    return handler(request);
  };
}

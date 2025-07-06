"use client";

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, ME_QUERY } from '@/lib/graphql/operations';
import { User } from '@/types/user';

// Helper function to get cookie value (client-side only)
function getCookie(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

// Helper function to set cookie (client-side only)
function setCookie(name: string, value: string, days: number) {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

// Helper function to remove cookie (client-side only)
function removeCookie(name: string) {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

// Helper function to check if token is valid (basic check)
function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    // Basic JWT token validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

interface LoginResponse {
  login: {
    token: string;
    user: User;
  };
}

interface MeResponse {
  me: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // GraphQL queries and mutations
  const { data: meData, loading: meLoading, refetch: refetchMe, error: meError } = useQuery<MeResponse>(ME_QUERY, {
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      } else {
        setUser(null);
        removeCookie('auth-token');
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error('Auth check failed:', error);
      setUser(null);
      removeCookie('auth-token');
      setLoading(false);
    },
    skip: !isClient,
    fetchPolicy: 'network-only', // Always fetch from network to validate token
  });

  const [loginMutation, { loading: loginLoading }] = useMutation<LoginResponse>(LOGIN_MUTATION);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login) {
        const { token, user } = data.login;
        
        // Store token in cookie
        setCookie('auth-token', token, 7); // 7 days
        
        setUser(user);
        return { success: true, user };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }, [loginMutation]);

  const logout = useCallback(() => {
    removeCookie('auth-token');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (!isClient) return;
    
    const token = getCookie('auth-token');
    
    if (token && isTokenValid(token)) {
      try {
        // Always make API call to validate token
        await refetchMe();
      } catch (error) {
        console.error('Token validation failed:', error);
        setUser(null);
        removeCookie('auth-token');
      }
    } else if (token && !isTokenValid(token)) {
      // Token exists but is invalid, remove it
      removeCookie('auth-token');
      setUser(null);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [refetchMe, isClient]);

  // Check auth on mount and when client becomes available
  useEffect(() => {
    if (isClient) {
      checkAuth();
    }
  }, [checkAuth, isClient]);

  // Handle ME query errors
  useEffect(() => {
    if (meError) {
      setUser(null);
      removeCookie('auth-token');
    }
  }, [meError]);

  return {
    user,
    loading: loading || meLoading || loginLoading || !isClient,
    login,
    logout,
    checkAuth,
    isClient,
  };
} 
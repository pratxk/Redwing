// Custom hook for API calls

import { useState, useCallback } from 'react';
import { useMutation, useQuery, ApolloError } from '@apollo/client';
import { DocumentNode } from 'graphql';
import { apiClient } from '@/utils/apiClient';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

// GraphQL Query Hook
export function useGraphQLQuery<T = any>(
  query: DocumentNode,
  variables?: any,
  options?: UseApiOptions
) {
  const { data, loading, error, refetch } = useQuery<T>(query, {
    variables,
    onCompleted: options?.onSuccess,
    onError: options?.onError,
  });

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// GraphQL Mutation Hook
export function useGraphQLMutation<T = any>(
  mutation: DocumentNode,
  options?: UseApiOptions
) {
  const [mutate, { loading, error, data }] = useMutation<T>(mutation, {
    onCompleted: options?.onSuccess,
    onError: options?.onError,
  });

  return {
    mutate,
    loading,
    error,
    data,
  };
}

// REST API Hook
export function useRestApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    options?: UseApiOptions
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request({
        method,
        url,
        data,
      });

      options?.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    request,
    loading,
    error,
  };
}

// Auth Hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in cookie
      document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      setUser(user);
      return { success: true, user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    window.location.href = '/auth/login';
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
}

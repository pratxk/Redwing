"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { USERS_QUERY, CREATE_USER_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from "@/lib/graphql/operations";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  organizationMemberships?: any[];
}

interface UsersContextType {
  users: User[] | null;
  loading: boolean;
  error: any;
  addUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); }

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`users:${organizationId}`);
      if (cached && Array.isArray(cached)) {
        setUsers(cached);
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.query({
          query: USERS_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });
        if (isMounted) {
          setUsers(data.users);
          await redisCache.set(`users:${organizationId}`, data.users);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUsers();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: USERS_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.users, users)) {
          setUsers(data.users);
          await redisCache.set(`users:${organizationId}`, data.users);
        }
      } catch (err) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, users]);

  const addUser = useCallback(async (userData: Partial<User>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: { input: { ...userData, organizationId } },
      });
      
      const newUser = data.createUser;
      setUsers((prev) => [...(prev || []), newUser]);
      await redisCache.set(`users:${organizationId}`, [...(users || []), newUser]);
      toast.success("User added successfully");
    } catch (err) {
      toast.error("Failed to add user");
      throw err;
    }
  }, [client, users, organizationId]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_USER_MUTATION,
        variables: { id, input: { ...userData, organizationId } },
      });
      
      const updatedUser = data.updateUser;
      setUsers((prev) => 
        prev?.map(user => user.id === id ? updatedUser : user) || []
      );
      await redisCache.set(`users:${organizationId}`, users?.map(user => user.id === id ? updatedUser : user) || []);
      toast.success("User updated successfully");
    } catch (err) {
      toast.error("Failed to update user");
      throw err;
    }
  }, [client, users, organizationId]);

  const deleteUser = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      await client.mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { id, organizationId },
      });
      
      setUsers((prev) => prev?.filter(user => user.id !== id) || []);
      await redisCache.set(`users:${organizationId}`, users?.filter(user => user.id !== id) || []);
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user");
      throw err;
    }
  }, [client, users, organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: USERS_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });
      setUsers(data.users);
      await redisCache.set(`users:${organizationId}`, data.users);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  const refreshCache = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: USERS_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setUsers(data.users);
      await redisCache.set(`users:${organizationId}`, data.users);
      toast.success('Users cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh users cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <UsersContext.Provider value={{ users, loading, error, addUser, updateUser, deleteUser, refetch, refreshCache }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers(): UsersContextType {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
} 
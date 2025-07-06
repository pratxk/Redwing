"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { SITES_QUERY, CREATE_SITE_MUTATION, UPDATE_SITE_MUTATION, DELETE_SITE_MUTATION } from "@/lib/graphql/operations";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';

interface Site {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  missions?: any[];
}

interface SitesContextType {
  sites: Site[] | null;
  loading: boolean;
  error: any;
  addSite: (siteData: Partial<Site>) => Promise<void>;
  updateSite: (id: string, siteData: Partial<Site>) => Promise<void>;
  deleteSite: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const SitesContext = createContext<SitesContextType | undefined>(undefined);

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); }

export function SitesProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [sites, setSites] = useState<Site[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchSites() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`sites:${organizationId}`);
      if (cached && Array.isArray(cached)) {
        setSites(cached);
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.query({
          query: SITES_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });
        if (isMounted) {
          setSites(data.sites);
          await redisCache.set(`sites:${organizationId}`, data.sites);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSites();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: SITES_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.sites, sites)) {
          setSites(data.sites);
          await redisCache.set(`sites:${organizationId}`, data.sites);
        }
      } catch (err) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, sites]);

  const addSite = useCallback(async (siteData: Partial<Site>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: CREATE_SITE_MUTATION,
        variables: { input: { ...siteData, organizationId } },
      });
      
      const newSite = data.createSite;
      setSites((prev) => [...(prev || []), newSite]);
      await redisCache.set(`sites:${organizationId}`, [...(sites || []), newSite]);
      toast.success("Site added successfully");
    } catch (err) {
      toast.error("Failed to add site");
      throw err;
    }
  }, [client, sites, organizationId]);

  const updateSite = useCallback(async (id: string, siteData: Partial<Site>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_SITE_MUTATION,
        variables: { id, input: { ...siteData, organizationId } },
      });
      
      const updatedSite = data.updateSite;
      setSites((prev) => 
        prev?.map(site => site.id === id ? updatedSite : site) || []
      );
      await redisCache.set(`sites:${organizationId}`, sites?.map(site => site.id === id ? updatedSite : site) || []);
      toast.success("Site updated successfully");
    } catch (err) {
      toast.error("Failed to update site");
      throw err;
    }
  }, [client, sites, organizationId]);

  const deleteSite = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      await client.mutate({
        mutation: DELETE_SITE_MUTATION,
        variables: { id, organizationId },
      });
      
      setSites((prev) => prev?.filter(site => site.id !== id) || []);
      await redisCache.set(`sites:${organizationId}`, sites?.filter(site => site.id !== id) || []);
      toast.success("Site deleted successfully");
    } catch (err) {
      toast.error("Failed to delete site");
      throw err;
    }
  }, [client, sites, organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: SITES_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });
      setSites(data.sites);
      await redisCache.set(`sites:${organizationId}`, data.sites);
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
        query: SITES_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setSites(data.sites);
      await redisCache.set(`sites:${organizationId}`, data.sites);
      toast.success('Sites cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh sites cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <SitesContext.Provider value={{ sites, loading, error, addSite, updateSite, deleteSite, refetch, refreshCache }}>
      {children}
    </SitesContext.Provider>
  );
}

export function useSites(): SitesContextType {
  const context = useContext(SitesContext);
  if (context === undefined) {
    throw new Error("useSites must be used within a SitesProvider");
  }
  return context;
} 
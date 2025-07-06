"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';
import { SETTINGS_QUERY } from '@/lib/graphql/operations';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  refreshInterval: number;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: any;
  updateSetting: (key: string, value: any) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const defaultSettings: Settings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  units: 'metric',
  autoRefresh: true,
  refreshInterval: 30,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); }

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchSettings() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`settings:${organizationId}`);
      if (cached && typeof cached === 'object' && 'notifications' in cached) {
        setSettings(cached as Settings);
        setLoading(false);
        return;
      }
      try {
        // For settings, we'll use default settings if no cached data
        if (isMounted) {
          setSettings(defaultSettings);
          await redisCache.set(`settings:${organizationId}`, defaultSettings);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSettings();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: SETTINGS_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.settings, settings)) {
          setSettings(data.settings);
          await redisCache.set(`settings:${organizationId}`, data.settings);
        }
      } catch (err) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, settings]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    if (!organizationId) return;
    try {
      if (!settings) return;
      const updatedSettings = {
        ...settings,
        [key]: value,
      } as Settings;
      setSettings(updatedSettings);
      await redisCache.set(`settings:${organizationId}`, updatedSettings);
      toast.success("Setting updated successfully");
    } catch (err) {
      toast.error("Failed to update setting");
      throw err;
    }
  }, [settings, organizationId]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    if (!organizationId) return;
    try {
      if (!settings) return;
      const updatedSettings = {
        ...settings,
        ...newSettings,
      } as Settings;
      setSettings(updatedSettings);
      await redisCache.set(`settings:${organizationId}`, updatedSettings);
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Failed to update settings");
      throw err;
    }
  }, [settings, organizationId]);

  const resetSettings = useCallback(async () => {
    if (!organizationId) return;
    try {
      setSettings(defaultSettings);
      await redisCache.set(`settings:${organizationId}`, defaultSettings);
      toast.success("Settings reset to defaults");
    } catch (err) {
      toast.error("Failed to reset settings");
      throw err;
    }
  }, [organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const cached = await redisCache.get(`settings:${organizationId}`);
      if (cached && typeof cached === 'object' && 'notifications' in cached) {
        setSettings(cached as Settings);
      } else {
        setSettings(defaultSettings);
        await redisCache.set(`settings:${organizationId}`, defaultSettings);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const refreshCache = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: SETTINGS_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setSettings(data.settings);
      await redisCache.set(`settings:${organizationId}`, data.settings);
      toast.success('Settings cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh settings cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, updateSetting, updateSettings, resetSettings, refetch, refreshCache }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
} 
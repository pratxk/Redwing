"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { ORGANIZATION_STATS_QUERY, MISSION_STATS_QUERY, DRONE_UTILIZATION_QUERY } from "@/lib/graphql/operations";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';

interface Analytics {
  missionData: any[];
  droneUtilizationData: any[];
  siteActivityData: any[];
  batteryTrendData: any[];
  missionTypeData: any[];
  keyMetrics: {
    totalMissions: number;
    successRate: number;
    avgUtilization: number;
    flightHours: number;
  };
}

interface AnalyticsContextType {
  analytics: Analytics | null;
  loading: boolean;
  error: any;
  updateAnalytics: (analyticsData: Analytics) => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Mock data for fallback
const mockAnalytics: Analytics = {
  missionData: [
    { month: 'Jan', completed: 12, failed: 2, inProgress: 3 },
    { month: 'Feb', completed: 15, failed: 1, inProgress: 2 },
    { month: 'Mar', completed: 18, failed: 3, inProgress: 4 },
    { month: 'Apr', completed: 14, failed: 2, inProgress: 1 },
    { month: 'May', completed: 20, failed: 1, inProgress: 3 },
    { month: 'Jun', completed: 16, failed: 2, inProgress: 2 },
  ],
  droneUtilizationData: [
    { drone: 'Drone-001', utilization: 85, missions: 12, hours: 24 },
    { drone: 'Drone-002', utilization: 72, missions: 8, hours: 18 },
    { drone: 'Drone-003', utilization: 91, missions: 15, hours: 32 },
    { drone: 'Drone-004', utilization: 68, missions: 6, hours: 14 },
  ],
  siteActivityData: [
    { site: 'Site A', missions: 15, avgDuration: 45, successRate: 92 },
    { site: 'Site B', missions: 12, avgDuration: 38, successRate: 88 },
    { site: 'Site C', missions: 8, avgDuration: 52, successRate: 95 },
    { site: 'Site D', missions: 10, avgDuration: 41, successRate: 90 },
  ],
  batteryTrendData: [
    { time: '00:00', avgBattery: 85 },
    { time: '04:00', avgBattery: 82 },
    { time: '08:00', avgBattery: 78 },
    { time: '12:00', avgBattery: 75 },
    { time: '16:00', avgBattery: 72 },
    { time: '20:00', avgBattery: 80 },
  ],
  missionTypeData: [
    { name: 'Inspection', value: 45, color: '#3b82f6' },
    { name: 'Security', value: 25, color: '#10b981' },
    { name: 'Mapping', value: 20, color: '#f59e0b' },
    { name: 'Survey', value: 10, color: '#8b5cf6' },
  ],
  keyMetrics: {
    totalMissions: 75,
    successRate: 89.3,
    avgUtilization: 78.5,
    flightHours: 88,
  }
};

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); }

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`analytics:${organizationId}`);
      if (cached && typeof cached === 'object' && 'keyMetrics' in cached) {
        setAnalytics(cached as Analytics);
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching analytics data for organization:', organizationId);
        
        // Fetch organization stats
        const { data: orgStatsData } = await client.query({
          query: ORGANIZATION_STATS_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });

        console.log('Organization stats:', orgStatsData);

        // Fetch mission stats
        const { data: missionStatsData } = await client.query({
          query: MISSION_STATS_QUERY,
          variables: { organizationId, timeRange: "30d" },
          fetchPolicy: "network-only",
        });

        console.log('Mission stats:', missionStatsData);

        // Fetch drone utilization
        const { data: droneUtilData } = await client.query({
          query: DRONE_UTILIZATION_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });

        console.log('Drone utilization:', droneUtilData);

        // Transform the data to match the expected format
        let transformedAnalytics: Analytics;
        
        // Check if we have real data, otherwise use mock data
        const hasRealData = orgStatsData?.organizationStats && 
                           (missionStatsData?.missionStats || droneUtilData?.droneUtilization);
        
        if (hasRealData) {
          transformedAnalytics = {
            missionData: missionStatsData?.missionStats?.missionData || mockAnalytics.missionData,
            droneUtilizationData: droneUtilData?.droneUtilization?.droneUtilizationData || mockAnalytics.droneUtilizationData,
            siteActivityData: missionStatsData?.missionStats?.siteActivityData || mockAnalytics.siteActivityData,
            batteryTrendData: droneUtilData?.droneUtilization?.batteryTrendData || mockAnalytics.batteryTrendData,
            missionTypeData: missionStatsData?.missionStats?.missionTypeData || mockAnalytics.missionTypeData,
            keyMetrics: {
              totalMissions: orgStatsData?.organizationStats?.totalMissions || 0,
              successRate: orgStatsData?.organizationStats?.completedMissions > 0 
                ? ((orgStatsData.organizationStats.completedMissions / orgStatsData.organizationStats.totalMissions) * 100) 
                : 0,
              avgUtilization: orgStatsData?.organizationStats?.averageMissionDuration || 0,
              flightHours: orgStatsData?.organizationStats?.totalFlightHours || 0,
            }
          };
        } else {
          console.log('Using mock data as fallback');
          transformedAnalytics = mockAnalytics;
        }

        console.log('Transformed analytics:', transformedAnalytics);

        if (isMounted) {
          setAnalytics(transformedAnalytics);
          await redisCache.set(`analytics:${organizationId}`, transformedAnalytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        if (isMounted) {
          setError(err);
          // Use mock data on error
          setAnalytics(mockAnalytics);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: ORGANIZATION_STATS_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.organizationStats, analytics)) {
          setAnalytics(data.organizationStats as Analytics);
          await redisCache.set(`analytics:${organizationId}`, data.organizationStats);
        }
      } catch (err) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, analytics]);

  const updateAnalytics = useCallback(async (analyticsData: Analytics) => {
    if (!organizationId) return;
    try {
      setAnalytics(analyticsData);
      await redisCache.set(`analytics:${organizationId}`, analyticsData);
      toast.success("Analytics updated successfully");
    } catch (err) {
      toast.error("Failed to update analytics");
      throw err;
    }
  }, [organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Refetching analytics data for organization:', organizationId);
      
      // Fetch organization stats
      const { data: orgStatsData } = await client.query({
        query: ORGANIZATION_STATS_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });

      // Fetch mission stats
      const { data: missionStatsData } = await client.query({
        query: MISSION_STATS_QUERY,
        variables: { organizationId, timeRange: "30d" },
        fetchPolicy: "network-only",
      });

      // Fetch drone utilization
      const { data: droneUtilData } = await client.query({
        query: DRONE_UTILIZATION_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });

      // Transform the data to match the expected format
      let transformedAnalytics: Analytics;
      
      // Check if we have real data, otherwise use mock data
      const hasRealData = orgStatsData?.organizationStats && 
                         (missionStatsData?.missionStats || droneUtilData?.droneUtilization);
      
      if (hasRealData) {
        transformedAnalytics = {
          missionData: missionStatsData?.missionStats?.missionData || mockAnalytics.missionData,
          droneUtilizationData: droneUtilData?.droneUtilization?.droneUtilizationData || mockAnalytics.droneUtilizationData,
          siteActivityData: missionStatsData?.missionStats?.siteActivityData || mockAnalytics.siteActivityData,
          batteryTrendData: droneUtilData?.droneUtilization?.batteryTrendData || mockAnalytics.batteryTrendData,
          missionTypeData: missionStatsData?.missionStats?.missionTypeData || mockAnalytics.missionTypeData,
          keyMetrics: {
            totalMissions: orgStatsData?.organizationStats?.totalMissions || 0,
            successRate: orgStatsData?.organizationStats?.completedMissions > 0 
              ? ((orgStatsData.organizationStats.completedMissions / orgStatsData.organizationStats.totalMissions) * 100) 
              : 0,
            avgUtilization: orgStatsData?.organizationStats?.averageMissionDuration || 0,
            flightHours: orgStatsData?.organizationStats?.totalFlightHours || 0,
          }
        };
      } else {
        console.log('Using mock data as fallback during refetch');
        transformedAnalytics = mockAnalytics;
      }

      setAnalytics(transformedAnalytics);
      await redisCache.set(`analytics:${organizationId}`, transformedAnalytics);
    } catch (err) {
      console.error('Error refetching analytics:', err);
      setError(err);
      // Use mock data on error
      setAnalytics(mockAnalytics);
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
        query: ORGANIZATION_STATS_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setAnalytics(data.organizationStats as Analytics);
      await redisCache.set(`analytics:${organizationId}`, data.organizationStats);
      toast.success('Analytics cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh analytics cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <AnalyticsContext.Provider value={{ analytics, loading, error, updateAnalytics, refetch, refreshCache }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
} 
"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { 
  MISSIONS_QUERY, 
  CREATE_MISSION_MUTATION, 
  UPDATE_MISSION_MUTATION, 
  DELETE_MISSION_MUTATION,
  START_MISSION_MUTATION,
  PAUSE_MISSION_MUTATION,
  RESUME_MISSION_MUTATION,
  ABORT_MISSION_MUTATION,
  COMPLETE_MISSION_MUTATION
} from "@/lib/graphql/operations";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';

interface Mission {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  priority: number;
  flightPattern: string;
  plannedAltitude: number;
  plannedSpeed: number;
  overlapPercentage: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: any;
  assignedTo?: any;
  drone: any;
  site: any;
  waypoints: any[];
}

interface MissionsContextType {
  missions: Mission[] | null;
  loading: boolean;
  error: any;
  addMission: (missionData: Partial<Mission>) => Promise<void>;
  updateMission: (id: string, missionData: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  startMission: (id: string) => Promise<void>;
  pauseMission: (id: string) => Promise<void>;
  resumeMission: (id: string) => Promise<void>;
  abortMission: (id: string) => Promise<void>;
  completeMission: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const MissionsContext = createContext<MissionsContextType | undefined>(undefined);

export function MissionsProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchMissions() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`missions:${organizationId}`);
      if (cached && Array.isArray(cached)) {
        setMissions(cached);
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.query({
          query: MISSIONS_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });
        if (isMounted) {
          setMissions(data.missions);
          await redisCache.set(`missions:${organizationId}`, data.missions);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMissions();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  // Polling interval (e.g., 2 minutes)
  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: MISSIONS_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.missions, missions)) {
          setMissions(data.missions);
          await redisCache.set(`missions:${organizationId}`, data.missions);
        }
      } catch (err) {
        // Optionally log error
      }
    }, 5 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, missions]);

  const addMission = useCallback(async (missionData: Partial<Mission>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: CREATE_MISSION_MUTATION,
        variables: { input: { ...missionData, organizationId } },
      });
      
      const newMission = data.createMission;
      setMissions((prev) => [...(prev || []), newMission]);
      await redisCache.set(`missions:${organizationId}`, [...(missions || []), newMission]);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission created successfully");
    } catch (err) {
      toast.error("Failed to create mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const updateMission = useCallback(async (id: string, missionData: Partial<Mission>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_MISSION_MUTATION,
        variables: { id, input: { ...missionData } },
      });
      
      const updatedMission = data.updateMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? updatedMission : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? updatedMission : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission updated successfully");
    } catch (err) {
      toast.error("Failed to update mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const deleteMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      await client.mutate({
        mutation: DELETE_MISSION_MUTATION,
        variables: { id, organizationId },
      });
      
      setMissions((prev) => prev?.filter(mission => mission.id !== id) || []);
      await redisCache.set(`missions:${organizationId}`, missions?.filter(mission => mission.id !== id) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission deleted successfully");
    } catch (err) {
      toast.error("Failed to delete mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const startMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: START_MISSION_MUTATION,
        variables: { id },
      });
      
      const updatedMission = data.startMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission started successfully");
    } catch (err) {
      toast.error("Failed to start mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const pauseMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: PAUSE_MISSION_MUTATION,
        variables: { id },
      });
      
      const updatedMission = data.pauseMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission paused successfully");
    } catch (err) {
      toast.error("Failed to pause mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const resumeMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: RESUME_MISSION_MUTATION,
        variables: { id },
      });
      
      const updatedMission = data.resumeMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission resumed successfully");
    } catch (err) {
      toast.error("Failed to resume mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const abortMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: ABORT_MISSION_MUTATION,
        variables: { id },
      });
      
      const updatedMission = data.abortMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission aborted successfully");
    } catch (err) {
      toast.error("Failed to abort mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const completeMission = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: COMPLETE_MISSION_MUTATION,
        variables: { id },
      });
      
      const updatedMission = data.completeMission;
      setMissions((prev) => 
        prev?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []
      );
      await redisCache.set(`missions:${organizationId}`, missions?.map(mission => mission.id === id ? { ...mission, ...updatedMission } : mission) || []);
      await redisCache.set(`drones:${organizationId}`, null);
      toast.success("Mission completed successfully");
    } catch (err) {
      toast.error("Failed to complete mission");
      throw err;
    }
  }, [client, missions, organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: MISSIONS_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });
      setMissions(data.missions);
      await redisCache.set(`missions:${organizationId}`, data.missions);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  // Manual cache refresh
  const refreshCache = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: MISSIONS_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setMissions(data.missions);
      await redisCache.set(`missions:${organizationId}`, data.missions);
      toast.success('Missions cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh missions cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <MissionsContext.Provider value={{ 
      missions, 
      loading, 
      error, 
      addMission, 
      updateMission, 
      deleteMission, 
      startMission,
      pauseMission,
      resumeMission,
      abortMission,
      completeMission,
      refetch,
      refreshCache
    }}>
      {children}
    </MissionsContext.Provider>
  );
}

export function useMissions(): MissionsContextType {
  const context = useContext(MissionsContext);
  if (context === undefined) {
    throw new Error("useMissions must be used within a MissionsProvider");
  }
  return context;
}

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); } 
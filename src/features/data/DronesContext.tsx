"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { DRONES_QUERY, CREATE_DRONE_MUTATION, UPDATE_DRONE_MUTATION, DELETE_DRONE_MUTATION, UPDATE_DRONE_STATUS_MUTATION } from "@/lib/graphql/operations";
import { redisCache } from "@/utils/redis-cache";
import { toast } from "sonner";
import { useAuthContext } from '@/features/auth/AuthContext';

interface Drone {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: string;
  batteryLevel: number;
  lastMaintenanceAt?: Date;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAltitude?: number;
  isActive: boolean;
  maxFlightTime: number;
  maxSpeed: number;
  maxAltitude: number;
  cameraResolution?: string;
  sensorTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DronesContextType {
  drones: Drone[] | null;
  loading: boolean;
  error: any;
  addDrone: (droneData: Partial<Drone>) => Promise<void>;
  updateDrone: (id: string, droneData: Partial<Drone>) => Promise<void>;
  updateDroneStatus: (id: string, status: string) => Promise<void>;
  deleteDrone: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  refreshCache: () => Promise<void>;
}

const DronesContext = createContext<DronesContextType | undefined>(undefined);

export function DronesProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { user, loading: authLoading } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;
  const [drones, setDrones] = useState<Drone[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    let isMounted = true;
    async function fetchDrones() {
      setLoading(true);
      setError(null);
      const cached = await redisCache.get(`drones:${organizationId}`);
      if (cached && Array.isArray(cached)) {
        setDrones(cached);
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.query({
          query: DRONES_QUERY,
          variables: { organizationId },
          fetchPolicy: "network-only",
        });
        if (isMounted) {
          setDrones(data.drones);
          await redisCache.set(`drones:${organizationId}`, data.drones);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDrones();
    return () => { isMounted = false; };
  }, [client, organizationId, authLoading]);

  useEffect(() => {
    if (!organizationId || authLoading) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await client.query({
          query: DRONES_QUERY,
          variables: { organizationId },
          fetchPolicy: 'network-only',
        });
        if (!deepEqual(data.drones, drones)) {
          setDrones(data.drones);
          await redisCache.set(`drones:${organizationId}`, data.drones);
        }
      } catch (err) {}
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [client, organizationId, authLoading, drones]);

  const addDrone = useCallback(async (droneData: Partial<Drone>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: CREATE_DRONE_MUTATION,
        variables: { input: { ...droneData, organizationId } },
      });
      
      const newDrone = data.createDrone;
      setDrones((prev) => [...(prev || []), newDrone]);
      await redisCache.set(`drones:${organizationId}`, [...(drones || []), newDrone]);
      await redisCache.set(`missions:${organizationId}`, null);
      toast.success("Drone added successfully");
    } catch (err) {
      toast.error("Failed to add drone");
      throw err;
    }
  }, [client, drones, organizationId]);

  const updateDrone = useCallback(async (id: string, droneData: Partial<Drone>) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_DRONE_MUTATION,
        variables: { id, input: { ...droneData, organizationId } },
      });
      
      const updatedDrone = data.updateDrone;
      setDrones((prev) => 
        prev?.map(drone => drone.id === id ? updatedDrone : drone) || []
      );
      await redisCache.set(`drones:${organizationId}`, drones?.map(drone => drone.id === id ? updatedDrone : drone) || []);
      await redisCache.set(`missions:${organizationId}`, null);
      toast.success("Drone updated successfully");
    } catch (err) {
      toast.error("Failed to update drone");
      throw err;
    }
  }, [client, drones, organizationId]);

  const updateDroneStatus = useCallback(async (id: string, status: string) => {
    if (!organizationId) return;
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_DRONE_STATUS_MUTATION,
        variables: { id, status },
      });
      
      const updatedDrone = data.updateDroneStatus;
      setDrones((prev) => 
        prev?.map(drone => drone.id === id ? { ...drone, status: updatedDrone.status } : drone) || []
      );
      await redisCache.set(`drones:${organizationId}`, drones?.map(drone => drone.id === id ? { ...drone, status: updatedDrone.status } : drone) || []);
      await redisCache.set(`missions:${organizationId}`, null);
      toast.success(`Drone status updated to ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error("Failed to update drone status");
      throw err;
    }
  }, [client, drones, organizationId]);

  const deleteDrone = useCallback(async (id: string) => {
    if (!organizationId) return;
    try {
      await client.mutate({
        mutation: DELETE_DRONE_MUTATION,
        variables: { id, organizationId },
      });
      
      setDrones((prev) => prev?.filter(drone => drone.id !== id) || []);
      await redisCache.set(`drones:${organizationId}`, drones?.filter(drone => drone.id !== id) || []);
      await redisCache.set(`missions:${organizationId}`, null);
      toast.success("Drone deleted successfully");
    } catch (err) {
      toast.error("Failed to delete drone");
      throw err;
    }
  }, [client, drones, organizationId]);

  const refetch = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await client.query({
        query: DRONES_QUERY,
        variables: { organizationId },
        fetchPolicy: "network-only",
      });
      setDrones(data.drones);
      await redisCache.set(`drones:${organizationId}`, data.drones);
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
        query: DRONES_QUERY,
        variables: { organizationId },
        fetchPolicy: 'network-only',
      });
      setDrones(data.drones);
      await redisCache.set(`drones:${organizationId}`, data.drones);
      toast.success('Drones cache refreshed');
    } catch (err) {
      setError(err);
      toast.error('Failed to refresh drones cache');
    } finally {
      setLoading(false);
    }
  }, [client, organizationId]);

  return (
    <DronesContext.Provider value={{ drones, loading, error, addDrone, updateDrone, updateDroneStatus, deleteDrone, refetch, refreshCache }}>
      {children}
    </DronesContext.Provider>
  );
}

export function useDrones(): DronesContextType {
  const context = useContext(DronesContext);
  if (context === undefined) {
    throw new Error("useDrones must be used within a DronesProvider");
  }
  return context;
}

function deepEqual(a: any, b: any): boolean { return JSON.stringify(a) === JSON.stringify(b); } 
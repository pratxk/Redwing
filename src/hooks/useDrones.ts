import { useQuery, useMutation } from '@apollo/client';
import { 
  DRONES_QUERY, 
  DRONE_QUERY, 
  AVAILABLE_DRONES_QUERY,
  CREATE_DRONE_MUTATION,
  UPDATE_DRONE_MUTATION,
  DELETE_DRONE_MUTATION,
  UPDATE_DRONE_STATUS_MUTATION,
  UPDATE_DRONE_LOCATION_MUTATION,
  UPDATE_DRONE_BATTERY_MUTATION
} from '@/lib/graphql/operations';
import { toast } from 'sonner';

export function useDrones(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(DRONES_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  return {
    drones: data?.drones || [],
    loading,
    error,
    refetch,
  };
}

export function useDrone(id: string) {
  const { data, loading, error, refetch } = useQuery(DRONE_QUERY, {
    variables: { id },
    skip: !id,
  });

  return {
    drone: data?.drone,
    loading,
    error,
    refetch,
  };
}

export function useAvailableDrones(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(AVAILABLE_DRONES_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
  });

  return {
    drones: data?.availableDrones || [],
    loading,
    error,
    refetch,
  };
}

export function useDroneMutations() {
  const [createDrone, { loading: createLoading }] = useMutation(CREATE_DRONE_MUTATION, {
    onCompleted: () => {
      toast.success('Drone created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create drone: ${error.message}`);
    },
  });

  const [updateDrone, { loading: updateLoading }] = useMutation(UPDATE_DRONE_MUTATION, {
    onCompleted: () => {
      toast.success('Drone updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update drone: ${error.message}`);
    },
  });

  const [deleteDrone, { loading: deleteLoading }] = useMutation(DELETE_DRONE_MUTATION, {
    onCompleted: () => {
      toast.success('Drone deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete drone: ${error.message}`);
    },
  });

  const [updateDroneStatus, { loading: statusLoading }] = useMutation(UPDATE_DRONE_STATUS_MUTATION, {
    onCompleted: () => {
      toast.success('Drone status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update drone status: ${error.message}`);
    },
  });

  const [updateDroneLocation, { loading: locationLoading }] = useMutation(UPDATE_DRONE_LOCATION_MUTATION, {
    onCompleted: () => {
      toast.success('Drone location updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update drone location: ${error.message}`);
    },
  });

  const [updateDroneBattery, { loading: batteryLoading }] = useMutation(UPDATE_DRONE_BATTERY_MUTATION, {
    onCompleted: () => {
      toast.success('Drone battery updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update drone battery: ${error.message}`);
    },
  });

  return {
    createDrone,
    updateDrone,
    deleteDrone,
    updateDroneStatus,
    updateDroneLocation,
    updateDroneBattery,
    loading: createLoading || updateLoading || deleteLoading || statusLoading || 
            locationLoading || batteryLoading,
  };
} 
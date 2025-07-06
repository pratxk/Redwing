import { useQuery } from '@apollo/client';
import { 
  ORGANIZATION_STATS_QUERY,
  MISSION_STATS_QUERY,
  DRONE_UTILIZATION_QUERY
} from '@/lib/graphql/operations';

export function useOrganizationStats(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(ORGANIZATION_STATS_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
  });

  return {
    stats: data?.organizationStats,
    loading,
    error,
    refetch,
  };
}

export function useMissionStats(organizationId?: string, timeRange?: string) {
  const { data, loading, error, refetch } = useQuery(MISSION_STATS_QUERY, {
    variables: { organizationId, timeRange },
    skip: !organizationId,
  });

  return {
    stats: data?.missionStats,
    loading,
    error,
    refetch,
  };
}

export function useDroneUtilization(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(DRONE_UTILIZATION_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
  });

  return {
    utilization: data?.droneUtilization,
    loading,
    error,
    refetch,
  };
} 
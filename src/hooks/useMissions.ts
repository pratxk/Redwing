import { useQuery, useMutation, useLazyQuery, gql } from '@apollo/client';
import { 
  MISSIONS_QUERY, 
  MISSION_QUERY, 
  MY_MISSIONS_QUERY, 
  ACTIVE_MISSIONS_QUERY,
  CREATE_MISSION_MUTATION,
  UPDATE_MISSION_MUTATION,
  DELETE_MISSION_MUTATION,
  START_MISSION_MUTATION,
  PAUSE_MISSION_MUTATION,
  RESUME_MISSION_MUTATION,
  ABORT_MISSION_MUTATION,
  COMPLETE_MISSION_MUTATION,
  ASSIGN_MISSION_MUTATION
} from '@/lib/graphql/operations';
import { getApolloClient } from '@/lib/apollo-client';
import { toast } from 'sonner';

export function useMissions(organizationId?: string, status?: string) {
  const { data, loading, error, refetch } = useQuery(MISSIONS_QUERY, {
    variables: { organizationId, status },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  return {
    missions: data?.missions || [],
    loading,
    error,
    refetch,
  };
}

export function useMission(id: string) {
  const { data, loading, error, refetch } = useQuery(MISSION_QUERY, {
    variables: { id },
    skip: !id,
  });

  return {
    mission: data?.mission,
    loading,
    error,
    refetch,
  };
}

export function useMyMissions() {
  const { data, loading, error, refetch } = useQuery(MY_MISSIONS_QUERY);

  return {
    missions: data?.myMissions || [],
    loading,
    error,
    refetch,
  };
}

export function useActiveMissions(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(ACTIVE_MISSIONS_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
  });

  return {
    missions: data?.activeMissions || [],
    loading,
    error,
    refetch,
  };
}

export function useMissionMutations() {
  const [createMission, { loading: createLoading }] = useMutation(CREATE_MISSION_MUTATION, {
    onCompleted: (data) => {
      toast.success('Mission created successfully');
      // Update cache
      const client = getApolloClient();
      client.cache.modify({
        fields: {
          missions(existingMissions = []) {
            const newMissionRef = client.cache.writeFragment({
              data: data.createMission,
              fragment: gql`
                fragment NewMission on Mission {
                  id
                  name
                  status
                  type
                  priority
                  createdAt
                }
              `,
            });
            return [...existingMissions, newMissionRef];
          },
        },
      });
    },
    onError: (error) => {
      toast.error(`Failed to create mission: ${error.message}`);
    },
  });

  const [updateMission, { loading: updateLoading }] = useMutation(UPDATE_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update mission: ${error.message}`);
    },
  });

  const [deleteMission, { loading: deleteLoading }] = useMutation(DELETE_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete mission: ${error.message}`);
    },
  });

  const [startMission, { loading: startLoading }] = useMutation(START_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission started successfully');
    },
    onError: (error) => {
      toast.error(`Failed to start mission: ${error.message}`);
    },
  });

  const [pauseMission, { loading: pauseLoading }] = useMutation(PAUSE_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission paused successfully');
    },
    onError: (error) => {
      toast.error(`Failed to pause mission: ${error.message}`);
    },
  });

  const [resumeMission, { loading: resumeLoading }] = useMutation(RESUME_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission resumed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to resume mission: ${error.message}`);
    },
  });

  const [abortMission, { loading: abortLoading }] = useMutation(ABORT_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission aborted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to abort mission: ${error.message}`);
    },
  });

  const [completeMission, { loading: completeLoading }] = useMutation(COMPLETE_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission completed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to complete mission: ${error.message}`);
    },
  });

  const [assignMission, { loading: assignLoading }] = useMutation(ASSIGN_MISSION_MUTATION, {
    onCompleted: () => {
      toast.success('Mission assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign mission: ${error.message}`);
    },
  });

  return {
    createMission,
    updateMission,
    deleteMission,
    startMission,
    pauseMission,
    resumeMission,
    abortMission,
    completeMission,
    assignMission,
    loading: createLoading || updateLoading || deleteLoading || startLoading || 
            pauseLoading || resumeLoading || abortLoading || completeLoading || assignLoading,
  };
} 
import { useQuery, useMutation } from '@apollo/client';
import { 
  USERS_QUERY, 
  USER_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION
} from '@/lib/graphql/operations';
import { toast } from 'sonner';

export function useUsers(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(USERS_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  return {
    users: data?.users || [],
    loading,
    error,
    refetch,
  };
}

export function useUser(id: string) {
  const { data, loading, error, refetch } = useQuery(USER_QUERY, {
    variables: { id },
    skip: !id,
  });

  return {
    user: data?.user,
    loading,
    error,
    refetch,
  };
}

export function useUserMutations() {
  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
    loading: createLoading || updateLoading || deleteLoading,
  };
} 
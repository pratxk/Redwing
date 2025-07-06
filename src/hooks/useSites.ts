import { useQuery, useMutation } from '@apollo/client';
import { 
  SITES_QUERY, 
  SITE_QUERY,
  CREATE_SITE_MUTATION,
  UPDATE_SITE_MUTATION,
  DELETE_SITE_MUTATION
} from '@/lib/graphql/operations';
import { toast } from 'sonner';

export function useSites(organizationId?: string) {
  const { data, loading, error, refetch } = useQuery(SITES_QUERY, {
    variables: { organizationId },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  return {
    sites: data?.sites || [],
    loading,
    error,
    refetch,
  };
}

export function useSite(id: string) {
  const { data, loading, error, refetch } = useQuery(SITE_QUERY, {
    variables: { id },
    skip: !id,
  });

  return {
    site: data?.site,
    loading,
    error,
    refetch,
  };
}

export function useSiteMutations() {
  const [createSite, { loading: createLoading }] = useMutation(CREATE_SITE_MUTATION, {
    onCompleted: () => {
      toast.success('Site created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create site: ${error.message}`);
    },
  });

  const [updateSite, { loading: updateLoading }] = useMutation(UPDATE_SITE_MUTATION, {
    onCompleted: () => {
      toast.success('Site updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update site: ${error.message}`);
    },
  });

  const [deleteSite, { loading: deleteLoading }] = useMutation(DELETE_SITE_MUTATION, {
    onCompleted: () => {
      toast.success('Site deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete site: ${error.message}`);
    },
  });

  return {
    createSite,
    updateSite,
    deleteSite,
    loading: createLoading || updateLoading || deleteLoading,
  };
} 
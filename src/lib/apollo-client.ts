import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

let apolloClient: ApolloClient<any> | null = null;

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return { headers };
    }

    // Get token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        // Don't log authentication errors for the ME query when there's no token
        const isMeQuery = operation.operationName === 'Me';
        const isAuthError = message.includes('Not authenticated') || message.includes('Unauthorized');
        
        if (!(isMeQuery && isAuthError)) {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      
      // Handle 401 errors
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        // Clear auth token and redirect to login
        if (typeof window !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          window.location.href = '/auth/login';
        }
      }
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            missions: {
              merge: false,
              read(existing) {
                return existing;
              },
            },
            drones: {
              merge: false,
              read(existing) {
                return existing;
              },
            },
            sites: {
              merge: false,
              read(existing) {
                return existing;
              },
            },
            users: {
              merge: false,
              read(existing) {
                return existing;
              },
            },
            organization: {
              merge: false,
              read(existing) {
                return existing;
              },
            },
          },
        },
        Mission: {
          keyFields: ['id'],
          fields: {
            waypoints: {
              merge: false,
            },
          },
        },
        Drone: {
          keyFields: ['id'],
        },
        Site: {
          keyFields: ['id'],
        },
        User: {
          keyFields: ['id'],
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
    },
    ssrMode: typeof window === 'undefined',
  });
}

export function initializeApollo(initialState: any = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = { ...existingCache, ...(initialState as object) };

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function getApolloClient() {
  return apolloClient || createApolloClient();
} 
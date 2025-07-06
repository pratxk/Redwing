# GraphQL Integration Documentation

## Overview

The Redwing frontend has been fully integrated with the Falcon backend using GraphQL. This document outlines the integration setup, available operations, and how to use them.

## Setup

### Environment Variables

Create a `.env.local` file in the `redwing` directory with the following variables:

```env
# GraphQL API Configuration
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# REST API Configuration (for auth)
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# WebSocket Configuration (for real-time updates)
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

# Application Configuration
NEXT_PUBLIC_APP_NAME=Redwing Drone Management
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Apollo Client Configuration

The Apollo Client is configured in `src/utils/apiClient.ts` with:
- Authentication token handling
- Error interceptors
- Automatic token refresh
- WebSocket support for subscriptions

## Available Operations

### Authentication
- `LOGIN_MUTATION` - User login
- `ME_QUERY` - Get current user info

### Users
- `USERS_QUERY` - List all users
- `USER_QUERY` - Get specific user
- `CREATE_USER_MUTATION` - Create new user
- `UPDATE_USER_MUTATION` - Update user
- `DELETE_USER_MUTATION` - Delete user

### Organizations
- `ORGANIZATIONS_QUERY` - List organizations
- `MY_ORGANIZATIONS_QUERY` - Get user's organizations
- `ORGANIZATION_QUERY` - Get specific organization

### Sites
- `SITES_QUERY` - List sites for organization
- `SITE_QUERY` - Get specific site
- `CREATE_SITE_MUTATION` - Create new site
- `UPDATE_SITE_MUTATION` - Update site
- `DELETE_SITE_MUTATION` - Delete site

### Drones
- `DRONES_QUERY` - List drones for organization
- `DRONE_QUERY` - Get specific drone
- `AVAILABLE_DRONES_QUERY` - Get available drones
- `CREATE_DRONE_MUTATION` - Create new drone
- `UPDATE_DRONE_MUTATION` - Update drone
- `DELETE_DRONE_MUTATION` - Delete drone
- `UPDATE_DRONE_STATUS_MUTATION` - Update drone status
- `UPDATE_DRONE_LOCATION_MUTATION` - Update drone location
- `UPDATE_DRONE_BATTERY_MUTATION` - Update drone battery

### Missions
- `MISSIONS_QUERY` - List missions for organization
- `MISSION_QUERY` - Get specific mission
- `MY_MISSIONS_QUERY` - Get user's missions
- `ACTIVE_MISSIONS_QUERY` - Get active missions
- `CREATE_MISSION_MUTATION` - Create new mission
- `UPDATE_MISSION_MUTATION` - Update mission
- `DELETE_MISSION_MUTATION` - Delete mission
- `START_MISSION_MUTATION` - Start mission
- `PAUSE_MISSION_MUTATION` - Pause mission
- `RESUME_MISSION_MUTATION` - Resume mission
- `ABORT_MISSION_MUTATION` - Abort mission
- `COMPLETE_MISSION_MUTATION` - Complete mission
- `ASSIGN_MISSION_MUTATION` - Assign mission to user

### Analytics
- `ORGANIZATION_STATS_QUERY` - Get organization statistics
- `MISSION_STATS_QUERY` - Get mission statistics
- `DRONE_UTILIZATION_QUERY` - Get drone utilization data

### Real-time Data
- `REALTIME_FLIGHT_DATA_QUERY` - Get real-time flight data

### Subscriptions
- `MISSION_UPDATED_SUBSCRIPTION` - Real-time mission updates
- `DRONE_STATUS_UPDATED_SUBSCRIPTION` - Real-time drone status updates
- `FLIGHT_DATA_UPDATED_SUBSCRIPTION` - Real-time flight data updates

## Custom Hooks

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, loading, login, logout, checkAuth } = useAuth();
```

### Missions
```typescript
import { useMissions, useMissionMutations } from '@/hooks/useMissions';

const { missions, loading, error } = useMissions(organizationId);
const { startMission, pauseMission, loading } = useMissionMutations();
```

### Drones
```typescript
import { useDrones, useDroneMutations } from '@/hooks/useDrones';

const { drones, loading, error } = useDrones(organizationId);
const { createDrone, updateDrone, loading } = useDroneMutations();
```

### Sites
```typescript
import { useSites, useSiteMutations } from '@/hooks/useSites';

const { sites, loading, error } = useSites(organizationId);
const { createSite, updateSite, loading } = useSiteMutations();
```

### Users
```typescript
import { useUsers, useUserMutations } from '@/hooks/useUsers';

const { users, loading, error } = useUsers(organizationId);
const { createUser, updateUser, loading } = useUserMutations();
```

### Analytics
```typescript
import { useOrganizationStats, useMissionStats } from '@/hooks/useAnalytics';

const { stats, loading, error } = useOrganizationStats(organizationId);
const { stats: missionStats, loading } = useMissionStats(organizationId, '30d');
```

## Usage Examples

### Creating a Mission
```typescript
const { createMission } = useMissionMutations();

const handleCreateMission = async () => {
  try {
    await createMission({
      variables: {
        input: {
          name: 'New Mission',
          description: 'Mission description',
          type: 'INSPECTION',
          priority: 1,
          flightPattern: 'GRID',
          plannedAltitude: 100,
          plannedSpeed: 10,
          overlapPercentage: 70,
          droneId: 'drone-id',
          siteId: 'site-id',
          organizationId: 'org-id',
        }
      }
    });
  } catch (error) {
    console.error('Failed to create mission:', error);
  }
};
```

### Starting a Mission
```typescript
const { startMission } = useMissionMutations();

const handleStartMission = async (missionId: string) => {
  try {
    await startMission({
      variables: { id: missionId }
    });
  } catch (error) {
    console.error('Failed to start mission:', error);
  }
};
```

### Real-time Updates
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { isConnected, subscribe, unsubscribe } = useWebSocket({
  onMessage: (message) => {
    if (message.type === 'mission_update') {
      // Handle mission update
      console.log('Mission updated:', message.data);
    }
  }
});

useEffect(() => {
  subscribe('missions');
  return () => unsubscribe('missions');
}, [subscribe, unsubscribe]);
```

## Error Handling

All GraphQL operations include automatic error handling with toast notifications:

- Success operations show success messages
- Failed operations show error messages with details
- Network errors are handled gracefully
- Authentication errors redirect to login

## Loading States

All hooks provide loading states that can be used to show loading indicators:

```typescript
const { missions, loading, error } = useMissions(organizationId);

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}
```

## Type Safety

All GraphQL operations are fully typed with TypeScript interfaces that match the backend schema. This provides:

- Compile-time type checking
- IntelliSense support
- Runtime type safety
- Automatic type inference

## Testing

To test the GraphQL integration:

1. Start the Falcon backend server
2. Start the Redwing frontend development server
3. Navigate to the application
4. Test authentication and data loading
5. Test real-time updates via WebSocket

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure the backend server is running
2. **Authentication errors**: Check token storage and refresh logic
3. **CORS errors**: Verify backend CORS configuration
4. **WebSocket connection failed**: Check WebSocket endpoint configuration

### Debug Mode

Enable GraphQL debugging by adding to `.env.local`:
```env
NEXT_PUBLIC_GRAPHQL_DEBUG=true
```

This will log all GraphQL operations to the console for debugging purposes. 
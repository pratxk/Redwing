"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { 
  Target, 
  DroneIcon, 
  MapPin, 
  Users, 
  TrendingUp, 
  Activity,
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { DronesProvider, useDrones } from '../../../features/data/DronesContext';
import { MissionsProvider, useMissions } from '../../../features/data/MissionsContext';
import { SitesProvider, useSites } from '../../../features/data/SitesContext';
import { UsersProvider, useUsers } from '../../../features/data/UsersContext';
import { DashboardSkeleton } from '../../../components/shared/Skeleton';
import React from 'react';

function DashboardPageContent() {
  const { drones, loading: dronesLoading, error: dronesError, updateDroneStatus } = useDrones() as {
    drones: any[];
    loading: boolean;
    error: any;
    updateDroneStatus: (id: string, status: string) => Promise<void>;
  };
  const { missions, loading: missionsLoading, error: missionsError, pauseMission, abortMission } = useMissions() as {
    missions: any[];
    loading: boolean;
    error: any;
    pauseMission: (id: string) => Promise<void>;
    abortMission: (id: string) => Promise<void>;
  };
  const { sites, loading: sitesLoading, error: sitesError } = useSites() as {
    sites: any[];
    loading: boolean;
    error: any;
  };
  const { users, loading: usersLoading, error: usersError } = useUsers() as {
    users: any[];
    loading: boolean;
    error: any;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNED: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ABORTED: 'bg-red-100 text-red-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDroneStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_MISSION: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      CHARGING: 'bg-purple-100 text-purple-800',
      OFFLINE: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const [missionActionLoading, setMissionActionLoading] = React.useState<string | null>(null);
  const [droneActionLoading, setDroneActionLoading] = React.useState<string | null>(null);

  const handleMissionAction = async (missionId: string, action: string) => {
    try {
      setMissionActionLoading(missionId + action);
      if (action === 'pause') {
        await pauseMission(missionId);
      } else if (action === 'abort') {
        await abortMission(missionId);
      }
    } finally {
      setMissionActionLoading(null);
    }
  };

  const handleDroneAction = async (droneId: string, action: string) => {
    try {
      setDroneActionLoading(droneId + action);
      if (action === 'deploy') {
        await updateDroneStatus(droneId, 'IN_MISSION');
      }
    } finally {
      setDroneActionLoading(null);
    }
  };

  // Show loading state with skeleton
  if (missionsLoading || dronesLoading || sitesLoading || usersLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (missionsError || dronesError || sitesError || usersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">
            {missionsError?.message || dronesError?.message || sitesError?.message || usersError?.message}
          </p>
        </div>
      </div>
    );
  }

  const activeMissions = missions.filter((m: any) => m.status === 'IN_PROGRESS');
  const availableDrones = drones.filter((d: any) => d.status === 'AVAILABLE');
  const totalUsers = users.length;

  return (
    <div className="">
      <PageHeader
        title="Dashboard"
        description="Overview of your drone management system"
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{missions.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeMissions.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Drones</CardTitle>
                <DroneIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableDrones.length}</div>
                <p className="text-xs text-muted-foreground">
                  of {drones.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sites.filter((s: any) => s.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  of {sites.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  across organization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Missions</CardTitle>
                <CardDescription>
                  Currently running missions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeMissions.slice(0, 3).map((mission: any) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{mission.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(mission.status)}>
                              {mission.status.replace('_', ' ')}
                            </Badge>
                            {mission.progress && (
                              <span className="text-sm text-muted-foreground">
                                {mission.progress}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleMissionAction(mission.id, 'pause')} disabled={missionActionLoading === mission.id + 'pause'}>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleMissionAction(mission.id, 'abort')} disabled={missionActionLoading === mission.id + 'abort'}>
                          <Square className="h-3 w-3 mr-1" />
                          Abort
                        </Button>
                      </div>
                    </div>
                  ))}
                  {activeMissions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No active missions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Drones</CardTitle>
                <CardDescription>
                  Drones ready for missions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableDrones.slice(0, 4).map((drone: any) => (
                    <div key={drone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DroneIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{drone.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getDroneStatusColor(drone.status)}>
                              {drone.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {drone.batteryLevel}% battery
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleDroneAction(drone.id, 'deploy')} disabled={droneActionLoading === drone.id + 'deploy'}>
                        <Play className="h-3 w-3 mr-1" />
                        Deploy
                      </Button>
                    </div>
                  ))}
                  {availableDrones.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <DroneIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No available drones</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Live updates from active missions and drones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Real-time monitoring coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DronesProvider>
      <MissionsProvider>
        <SitesProvider>
          <UsersProvider>
            <DashboardPageContent />
          </UsersProvider>
        </SitesProvider>
      </MissionsProvider>
    </DronesProvider>
  );
} 
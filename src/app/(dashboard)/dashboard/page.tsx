"use client";

import { useState, useEffect } from 'react';
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
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { DronesProvider, useDrones } from '../../../features/data/DronesContext';
import { MissionsProvider, useMissions } from '../../../features/data/MissionsContext';
import { SitesProvider, useSites } from '../../../features/data/SitesContext';
import { UsersProvider, useUsers } from '../../../features/data/UsersContext';
import { DashboardSkeleton } from '../../../components/shared/Skeleton';
import React from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RealTimeDashboard } from '@/components/dashboard/RealTimeDashboard';
import { useAuthContext } from '@/features/auth/AuthContext';

interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  totalDrones: number;
  activeDrones: number;
  totalSites: number;
  totalUsers: number;
  successRate: number;
  avgMissionDuration: number;
}

function DashboardPageContent() {
  const { user } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;

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

  const [stats, setStats] = useState<DashboardStats>({
    totalMissions: 0,
    activeMissions: 0,
    totalDrones: 0,
    activeDrones: 0,
    totalSites: 0,
    totalUsers: 0,
    successRate: 0,
    avgMissionDuration: 0,
  });

  const loading = dronesLoading || missionsLoading || sitesLoading || usersLoading;
  const error = dronesError || missionsError || sitesError || usersError;

  useEffect(() => {
    if (missions && drones && sites && users) {
      const totalMissions = missions.length;
      const activeMissions = missions.filter((mission: { status: string }) => mission.status === 'IN_PROGRESS').length;
      const totalDrones = drones.length;
      const activeDrones = drones.filter((drone: { status: string }) => drone.status === 'ACTIVE').length;
      const totalSites = sites.length;
      const totalUsers = users.length;
      
      const completedMissions = missions.filter((mission: { status: string }) => mission.status === 'COMPLETED');
      const successRate = totalMissions > 0 ? Math.round((completedMissions.length / totalMissions) * 100) : 0;
      
      const avgMissionDuration = totalMissions > 0 ? Math.round(totalMissions / 2) : 0; // Placeholder calculation

      setStats({
        totalMissions,
        activeMissions,
        totalDrones,
        activeDrones,
        totalSites,
        totalUsers,
        successRate,
        avgMissionDuration,
      });
    }
  }, [missions, drones, sites, users]);

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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mt-2">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const activeMissions = missions.filter((m: any) => m.status === 'IN_PROGRESS');
  const availableDrones = drones.filter((d: any) => d.status === 'AVAILABLE');
  const totalUsers = users.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your drone operations.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMissions} active missions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDrones}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDrones} total drones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalMissions} total missions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSites}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers} team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Operations</CardTitle>
          <CardDescription>
            Monitor live drone operations and mission progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RealTimeDashboard />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Missions</CardTitle>
            <CardDescription>
              Latest mission activities and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {missions?.slice(0, 5).map((mission: { id: string; name: string; status: string; createdAt: string }) => (
                <div key={mission.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mission.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(mission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={mission.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {mission.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All drones operational</span>
                </div>
                <Badge variant="outline">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Database connection</span>
                </div>
                <Badge variant="outline">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>GPS signal strength</span>
                </div>
                <Badge variant="outline">Strong</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
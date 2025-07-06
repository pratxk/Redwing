"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Activity, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useOrganizationStats, useMissionStats, useDroneUtilization } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthContext } from '@/features/auth/AuthContext';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuthContext();
  const organizationId = user?.organizationMemberships?.[0]?.organization?.id;

  const { stats: orgStats, loading: orgLoading, error: orgError } = useOrganizationStats(organizationId);
  const { stats: missionStats, loading: missionLoading, error: missionError } = useMissionStats(organizationId, timeRange);
  const { utilization: droneUtilization, loading: droneLoading, error: droneError } = useDroneUtilization(organizationId);

  const loading = orgLoading || missionLoading || droneLoading;
  const error = orgError || missionError || droneError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Analytics</h2>
          <p className="text-muted-foreground mt-2">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your drone operations and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgStats?.totalMissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{missionStats?.growth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgStats?.activeDrones || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orgStats?.totalDrones || 0} total drones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flight Hours</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgStats?.totalFlightHours || 0}h</div>
            <p className="text-xs text-muted-foreground">
              +{missionStats?.flightHoursGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgStats?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {orgStats?.completedMissions || 0} completed missions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="missions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="missions">Mission Trends</TabsTrigger>
          <TabsTrigger value="drones">Drone Performance</TabsTrigger>
          <TabsTrigger value="sites">Site Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission Completion Trends</CardTitle>
              <CardDescription>
                Track mission completion rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Mission trends chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drone Performance Metrics</CardTitle>
              <CardDescription>
                Monitor individual drone performance and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Drone performance chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Activity Analysis</CardTitle>
              <CardDescription>
                Analyze mission activity across different sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Site activity chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
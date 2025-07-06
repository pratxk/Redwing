"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { Map } from '@/components/shared/Map';
import { 
  DroneIcon, 
  Target, 
  MapPin, 
  Plus,
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
  Battery,
  Wrench,
  Zap
} from 'lucide-react';
import { useDrones, DronesProvider } from '../../../features/data/DronesContext';
import AddDroneModal from '../../../components/modals/AddDroneModal';
import { 
  DroneCardSkeleton, 
  PageSkeleton, 
  MapSkeleton 
} from '../../../components/shared/Skeleton';

function DronesPageContent() {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [showAddDroneModal, setShowAddDroneModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { drones, loading, error, addDrone, updateDroneStatus, refetch } = useDrones() as unknown as {
    drones: any[];
    loading: boolean;
    error: any;
    addDrone: (drone: any) => Promise<void>;
    updateDroneStatus: (id: string, status: string) => Promise<void>;
    refetch: () => Promise<void>;
  };

  const handleMarkerClick = (id: string, type: 'drone' | 'mission' | 'site') => {
    if (type === 'drone') {
      setSelectedDrone(id);
    }
  };

  const handleDroneAction = async (droneId: string, action: string) => {
    try {
      setActionLoading(droneId);
      let newStatus = 'AVAILABLE';
      switch (action) {
        case 'deploy':
          newStatus = 'IN_MISSION';
          break;
        case 'return':
          newStatus = 'AVAILABLE';
          break;
        case 'maintenance':
          newStatus = 'MAINTENANCE';
          break;
        case 'charge':
          newStatus = 'CHARGING';
          break;
        case 'offline':
          newStatus = 'OFFLINE';
          break;
        case 'online':
          newStatus = 'AVAILABLE';
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }
      
      await updateDroneStatus(droneId, newStatus);
    } catch (error) {
      console.error('Drone action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      IN_MISSION: 'bg-blue-100 text-blue-800',
      MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      CHARGING: 'bg-purple-100 text-purple-800',
      OFFLINE: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-600';
    if (level <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const needsCharging = (level: number) => level <= 30;

  // Show loading state with skeleton
  if (loading) {
    return <PageSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">Error Loading Drones</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const availableDrones = drones?.filter((d: any) => d.status === 'AVAILABLE') || [];
  const inMissionDrones = drones?.filter((d: any) => d.status === 'IN_MISSION') || [];
  const maintenanceDrones = drones?.filter((d: any) => d.status === 'MAINTENANCE') || [];
  const chargingDrones = drones?.filter((d: any) => d.status === 'CHARGING') || [];
  const offlineDrones = drones?.filter((d: any) => d.status === 'OFFLINE') || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drones"
        description="Manage your drone fleet and monitor their status"
      >
        <Button onClick={() => setShowAddDroneModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Drone
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
                <DroneIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{drones?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {availableDrones.length} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Mission</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inMissionDrones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently deployed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceDrones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Under maintenance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Charging</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chargingDrones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Battery charging
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offlineDrones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Not available
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Drones</CardTitle>
                <CardDescription>
                  Drones ready for deployment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableDrones.map((drone: any) => (
                    <div key={drone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DroneIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{drone.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(drone.status)}>
                              {drone.status.replace('_', ' ')}
                            </Badge>
                            <span className={`text-sm ${getBatteryColor(drone.batteryLevel || 0)}`}>
                              <Battery className="h-3 w-3 inline mr-1" />
                              {drone.batteryLevel || 0}%
                              {needsCharging(drone.batteryLevel || 0) && (
                                <span className="ml-1 text-red-500">⚠️</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end items-center min-w-0">
                        <Button 
                          size="sm"
                          onClick={() => handleDroneAction(drone.id, 'deploy')}
                          disabled={loading || actionLoading === drone.id}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Deploy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDroneAction(drone.id, 'maintenance')}
                          disabled={loading || actionLoading === drone.id}
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Maintenance
                        </Button>
                      </div>
                    </div>
                  ))}
                  {availableDrones.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DroneIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No available drones</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Missions</CardTitle>
                <CardDescription>
                  Drones currently in mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inMissionDrones.slice(0, 3).map((drone: any) => (
                    <div key={drone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DroneIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{drone.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(drone.status)}>
                              {drone.status.replace('_', ' ')}
                            </Badge>
                            <span className={`text-sm ${getBatteryColor(drone.batteryLevel || 0)}`}>
                              <Battery className="h-3 w-3 inline mr-1" />
                              {drone.batteryLevel || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end items-center min-w-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDroneAction(drone.id, 'return')}
                          disabled={loading || actionLoading === drone.id}
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Return
                        </Button>
                      </div>
                    </div>
                  ))}
                  {inMissionDrones.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No drones in mission</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charging & Maintenance</CardTitle>
                <CardDescription>
                  Drones being charged or maintained
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...chargingDrones, ...maintenanceDrones].slice(0, 3).map((drone: any) => (
                    <div key={drone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DroneIcon className={`h-6 w-6 ${drone.status === 'CHARGING' ? 'text-purple-600' : 'text-yellow-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{drone.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(drone.status)}>
                              {drone.status.replace('_', ' ')}
                            </Badge>
                            <span className={`text-sm ${getBatteryColor(drone.batteryLevel || 0)}`}>
                              <Battery className="h-3 w-3 inline mr-1" />
                              {drone.batteryLevel || 0}%
                              {needsCharging(drone.batteryLevel || 0) && (
                                <span className="ml-1 text-red-500">⚠️</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end items-center min-w-0">
                        <Button 
                          size="sm"
                          onClick={() => handleDroneAction(drone.id, 'online')}
                          disabled={loading || actionLoading === drone.id}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {drone.status === 'CHARGING' ? 'Set Available' : 'Complete'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {chargingDrones.length === 0 && maintenanceDrones.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No drones charging or in maintenance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drone Fleet Map</CardTitle>
              <CardDescription>
                Real-time location of all drones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Map
                height="600px"
                drones={drones || []}
                missions={[]}
                sites={[]}
                onMarkerClick={handleMarkerClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Management</CardTitle>
              <CardDescription>
                Complete overview of all drones in your fleet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drones?.map((drone: any) => (
                  <div key={drone.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <DroneIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{drone.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(drone.status)}>
                              {drone.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {drone.model || 'Unknown Model'}
                            </Badge>
                            <span className={`text-sm ${getBatteryColor(drone.batteryLevel || 0)}`}>
                              <Battery className="h-3 w-3 inline mr-1" />
                              {drone.batteryLevel || 0}%
                              {needsCharging(drone.batteryLevel || 0) && (
                                <span className="ml-1 text-red-500">⚠️</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>Serial: {drone.serialNumber || 'N/A'}</span>
                            <span>Max Flight: {drone.maxFlightTime || 0}m</span>
                            <span>Max Speed: {drone.maxSpeed || 0} m/s</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end items-center min-w-0">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {drone.status === 'AVAILABLE' && (
                          <Button 
                            size="sm"
                            onClick={() => handleDroneAction(drone.id, 'deploy')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Deploy
                          </Button>
                        )}
                        {drone.status === 'IN_MISSION' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDroneAction(drone.id, 'return')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <Square className="h-3 w-3 mr-1" />
                            Return
                          </Button>
                        )}
                        {drone.status === 'CHARGING' && (
                          <Button 
                            size="sm"
                            onClick={() => handleDroneAction(drone.id, 'online')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Set Available
                          </Button>
                        )}
                        {drone.status === 'MAINTENANCE' && (
                          <Button 
                            size="sm"
                            onClick={() => handleDroneAction(drone.id, 'online')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete Maintenance
                          </Button>
                        )}
                        {drone.status === 'OFFLINE' && (
                          <Button 
                            size="sm"
                            onClick={() => handleDroneAction(drone.id, 'online')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Bring Online
                          </Button>
                        )}
                        {drone.status !== 'MAINTENANCE' && drone.status !== 'OFFLINE' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDroneAction(drone.id, 'maintenance')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <Wrench className="h-3 w-3 mr-1" />
                            Maintenance
                          </Button>
                        )}
                        {drone.status !== 'OFFLINE' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDroneAction(drone.id, 'offline')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Set Offline
                          </Button>
                        )}
                        {needsCharging(drone.batteryLevel || 0) && drone.status === 'AVAILABLE' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDroneAction(drone.id, 'charge')}
                            disabled={loading || actionLoading === drone.id}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Charge
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddDroneModal 
        isOpen={showAddDroneModal} 
        onClose={() => setShowAddDroneModal(false)} 
      />
    </div>
  );
}

export default function DronesPage() {
  return (
    <DronesProvider>
      <DronesPageContent />
    </DronesProvider>
  );
} 
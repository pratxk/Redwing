"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Battery,
  Signal,
  RefreshCw,
  Target
} from 'lucide-react';

interface RealTimeData {
  drones: {
    id: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'FLYING' | 'MAINTENANCE';
    batteryLevel: number;
    signalStrength: number;
    lastUpdate: string;
    location: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
  }[];
  missions: {
    id: string;
    name: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABORTED';
    progress: number;
    startTime: string;
    estimatedEndTime: string;
    droneId: string;
  }[];
  alerts: {
    id: string;
    type: 'LOW_BATTERY' | 'SIGNAL_LOSS' | 'WEATHER_WARNING' | 'GEOFENCE_VIOLATION';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    acknowledged: boolean;
  }[];
}

const mockRealTimeData: RealTimeData = {
  drones: [
    {
      id: '1',
      name: 'DJI Mavic 3 Pro',
      status: 'FLYING',
      batteryLevel: 78,
      signalStrength: 95,
      lastUpdate: new Date().toISOString(),
      location: { latitude: 40.7128, longitude: -74.0060, altitude: 120 },
    },
    {
      id: '2',
      name: 'DJI Phantom 4 Pro',
      status: 'ONLINE',
      batteryLevel: 45,
      signalStrength: 88,
      lastUpdate: new Date().toISOString(),
      location: { latitude: 40.7829, longitude: -73.9654, altitude: 0 },
    },
    {
      id: '3',
      name: 'DJI Agras T30',
      status: 'MAINTENANCE',
      batteryLevel: 12,
      signalStrength: 0,
      lastUpdate: new Date().toISOString(),
      location: { latitude: 40.7328, longitude: -74.0060, altitude: 0 },
    },
  ],
  missions: [
    {
      id: '1',
      name: 'Downtown Security Patrol',
      status: 'IN_PROGRESS',
      progress: 65,
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      estimatedEndTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      droneId: '1',
    },
    {
      id: '2',
      name: 'Construction Site Inspection',
      status: 'PENDING',
      progress: 0,
      startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      estimatedEndTime: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      droneId: '2',
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'LOW_BATTERY',
      message: 'DJI Agras T30 battery level critical (12%)',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'WEATHER_WARNING',
      message: 'High winds detected in Downtown Area',
      severity: 'MEDIUM',
      timestamp: new Date().toISOString(),
      acknowledged: true,
    },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ONLINE':
    case 'FLYING':
      return 'bg-green-100 text-green-800';
    case 'OFFLINE':
    case 'MAINTENANCE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getMissionStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
    case 'ABORTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RealTimeDashboard() {
  const [data, setData] = useState<RealTimeData>(mockRealTimeData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { isConnected, isConnecting, subscribe, unsubscribe } = useWebSocket({
    onMessage: (message) => {
      // Update data based on WebSocket messages
      if (message.type === 'drone_update') {
        setData(prev => ({
          ...prev,
          drones: prev.drones.map(drone => 
            drone.id === message.data.id ? { ...drone, ...message.data } : drone
          ),
        }));
      } else if (message.type === 'mission_update') {
        setData(prev => ({
          ...prev,
          missions: prev.missions.map(mission => 
            mission.id === message.data.id ? { ...mission, ...message.data } : mission
          ),
        }));
      }
      setLastUpdate(new Date());
    },
  });

  useEffect(() => {
    // Subscribe to real-time updates
    subscribe('drones');
    subscribe('missions');
    subscribe('alerts');

    return () => {
      unsubscribe('drones');
      unsubscribe('missions');
      unsubscribe('alerts');
    };
  }, [subscribe, unsubscribe]);

  const acknowledgeAlert = (alertId: string) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  };

  const onlineDrones = data.drones.filter(drone => drone.status !== 'OFFLINE');
  const activeMissions = data.missions.filter(mission => mission.status === 'IN_PROGRESS');
  const unacknowledgedAlerts = data.alerts.filter(alert => !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Real-Time Status</CardTitle>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              {isConnecting && <RefreshCw className="h-3 w-3 animate-spin" />}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Drones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineDrones.length}</div>
            <p className="text-xs text-muted-foreground">
              of {data.drones.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions.length}</div>
            <p className="text-xs text-muted-foreground">
              in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unacknowledgedAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              unacknowledged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(data.drones.reduce((sum, drone) => sum + drone.batteryLevel, 0) / data.drones.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              across all drones
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drone Status */}
        <Card>
          <CardHeader>
            <CardTitle>Drone Status</CardTitle>
            <CardDescription>
              Real-time status of all drones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.drones.map((drone) => (
                <div key={drone.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <h4 className="font-medium">{drone.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge className={getStatusColor(drone.status)}>
                          {drone.status}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Battery className="h-3 w-3" />
                          <span>{drone.batteryLevel}%</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Signal className="h-3 w-3" />
                          <span>{drone.signalStrength}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(drone.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Progress</CardTitle>
            <CardDescription>
              Current mission status and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.missions.map((mission) => (
                <div key={mission.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{mission.name}</h4>
                    <Badge className={getMissionStatusColor(mission.status)}>
                      {mission.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {mission.status === 'IN_PROGRESS' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{mission.progress}%</span>
                      </div>
                      <Progress value={mission.progress} className="h-2" />
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Started: {new Date(mission.startTime).toLocaleTimeString()}</span>
                    </div>
                    {mission.status === 'IN_PROGRESS' && (
                      <div className="flex items-center space-x-1">
                        <span>ETA: {new Date(mission.estimatedEndTime).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              System alerts requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unacknowledgedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">{alert.message}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
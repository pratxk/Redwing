"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMission } from "@/hooks/useMissions";
import { useDroneWebSocket } from "@/hooks/useDroneWebSocket";
import { Map } from "@/components/shared/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, RefreshCw, Play, Pause, Square } from "lucide-react";

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params.id as string;
  const { mission, loading, error } = useMission(missionId);
  const [showRealTimeTracking, setShowRealTimeTracking] = useState(false);

  // Convert mission waypoints to polyline format for the map
  const missionPolyline = mission?.waypoints?.map((waypoint: any) => ({
    lat: waypoint.latitude,
    lng: waypoint.longitude,
  })) || [];

  // WebSocket connection for real-time tracking
  const {
    polyline: plannedPolyline,
    positions: actualPositions,
    currentPosition,
    connectionStatus,
    clearPath,
  } = useDroneWebSocket({
    missionId: showRealTimeTracking ? missionId : undefined,
    droneId: mission?.droneId,
  });

  // Use WebSocket polyline if available, otherwise use mission waypoints
  const displayPolyline = plannedPolyline.length > 0 ? plannedPolyline : missionPolyline;

  // Auto-enable tracking for active missions
  useEffect(() => {
    if (mission?.status === "IN_PROGRESS") {
      setShowRealTimeTracking(true);
    }
  }, [mission?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading mission details...</p>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertDescription>
            {typeof error === "string"
              ? error
              : error?.message || "Mission not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED":
        return "bg-gray-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "ABORTED":
        return "bg-red-500";
      case "FAILED":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "open":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
      case "closed":
      case "error":
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{mission.name}</h1>
          <p className="text-gray-600 mt-1">{mission.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(mission.status)}>
            {mission.status}
          </Badge>
          {showRealTimeTracking && (
            <div className="flex items-center gap-2 text-sm">
              {getConnectionStatusIcon()}
              <span className="capitalize">{connectionStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Real-time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={showRealTimeTracking ? "default" : "outline"}
              onClick={() => setShowRealTimeTracking(!showRealTimeTracking)}
              disabled={mission.status === "COMPLETED" || mission.status === "ABORTED" || mission.status === "FAILED"}
            >
              {showRealTimeTracking ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking
                </>
              )}
            </Button>
            
            {showRealTimeTracking && (
              <Button variant="outline" onClick={clearPath} size="sm">
                <Square className="h-4 w-4 mr-2" />
                Clear Path
              </Button>
            )}
            
            {(mission.status === "COMPLETED" || mission.status === "ABORTED" || mission.status === "FAILED") && (
              <p className="text-sm text-gray-500">
                Real-time tracking is not available for completed/aborted missions
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mission Map */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Map</CardTitle>
        </CardHeader>
        <CardContent>
          <Map
            height="600px"
            missions={[mission]}
            showRealTimeTracking={showRealTimeTracking || displayPolyline.length > 0}
            plannedPolyline={displayPolyline}
            actualPositions={actualPositions}
            currentPosition={currentPosition}
          />
        </CardContent>
      </Card>

      {/* Mission Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <p className="text-lg">{mission.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p className="text-lg">
                {new Date(mission.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Waypoints
              </label>
              <p className="text-lg">{mission.waypoints?.length || 0}</p>
            </div>
            {mission.drone && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Assigned Drone
                </label>
                <p className="text-lg">{mission.drone.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showRealTimeTracking ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Connection
                  </label>
                  <div className="flex items-center gap-2">
                    {getConnectionStatusIcon()}
                    <span className="capitalize">{connectionStatus}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Current Position
                  </label>
                  {currentPosition ? (
                    <p className="text-lg">
                      {currentPosition.lat.toFixed(6)},{" "}
                      {currentPosition.lng.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-gray-500">No position data</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Path Points
                  </label>
                  <p className="text-lg">{actualPositions.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Planned Path
                  </label>
                  <p className="text-lg">{displayPolyline.length} points</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Planned Path
                  </label>
                  <p className="text-lg">{displayPolyline.length} waypoints</p>
                </div>
                <p className="text-gray-500">
                  Enable real-time tracking to see live data
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Waypoints List */}
      {mission.waypoints && mission.waypoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Waypoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mission.waypoints.map((waypoint: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">Waypoint {index + 1}</span>
                    <p className="text-sm text-gray-600">
                      {waypoint.latitude.toFixed(6)},{" "}
                      {waypoint.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{waypoint.altitude}m</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

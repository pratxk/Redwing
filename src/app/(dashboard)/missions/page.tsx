"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/PageHeader";
import { Map } from "@/components/shared/Map";
import {
  Target,
  DroneIcon,
  MapPin,
  Plus,
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  useMissions,
  MissionsProvider,
} from "../../../features/data/MissionsContext";
import { DronesProvider } from "../../../features/data/DronesContext";
import { SitesProvider } from "../../../features/data/SitesContext";
import AddMissionModal from "../../../components/modals/AddMissionModal";
import {
  MissionCardSkeleton,
  PageSkeleton,
  MapSkeleton,
} from "../../../components/shared/Skeleton";
import { useDrones } from "@/features/data/DronesContext";
import { useSites } from "@/features/data/SitesContext";
import { Site } from "@/types/mission";

function MissionsPageContent() {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showAddMissionModal, setShowAddMissionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const {
    drones,
    loading: dronesLoading,
    error: dronesError,
    addDrone,
    refetch: refetchDrones,
  } = useDrones() as unknown as {
    drones: any[];
    loading: boolean;
    error: any;
    addDrone: (drone: any) => Promise<void>;
    refetch: () => Promise<void>;
  };
  const {
    missions,
    loading: missionsLoading,
    error: missionsError,
    addMission,
    updateMission,
    deleteMission,
    startMission,
    pauseMission,
    resumeMission,
    abortMission,
    completeMission,
    refetch: refetchMissions,
  } = useMissions() as unknown as {
    missions: any[];
    loading: boolean;
    error: any;
    addMission: (mission: any) => Promise<void>;
    updateMission: (id: string, missionData: any) => Promise<void>;
    deleteMission: (id: string) => Promise<void>;
    startMission: (id: string) => Promise<void>;
    pauseMission: (id: string) => Promise<void>;
    resumeMission: (id: string) => Promise<void>;
    abortMission: (id: string) => Promise<void>;
    completeMission: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
  const {
    sites,
    loading: sitesLoading,
    error: sitesError,
    addSite,
    refetch: refetchSites,
  } = useSites() as {
    sites: (Site & {
      missions?: {
        id: string;
        status: string;
        createdAt: string;
        type: string;
        name: string;
      }[];
    })[];
    loading: boolean;
    error: any;
    addSite: (site: Site) => void;
    refetch: () => Promise<void>;
  };

  const handleMarkerClick = (
    id: string,
    type: "drone" | "mission" | "site"
  ) => {
    if (type === "mission") {
      setSelectedMission(id);
    }
  };

  const handleMissionAction = async (missionId: string, action: string) => {
    try {
      setActionLoading(missionId);
      
      switch (action) {
        case "start":
          await startMission(missionId);
          break;
        case "pause":
          await pauseMission(missionId);
          break;
        case "resume":
          await resumeMission(missionId);
          break;
        case "abort":
          await abortMission(missionId);
          break;
        case "complete":
          await completeMission(missionId);
          break;
        case "delete":
          if (confirm("Are you sure you want to delete this mission?")) {
            await deleteMission(missionId);
          }
          break;
        default:
          console.warn("Unknown action:", action);
          return;
      }
      
      await refetchMissions();
    } catch (error) {
      console.error("Mission action failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNED: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      ABORTED: "bg-red-100 text-red-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800";
    if (priority >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  // Calculate mission statistics
  const missionStats = {
    total: missions?.length || 0,
    planned: missions?.filter((m: any) => m.status === "PLANNED").length || 0,
    inProgress: missions?.filter((m: any) => m.status === "IN_PROGRESS").length || 0,
    completed: missions?.filter((m: any) => m.status === "COMPLETED").length || 0,
    aborted: missions?.filter((m: any) => m.status === "ABORTED").length || 0,
    failed: missions?.filter((m: any) => m.status === "FAILED").length || 0,
  };

  const getMissionActions = (mission: any) => {
    const actions = [];
    
    switch (mission.status) {
      case "PLANNED":
        actions.push(
          <Button
            key="start"
            size="sm"
            onClick={() => handleMissionAction(mission.id, "start")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        );
        actions.push(
          <Button
            key="abort"
            size="sm"
            variant="destructive"
            onClick={() => handleMissionAction(mission.id, "abort")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <Square className="h-3 w-3 mr-1" />
            Abort
          </Button>
        );
        // Can delete planned missions
        actions.push(
          <Button
            key="delete"
            size="sm"
            variant="outline"
            onClick={() => handleMissionAction(mission.id, "delete")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Delete
          </Button>
        );
        break;
      case "IN_PROGRESS":
        actions.push(
          <Button
            key="pause"
            size="sm"
            variant="outline"
            onClick={() => handleMissionAction(mission.id, "pause")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <Pause className="h-3 w-3 mr-1" />
            Pause
          </Button>
        );
        actions.push(
          <Button
            key="complete"
            size="sm"
            onClick={() => handleMissionAction(mission.id, "complete")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        );
        actions.push(
          <Button
            key="abort"
            size="sm"
            variant="destructive"
            onClick={() => handleMissionAction(mission.id, "abort")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <Square className="h-3 w-3 mr-1" />
            Abort
          </Button>
        );
        break;
      case "PLANNED": // This is for paused missions (they become PLANNED again)
        if (mission.startedAt) { // If it was started before, it's paused
          actions.push(
            <Button
              key="resume"
              size="sm"
              onClick={() => handleMissionAction(mission.id, "resume")}
              disabled={missionsLoading || actionLoading === mission.id}
            >
              <Play className="h-3 w-3 mr-1" />
              Resume
            </Button>
          );
          actions.push(
            <Button
              key="abort"
              size="sm"
              variant="destructive"
              onClick={() => handleMissionAction(mission.id, "abort")}
              disabled={missionsLoading || actionLoading === mission.id}
            >
              <Square className="h-3 w-3 mr-1" />
              Abort
            </Button>
          );
        }
        break;
      case "COMPLETED":
      case "ABORTED":
      case "FAILED":
        // Can delete completed/aborted/failed missions
        actions.push(
          <Button
            key="delete"
            size="sm"
            variant="outline"
            onClick={() => handleMissionAction(mission.id, "delete")}
            disabled={missionsLoading || actionLoading === mission.id}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Delete
          </Button>
        );
        break;
    }
    
    return actions;
  };

  // Show loading state with skeleton
  if (missionsLoading || dronesLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  if (missionsError || dronesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">
            Error Loading Missions
          </h2>
          <p className="text-muted-foreground">
            {missionsError?.message || dronesError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Missions"
        description="Manage and monitor drone missions"
      >
        <Button onClick={() => setShowAddMissionModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Mission
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">Mission List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Missions
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missionStats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {missionStats.inProgress} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planned
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missionStats.planned}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting execution
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {missionStats.completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Duration
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">40m</div>
                <p className="text-xs text-muted-foreground">
                  Across all missions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Missions</CardTitle>
              <CardDescription>
                Latest mission activities and status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missions.slice(0, 5).map((mission: any) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{mission.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={getPriorityColor(mission.priority || 5)}
                          >
                            Priority {mission.priority || 5}
                          </Badge>
                          {mission.progress !== undefined && mission.progress > 0 && (
                            <Badge variant="outline">
                              {Math.round(mission.progress)}% Complete
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <DroneIcon className="h-3 w-3 mr-1" />
                            {mission.drone?.name || "No drone assigned"}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {mission.site?.name || "No site assigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMissionActions(mission)}
                    </div>
                  </div>
                ))}
                {missions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No missions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Missions</CardTitle>
                <CardDescription>
                  Missions currently in progress or planned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missions.filter((m: any) => m.status === "IN_PROGRESS" || m.status === "PLANNED").slice(0, 3).map((mission: any) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Target className={`h-6 w-6 ${mission.status === "IN_PROGRESS" ? "text-blue-600" : "text-gray-600"}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{mission.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(mission.status)}>
                              {mission.status.replace("_", " ")}
                            </Badge>
                            {mission.progress !== undefined && mission.progress > 0 && (
                              <Badge variant="outline">
                                {Math.round(mission.progress)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMissionActions(mission)}
                      </div>
                    </div>
                  ))}
                  {missions.filter((m: any) => m.status === "IN_PROGRESS" || m.status === "PLANNED").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No active missions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Missions</CardTitle>
                <CardDescription>
                  Recently completed and aborted missions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missions.filter((m: any) => m.status === "COMPLETED" || m.status === "ABORTED" || m.status === "FAILED").slice(0, 3).map((mission: any) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Target className={`h-6 w-6 ${mission.status === "COMPLETED" ? "text-green-600" : mission.status === "ABORTED" ? "text-red-600" : "text-orange-600"}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{mission.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(mission.status)}>
                              {mission.status.replace("_", " ")}
                            </Badge>
                            {mission.completedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(mission.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMissionActions(mission)}
                      </div>
                    </div>
                  ))}
                  {missions.filter((m: any) => m.status === "COMPLETED" || m.status === "ABORTED" || m.status === "FAILED").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No completed missions</p>
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
              <CardTitle>Mission Map</CardTitle>
              <CardDescription>
                Real-time view of drones, missions, and sites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Map
                height="600px"
                drones={drones}
                missions={missions}
                sites={sites}
                onMarkerClick={handleMarkerClick}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Missions</CardTitle>
              <CardDescription>
                Complete list of missions with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missions.map((mission: any) => (
                  <div key={mission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{mission.name}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={getPriorityColor(mission.priority || 5)}
                          >
                            Priority {mission.priority || 5}
                          </Badge>
                          <Badge variant="outline">
                            {mission.type?.replace("_", " ") || "Unknown"}
                          </Badge>
                          {mission.progress !== undefined && mission.progress > 0 && (
                            <Badge variant="outline">
                              {Math.round(mission.progress)}% Complete
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            Scheduled:{" "}
                            {mission.scheduledAt
                              ? new Date(mission.scheduledAt).toLocaleString()
                              : "Not scheduled"}
                          </span>
                          <span>
                            Duration: {mission.estimatedDuration || 0}m
                          </span>
                          {mission.progress && mission.progress > 0 && (
                            <span>Progress: {Math.round(mission.progress)}%</span>
                          )}
                          {mission.startedAt && (
                            <span>
                              Started: {new Date(mission.startedAt).toLocaleString()}
                            </span>
                          )}
                          {mission.completedAt && (
                            <span>
                              Completed: {new Date(mission.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <DroneIcon className="h-3 w-3 mr-1" />
                            {mission.drone?.name || "No drone assigned"}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {mission.site?.name || "No site assigned"}
                          </span>
                          <span>
                            Created by: {mission.createdBy?.firstName} {mission.createdBy?.lastName}
                          </span>
                          {mission.assignedTo && (
                            <span>
                              Assigned to: {mission.assignedTo?.firstName} {mission.assignedTo?.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {getMissionActions(mission)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddMissionModal
        isOpen={showAddMissionModal}
        onClose={() => setShowAddMissionModal(false)}
      />
    </div>
  );
}

export default function MissionsPage() {
  return (
    <DronesProvider>
      <SitesProvider>
        <MissionsProvider>
          <MissionsPageContent />
        </MissionsProvider>
      </SitesProvider>
    </DronesProvider>
  );
}

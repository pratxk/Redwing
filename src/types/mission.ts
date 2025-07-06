// Mission and related types
export interface Mission {
  id: string;
  name: string;
  description?: string;
  type: MissionType;
  status: MissionStatus;
  priority: number;
  flightPattern: FlightPattern;
  plannedAltitude: number;
  plannedSpeed: number;
  overlapPercentage: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  progress?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  assignedTo?: User;
  drone: Drone;
  site: Site;
  waypoints: Waypoint[];
}

export interface Drone {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: DroneStatus;
  batteryLevel: number;
  lastMaintenanceAt?: Date;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAltitude?: number;
  isActive: boolean;
  maxFlightTime: number;
  maxSpeed: number;
  maxAltitude: number;
  cameraResolution?: string;
  sensorTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Waypoint {
  id: string;
  sequence: number;
  latitude: number;
  longitude: number;
  altitude: number;
  action?: string;
  parameters?: any;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export type MissionType = 'INSPECTION' | 'SECURITY_PATROL' | 'SITE_MAPPING' | 'SURVEY';
export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED' | 'FAILED';
export type DroneStatus = 'AVAILABLE' | 'IN_MISSION' | 'MAINTENANCE' | 'CHARGING' | 'OFFLINE';
export type FlightPattern = 'CROSSHATCH' | 'PERIMETER' | 'WAYPOINT' | 'GRID' | 'SPIRAL'; 
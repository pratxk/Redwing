"use client";

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  drones?: DroneMarker[];
  missions?: MissionData[];
  sites?: SiteMarker[];
  onMarkerClick?: (id: string, type: 'drone' | 'mission' | 'site') => void;
}

interface DroneMarker {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAltitude?: number;
  status: 'AVAILABLE' | 'IN_MISSION' | 'MAINTENANCE' | 'CHARGING' | 'OFFLINE';
  batteryLevel: number;
}

interface MissionData {
  id: string;
  name: string;
  waypoints: Array<{
    latitude: number;
    longitude: number;
    altitude: number;
  }>;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED' | 'FAILED';
  currentPosition?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

interface SiteMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

const getDroneIcon = (status: string) => {
  const colors = {
    AVAILABLE: '#10b981',
    IN_MISSION: '#3b82f6',
    MAINTENANCE: '#f59e0b',
    CHARGING: '#8b5cf6',
    OFFLINE: '#ef4444',
  };

  return L.divIcon({
    className: 'custom-drone-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: ${colors[status as keyof typeof colors] || '#6b7280'};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getMissionIcon = (status: string) => {
  const colors = {
    PLANNED: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    COMPLETED: '#10b981',
    ABORTED: '#ef4444',
    FAILED: '#dc2626',
  };

  return L.divIcon({
    className: 'custom-mission-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${colors[status as keyof typeof colors] || '#6b7280'};
        border: 2px solid white;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const getSiteIcon = () => {
  return L.divIcon({
    className: 'custom-site-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #8b5cf6;
        border: 2px solid white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 2px;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export function Map({
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 10,
  height = '500px',
  className = '',
  drones = [],
  missions = [],
  sites = [],
  onMarkerClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && (drones.length > 0 || missions.length > 0 || sites.length > 0)) {
      const bounds = L.latLngBounds([]);
      
      drones.forEach(drone => {
        const lat = drone.latitude ?? drone.currentLatitude;
        const lng = drone.longitude ?? drone.currentLongitude;
        if (lat != null && lng != null) {
          bounds.extend([lat, lng]);
        }
      });
      
      missions.forEach(mission => {
        mission.waypoints.forEach(waypoint => {
          bounds.extend([waypoint.latitude, waypoint.longitude]);
        });
        if (mission.currentPosition) {
          bounds.extend([mission.currentPosition.latitude, mission.currentPosition.longitude]);
        }
      });
      
      sites.forEach(site => {
        bounds.extend([site.latitude, site.longitude]);
      });
      
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [drones, missions, sites]);

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Site Markers */}
        {sites.map((site) => (
          <Marker
            key={`site-${site.id}`}
            position={[site.latitude, site.longitude]}
            icon={getSiteIcon()}
            eventHandlers={{
              click: () => onMarkerClick?.(site.id, 'site'),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{site.name}</h3>
                {site.description && (
                  <p className="text-sm text-gray-600">{site.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Mission Paths and Markers */}
        {missions.map((mission) => (
          <div key={`mission-${mission.id}`}>
            {/* Mission Path */}
            {mission.waypoints.length > 1 && (
              <Polyline
                positions={mission.waypoints.map(wp => [wp.latitude, wp.longitude])}
                color={mission.status === 'IN_PROGRESS' ? '#3b82f6' : '#6b7280'}
                weight={3}
                opacity={0.7}
              />
            )}
            
            {/* Mission Start Marker */}
            {mission.waypoints.length > 0 && (
              <Marker
                position={[mission.waypoints[0].latitude, mission.waypoints[0].longitude]}
                icon={getMissionIcon(mission.status)}
                eventHandlers={{
                  click: () => onMarkerClick?.(mission.id, 'mission'),
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-semibold">{mission.name}</h3>
                    <p className="text-sm text-gray-600">Status: {mission.status}</p>
                    <p className="text-xs text-gray-500">
                      {mission.waypoints.length} waypoints
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Current Position Marker */}
            {mission.currentPosition && (
              <Circle
                center={[mission.currentPosition.latitude, mission.currentPosition.longitude]}
                radius={50}
                color="#3b82f6"
                fillColor="#3b82f6"
                fillOpacity={0.3}
              />
            )}
          </div>
        ))}
        
        {/* Drone Markers */}
        {drones.map((drone) => {
          const lat = drone.latitude ?? drone.currentLatitude;
          const lng = drone.longitude ?? drone.currentLongitude;
          const alt = drone.altitude ?? drone.currentAltitude;
          
          if (lat == null || lng == null) {
            return null;
          }
          
          return (
            <Marker
              key={`drone-${drone.id}`}
              position={[lat, lng]}
              icon={getDroneIcon(drone.status)}
              eventHandlers={{
                click: () => onMarkerClick?.(drone.id, 'drone'),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{drone.name}</h3>
                  <p className="text-sm text-gray-600">Status: {drone.status}</p>
                  <p className="text-sm text-gray-600">Battery: {drone.batteryLevel}%</p>
                  {alt != null && (
                    <p className="text-sm text-gray-600">Altitude: {alt}m</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
} 
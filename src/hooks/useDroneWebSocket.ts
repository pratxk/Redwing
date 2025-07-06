import { useEffect, useRef, useState, useCallback } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface Position extends LatLng {
  timestamp: number;
}

type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

export function useDroneWebSocket({ missionId, droneId }: { missionId?: string; droneId?: string }) {
  const [polyline, setPolyline] = useState<LatLng[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  const url = typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:4000/ws?${missionId ? `missionId=${missionId}` : ''}${droneId ? `&droneId=${droneId}` : ''}`
    : '';

  useEffect(() => {
    if (!missionId && !droneId) return;
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    function connect() {
      setConnectionStatus('connecting');
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnectionStatus('open');
      ws.onclose = () => {
        setConnectionStatus('closed');
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
      ws.onerror = () => setConnectionStatus('error');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'missionPolyline') {
            setPolyline(msg.polyline);
          } else if (msg.type === 'dronePosition') {
            setCurrentPosition({ lat: msg.lat, lng: msg.lng, timestamp: msg.timestamp });
            setPositions((prev) => [...prev, { lat: msg.lat, lng: msg.lng, timestamp: msg.timestamp }]);
          }
        } catch {}
      };
    }

    connect();
    return () => {
      isUnmounted = true;
      wsRef.current?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, droneId, url]);

  const clearPath = useCallback(() => {
    setPositions([]);
    setCurrentPosition(null);
  }, []);

  return { polyline, positions, currentPosition, connectionStatus, clearPath };
} 
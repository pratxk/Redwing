import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: 'drone_update' | 'mission_update' | 'flight_data' | 'alert';
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws',
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
          
          // Handle different message types
          switch (message.type) {
            case 'drone_update':
              handleDroneUpdate(message.data);
              break;
            case 'mission_update':
              handleMissionUpdate(message.data);
              break;
            case 'flight_data':
              handleFlightData(message.data);
              break;
            case 'alert':
              handleAlert(message.data);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
        console.log('WebSocket disconnected:', event.code, event.reason);

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setReconnectAttempts(reconnectAttemptsRef.current);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setIsConnecting(false);
        onError?.(error);
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  // Message handlers
  const handleDroneUpdate = (data: any) => {
    // Handle drone status updates
    if (data.status === 'OFFLINE') {
      toast.error(`Drone ${data.name} went offline`);
    } else if (data.status === 'LOW_BATTERY') {
      toast.warning(`Drone ${data.name} has low battery (${data.batteryLevel}%)`);
    }
  };

  const handleMissionUpdate = (data: any) => {
    // Handle mission status updates
    switch (data.status) {
      case 'COMPLETED':
        toast.success(`Mission "${data.name}" completed successfully`);
        break;
      case 'FAILED':
        toast.error(`Mission "${data.name}" failed`);
        break;
      case 'ABORTED':
        toast.warning(`Mission "${data.name}" was aborted`);
        break;
    }
  };

  const handleFlightData = (data: any) => {
    // Handle real-time flight data
    // This could be used to update map positions, etc.
    console.log('Flight data received:', data);
  };

  const handleAlert = (data: any) => {
    // Handle system alerts
    toast.error(`Alert: ${data.message}`, {
      description: data.description,
    });
  };

  // Subscribe to specific channels
  const subscribe = useCallback((channel: string, filters?: any) => {
    sendMessage({
      type: 'subscribe',
      channel,
      filters,
    });
  }, [sendMessage]);

  // Unsubscribe from channels
  const unsubscribe = useCallback((channel: string) => {
    sendMessage({
      type: 'unsubscribe',
      channel,
    });
  }, [sendMessage]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  };
} 
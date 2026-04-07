/**
 * useWebSocket.js - Real-time WebSocket connection hook
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = (() => {
  if (process.env.REACT_APP_WS_URL) return process.env.REACT_APP_WS_URL;
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return 'ws://localhost:3001/ws';
})();
const MAX_EVENTS = 500;

export function useWebSocket() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setReconnectCount(0);
        console.log('[WS] Connected to cyber dashboard backend');
      };

      ws.onmessage = (msg) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(msg.data);

          if (data.type === 'EVENT') {
            setEvents(prev => {
              const next = [data.event, ...prev];
              return next.slice(0, MAX_EVENTS);
            });
          } else if (data.type === 'HISTORY') {
            setEvents(data.events.slice(0, MAX_EVENTS).reverse());
          } else if (data.type === 'STATS') {
            setStats(data.stats);
          }
        } catch {}
      };

      ws.onclose = (e) => {
        if (!mountedRef.current) return;
        setConnected(false);
        wsRef.current = null;
        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(1.5, reconnectCount), 15000);
        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) {
            setReconnectCount(c => c + 1);
            connect();
          }
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
    }
  }, [reconnectCount]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { events, stats, connected, reconnectCount };
}
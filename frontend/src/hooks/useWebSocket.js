import { useRef, useEffect, useState, useCallback } from "react";

export default function useWebSocket(sessionId) {
  const wsRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!sessionId) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws/${sessionId}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnectionStatus("connected");
      // Send heartbeat every 15s
      wsRef.current._heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "heartbeat" }));
        }
      }, 15000);
    };

    ws.onmessage = (e) => {
      try { setLastMessage(JSON.parse(e.data)); } catch {}
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      clearInterval(wsRef.current?._heartbeat);
      // Auto-reconnect after 2s
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => { ws.close(); };
    wsRef.current = ws;
  }, [sessionId]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearInterval(wsRef.current?._heartbeat);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((type, payload = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...payload }));
    }
  }, []);

  return { sendMessage, lastMessage, connectionStatus };
}

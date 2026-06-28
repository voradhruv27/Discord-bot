import { useEffect, useState, useRef } from "react";

export default function useSocket(onMessageReceived) {
  const [status, setStatus] = useState("disconnected");
  const ws = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // Keep the callback ref up-to-date
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    let reconnectTimeout;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      setStatus("connecting");
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(`${protocol}//${window.location.host}/socket`);

      socket.onopen = () => {
        if (isUnmounted) {
          socket.close();
          return;
        }
        setStatus("connected");
      };

      socket.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            callbackRef.current?.(data.payload);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        if (isUnmounted) return;
        setStatus("disconnected");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };

      ws.current = socket;
    };

    connect();

    return () => {
      isUnmounted = true;
      if (ws.current) ws.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return status;
}

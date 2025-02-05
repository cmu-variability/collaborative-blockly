// client/components/LiveCursor.tsx
import React, { useEffect, useState } from 'react';

// Create a WebSocket connection for LiveCursor
const ws = new WebSocket('ws://localhost:8080');

interface CursorData {
  id: string;
  x: number;
  y: number;
}

const LiveCursor: React.FC = () => {
  const [cursors, setCursors] = useState<CursorData[]>([]);

  useEffect(() => {
    // Listen for incoming messages for cursor updates
    ws.onmessage = (message: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(message.data);
      } catch (e) {
        console.error('Invalid message received:', message.data);
        return;
      }
      if (data.cursor) {
        setCursors((prev) => {
          // Remove previous entry for the same cursor ID, then add the new one
          const others = prev.filter((cursor) => cursor.id !== data.cursor.id);
          return [...others, data.cursor];
        });
      }
    };

    // Handler for local mouse movement with readyState check
    const handleMouseMove = (e: MouseEvent) => {
      // Check if the WebSocket is open before sending
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ cursor: { id: 'localUser', x: e.clientX, y: e.clientY } }));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          style={{
            position: 'absolute',
            left: cursor.x,
            top: cursor.y,
            background: 'rgba(0, 0, 255, 0.5)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};

export default LiveCursor;

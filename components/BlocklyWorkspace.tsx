// client/components/BlocklyWorkspace.tsx
import React, { useEffect, useRef } from 'react';
import Blockly from 'blockly';
import 'blockly/javascript';

// Replace with your actual WebSocket server URL if deployed.
const ws = new WebSocket('ws://localhost:8080');

// In a real application these would come from your authentication system.
const currentUserId = 'alice';
const currentUserRole = 'Master'; // 'Master' | 'Owner' | 'Member' | 'Viewer'

const BlocklyWorkspace: React.FC = () => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // Helper: send buffered events from localStorage when online.
  const syncPendingEvents = () => {
    const pending = localStorage.getItem('pendingEvents');
    if (pending && ws.readyState === WebSocket.OPEN) {
      const pendingEvents = JSON.parse(pending);
      pendingEvents.forEach((evt: string) => ws.send(evt));
      localStorage.removeItem('pendingEvents');
      console.log('Pending events synced');
    }
  };

  useEffect(() => {
    if (blocklyDiv.current) {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `<xml>
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <!-- Add more blocks as needed -->
        </xml>`,
      });

      // When WebSocket opens, send join message and sync pending events.
      ws.onopen = () => {
        ws.send(JSON.stringify({ join: 'project123', user: currentUserId, token: 'YOUR_TOKEN' }));
        syncPendingEvents();
      };

      // Listen for changes in the Blockly workspace.
      workspaceRef.current.addChangeListener((event) => {
        if (event.isUiEvent) return; // Skip UI-only events.
        const eventJson = event.toJson();
        const payload = JSON.stringify({ event: eventJson, user: currentUserId, role: currentUserRole });
        if (navigator.onLine && ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        } else {
          // Buffer event locally when offline.
          const pending = localStorage.getItem('pendingEvents');
          const pendingEvents = pending ? JSON.parse(pending) : [];
          pendingEvents.push(payload);
          localStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
          console.log('Offline: event buffered');
        }
      });
    }

    // Listen for incoming collaboration events.
    ws.onmessage = (message: MessageEvent) => {
      let data;
      try {
        data = JSON.parse(message.data);
      } catch (e) {
        console.error('Invalid message:', message.data);
        return;
      }
      if (data.event && workspaceRef.current) {
        try {
          const evt = Blockly.Events.fromJson(data.event, workspaceRef.current);
          evt.run(true);
        } catch (err) {
          console.error('Error applying event:', err);
        }
      }
    };

    const handleOnline = () => {
      if (ws.readyState === WebSocket.OPEN) {
        syncPendingEvents();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => {
      ws.close();
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return <div ref={blocklyDiv} style={{ height: '100%', width: '100%' }} />;
};

export default BlocklyWorkspace;

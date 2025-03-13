import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { WebsocketProvider } from 'y-websocket';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection } from "firebase/firestore";
import { db } from './firebase';
// These imports are dynamically loaded at runtime
// We're just declaring the types here for TypeScript
declare const Blockly: any;

// Unique color generator for users
function getRandomColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Generate a random user name
function getRandomName() {
  const names = ['Alex', 'Bailey', 'Casey', 'Dana', 'Elliott', 'Francis', 'Gray', 'Harper', 'Indigo', 'Jordan'];
  const adjectives = ['Quick', 'Smart', 'Bright', 'Clever', 'Bold', 'Brave', 'Kind', 'Happy', 'Cool', 'Calm'];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  return `${randomAdjective}${randomName}`;
}

type CollabSetup = {
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
  awareness: Awareness;
  connected: boolean;
}

// Initialize collaboration for a specific room
export async function initCollaboration(roomId: string): Promise<CollabSetup> {
  // Create a new Yjs document
  const ydoc = new Y.Doc();
  
  // Create an awareness instance for this document
  const awareness = new Awareness(ydoc);
  
  // Set the local user state with a random name and color
  const userName = getRandomName();
  const userColor = getRandomColor();
  awareness.setLocalState({
    name: userName,
    color: userColor,
    cursor: null,
    draggingBlock: null, // Track if user is dragging a block
  });

  let wsProvider: WebsocketProvider | null = null;
  let connected = false;
  
  // Try connecting to WebSocket server
  try {
    console.log(`Connecting to WebSocket server for room: ${roomId}...`);
    
    // Get WebSocket server URL from environment or use fallbacks
    // In production (Vercel), use the deployed WebSocket server
    // In development, use the local server
    let serverUrl = typeof window !== 'undefined' ? 
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://blockly-websocket-server.onrender.com' :
      'ws://localhost:1234';
      
    // For local development, fallback to localhost
    if (process.env.NODE_ENV === 'development') {
      serverUrl = 'ws://localhost:1234';
    }
    
    console.log(`Using WebSocket server: ${serverUrl}`);
    
    try {
      // Create the WebSocket provider and connect
      wsProvider = new WebsocketProvider(
        serverUrl, 
        roomId, 
        ydoc, 
        { awareness }
      );
      
      // Wait for connection status
      await new Promise<void>((resolve) => {
        // Set a timeout in case connection never establishes
        const timeout = setTimeout(() => {
          console.log('Connection timeout, continuing...');
          resolve();
        }, 3000);
        
        // Listen for connection status
        wsProvider?.on('status', ({ status }: { status: string }) => {
          if (status === 'connected') {
            console.log('Connected to WebSocket server');
            connected = true;
            clearTimeout(timeout);
            resolve();
          }
        });
      });
    } catch (err) {
      console.log(`Failed to connect to ${serverUrl}: ${err}`);
      wsProvider = null;
    }
    
    if (wsProvider) {
      // Set up reconnection logic
      wsProvider.on('status', (event: any) => {
        console.log('WebSocket connection status:', event.status);
        if (event.status === 'disconnected') {
          connected = false;
          console.log('Disconnected from WebSocket server');
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            wsProvider?.connect();
          }, 3000);
        } else if (event.status === 'connected') {
          connected = true;
          console.log('Connected to WebSocket server');
        }
      });
    } else {
      console.warn("Could not connect to WebSocket server, working in offline mode");
    }
  } catch (error) {
    console.error("WebSocket connection error:", error);
  }

  // Update Firestore - but don't stop if it fails
  try {
    // Check if the room exists in Firestore, create it if not
    const roomDocRef = doc(db, "rooms", roomId);
    
    // Create user doc for this client
    const userDocRef = doc(collection(db, "rooms", roomId, "users"), ydoc.clientID.toString());
    
    // Variable to store room data for use in cleanup
    let roomData: any = null;
    
    try {
      // Try to get the room document
      const roomSnap = await getDoc(roomDocRef);
      
      if (!roomSnap.exists()) {
        // Create the room document if it doesn't exist
        roomData = { 
          created: new Date().toISOString(),
          initialized: true,
          userCount: 1
        };
        await setDoc(roomDocRef, roomData);
        console.log(`Created new room: ${roomId}`);
      } else {
        // Get room data and update user count
        roomData = roomSnap.data();
        await updateDoc(roomDocRef, {
          userCount: (roomData.userCount || 0) + 1
        });
        console.log(`Joined existing room: ${roomId}`);
      }
      
      // Add this user to the room
      await setDoc(userDocRef, {
        name: userName,
        color: userColor,
        lastActive: new Date().toISOString(),
        online: true
      });
      
    } catch (error) {
      console.error("Error initializing room in Firestore:", error);
    }
    
    // Update Firestore when user state changes (like cursor position)
    awareness.on('change', (changes: any) => {
      // Only sync if the change includes the local client
      if (changes.added.includes(ydoc.clientID) || changes.updated.includes(ydoc.clientID)) {
        const localState = awareness.getLocalState();
        if (localState) {
          try {
            setDoc(userDocRef, {
              name: localState.name,
              color: localState.color,
              lastActive: new Date().toISOString(),
              online: true
            }, { merge: true }).catch(err => {
              console.warn("Non-critical error updating user state:", err);
            });
          } catch (err) {
            console.warn("Failed to update user state in Firestore", err);
          }
        }
      }
    });
    
    // Set up cleanup for when the page unloads
    window.addEventListener('beforeunload', () => {
      try {
        // Mark user as offline
        setDoc(userDocRef, { online: false }, { merge: true });
        
        // Disconnect WebSocket
        wsProvider?.disconnect();
        
        // Update room user count if we have room data
        if (roomData) {
          updateDoc(roomDocRef, {
            userCount: Math.max(0, (roomData.userCount || 1) - 1)
          });
        }
      } catch (error) {
        // Just log - we're unloading anyway
        console.warn("Error during cleanup:", error);
      }
    });
  } catch (error) {
    console.warn("Error setting up Firestore (continuing without it):", error);
  }

  return { 
    ydoc, 
    provider: wsProvider, 
    awareness,
    connected
  };
}

/**
 * This function sets up synchronization between a Blockly workspace and a shared Yjs document
 * to enable real-time collaboration.
 */
export function setupBlocklySync(workspace: any, ydoc: Y.Doc, blocklyApi?: any) {
  try {
    // Get the shared maps from the document
    const sharedBlocks = ydoc.getMap('blocks');
    
    // Get awareness for cursor tracking
    const awareness = (ydoc as any).awareness || new Awareness(ydoc);
    const clientId = ydoc.clientID;
    
    // Reference to blockly - prefer passed reference, fall back to extraction
    let Blockly: any = blocklyApi?.blockly || null;
    // Reference to Blockly XML utilities
    let BlocklyXml: any = blocklyApi?.xml || null;
    
    if (!Blockly) {
      // Extract Blockly reference from workspace as fallback
      if (workspace && workspace.constructor && workspace.constructor.prototype && workspace.constructor.prototype.constructor) {
        Blockly = workspace.constructor.prototype.constructor;
        console.log('Found Blockly reference from workspace');
      } else {
        // Fallback to global Blockly if available
        if (typeof window !== 'undefined' && (window as any).Blockly) {
          Blockly = (window as any).Blockly;
          console.log('Using global Blockly reference');
        } else {
          console.error('Could not find Blockly reference');
        }
      }
    } else {
      console.log('Using provided Blockly API reference');
    }
    
    // Track if we're currently applying changes to avoid loops
    let applyingChanges = false;
    // Track if we're currently dragging a block to avoid interruptions
    let isDragging = false;
    
    // Store blockly event constants
    const EVENTS: Record<string, string> = {
      BLOCK_CHANGE: 'change',
      BLOCK_CREATE: 'create',
      BLOCK_DELETE: 'delete',
      BLOCK_DRAG: 'drag',
      BLOCK_MOVE: 'move',
      VAR_CREATE: 'var_create',
      VAR_DELETE: 'var_delete',
      VAR_RENAME: 'var_rename',
    };
    
    // Find which event constants are available in this Blockly instance
    if (Blockly && Blockly.Events) {
      Object.keys(EVENTS).forEach(key => {
        if (Blockly.Events[key]) {
          EVENTS[key] = Blockly.Events[key];
        }
      });
      console.log('Updated event constants from Blockly.Events');
    } else {
      console.warn('Could not access Blockly.Events, using fallback event names');
    }
    
    // Function to apply shared state to the workspace
    const applySharedState = () => {
      try {
        // Skip if we're already applying changes or dragging
        if (applyingChanges || isDragging) return;
        
        // Get the latest XML state
        const xmlText = sharedBlocks.get('workspace');
        if (!xmlText || typeof xmlText !== 'string') {
          console.warn('No valid workspace XML found in shared state');
          return;
        }
        
        console.log('Applying shared state to workspace');
        
        // Set flags to prevent recursive updates
        applyingChanges = true;
        
        // Remove listeners temporarily
        workspace.removeChangeListener(changeListener);
        
        // Clear workspace and load new state
        workspace.clear();
        
        // Access XML utilities, using explicitly provided ones first
        const xmlUtilities = {
          textToDom: (text: string) => {
            // First try explicit XML utilities
            if (BlocklyXml && typeof BlocklyXml.textToDom === 'function') {
              return BlocklyXml.textToDom(text);
            }
            
            // Then try Blockly.Xml
            if (Blockly && Blockly.Xml && typeof Blockly.Xml.textToDom === 'function') {
              return Blockly.Xml.textToDom(text);
            }
            
            // Finally try global Blockly
            if (typeof window !== 'undefined' && 
                (window as any).Blockly && 
                (window as any).Blockly.Xml && 
                typeof (window as any).Blockly.Xml.textToDom === 'function') {
              return (window as any).Blockly.Xml.textToDom(text);
            }
            
            throw new Error('Could not find textToDom function');
          },
          domToWorkspace: (dom: any, ws: any) => {
            // First try explicit XML utilities
            if (BlocklyXml && typeof BlocklyXml.domToWorkspace === 'function') {
              return BlocklyXml.domToWorkspace(dom, ws);
            }
            
            // Then try Blockly.Xml
            if (Blockly && Blockly.Xml && typeof Blockly.Xml.domToWorkspace === 'function') {
              return Blockly.Xml.domToWorkspace(dom, ws);
            }
            
            // Finally try global Blockly
            if (typeof window !== 'undefined' && 
                (window as any).Blockly && 
                (window as any).Blockly.Xml && 
                typeof (window as any).Blockly.Xml.domToWorkspace === 'function') {
              return (window as any).Blockly.Xml.domToWorkspace(dom, ws);
            }
            
            throw new Error('Could not find domToWorkspace function');
          }
        };
        
        // Convert text to DOM and apply to workspace
        const xmlDom = xmlUtilities.textToDom(xmlText);
        xmlUtilities.domToWorkspace(xmlDom, workspace);
        
        // Re-add listeners
        workspace.addChangeListener(changeListener);
        
        // Reset flag
        applyingChanges = false;
        
        console.log('Successfully applied shared state to workspace');
      } catch (error) {
        console.error('Error applying shared state:', error);
        // Reset flags in case of error
        applyingChanges = false;
        
        // Re-add listeners in case they were removed
        try {
          workspace.addChangeListener(changeListener);
        } catch (e) {
          console.error('Error re-adding change listener:', e);
        }
      }
    };

    // Function to sync workspace to shared document
    const syncToSharedState = () => {
      try {
        if (applyingChanges) return; // Don't sync if we're applying changes
        
        console.log('Syncing workspace to shared state');
        
        // Set the flag to prevent recursive updates
        applyingChanges = true;
        
        // Access XML utilities, using explicitly provided ones first
        const xmlUtilities = {
          workspaceToDom: (ws: any) => {
            // First try explicit XML utilities
            if (BlocklyXml && typeof BlocklyXml.workspaceToDom === 'function') {
              return BlocklyXml.workspaceToDom(ws);
            }
            
            // Then try Blockly.Xml
            if (Blockly && Blockly.Xml && typeof Blockly.Xml.workspaceToDom === 'function') {
              return Blockly.Xml.workspaceToDom(ws);
            }
            
            // Finally try global Blockly
            if (typeof window !== 'undefined' && 
                (window as any).Blockly && 
                (window as any).Blockly.Xml && 
                typeof (window as any).Blockly.Xml.workspaceToDom === 'function') {
              return (window as any).Blockly.Xml.workspaceToDom(ws);
            }
            
            throw new Error('Could not find workspaceToDom function');
          },
          domToText: (dom: any) => {
            // First try explicit XML utilities
            if (BlocklyXml && typeof BlocklyXml.domToText === 'function') {
              return BlocklyXml.domToText(dom);
            }
            
            // Then try Blockly.Xml
            if (Blockly && Blockly.Xml && typeof Blockly.Xml.domToText === 'function') {
              return Blockly.Xml.domToText(dom);
            }
            
            // Finally try global Blockly
            if (typeof window !== 'undefined' && 
                (window as any).Blockly && 
                (window as any).Blockly.Xml && 
                typeof (window as any).Blockly.Xml.domToText === 'function') {
              return (window as any).Blockly.Xml.domToText(dom);
            }
            
            throw new Error('Could not find domToText function');
          }
        };
        
        // Convert workspace to XML DOM
        const dom = xmlUtilities.workspaceToDom(workspace);
        
        // Convert DOM to text
        const text = xmlUtilities.domToText(dom);
        
        // Update the shared state
        console.log('Updating shared workspace state');
        sharedBlocks.set('workspace', text);
        
        // Reset flag
        applyingChanges = false;
      } catch (err) {
        console.error('Error updating shared state:', err);
        // Reset flag in case of error
        applyingChanges = false;
      }
    };
    
    // Set up a listener for changes to the Blockly workspace
    const changeListener = (event: any) => {
      // Skip during apply operations
      if (applyingChanges) return;
      
      // Skip if event has no type property
      if (!event || typeof event.type === 'undefined') return;
      
      // Ensure event.type is treated as a string
      const eventType = String(event.type || '');
      
      // Detect drag operations
      if (eventType === 'drag' || 
          (Blockly && Blockly.Events && Blockly.Events.BLOCK_DRAG && eventType === Blockly.Events.BLOCK_DRAG)) {
        isDragging = event.isStart;
        
        // When drag ends, synchronize the workspace
        if (!event.isStart) {
          console.log('Drag ended, synchronizing workspace');
          // Use timeout to ensure the blocks have settled into position
          setTimeout(() => {
            syncToSharedState();
          }, 50);
        }
        return;
      }
      
      // Skip synchronization during drag operations
      if (isDragging) return;
      
      // These are the event types we care about for synchronization
      const syncEvents = [
        'change', 'create', 'delete', 'move', 
        'var_create', 'var_delete', 'var_rename'
      ];
      
      // Check if this is an event type we should sync
      const shouldSync = syncEvents.includes(eventType) || 
        (Blockly && Blockly.Events && (
          eventType === Blockly.Events.BLOCK_CHANGE ||
          eventType === Blockly.Events.BLOCK_CREATE ||
          eventType === Blockly.Events.BLOCK_DELETE ||
          eventType === Blockly.Events.BLOCK_MOVE ||
          eventType === Blockly.Events.VAR_CREATE ||
          eventType === Blockly.Events.VAR_DELETE ||
          eventType === Blockly.Events.VAR_RENAME
        ));
      
      if (shouldSync) {
        // Use setTimeout to batch rapid changes and reduce network traffic
        setTimeout(() => {
          syncToSharedState();
        }, 10);
      }
    };
    
    // Add the change listener to the workspace
    workspace.addChangeListener(changeListener);
    
    // Listen for changes from other clients
    sharedBlocks.observe(() => {
      // Apply the shared state if we're not already applying changes
      if (!applyingChanges) {
        if (isDragging) {
          console.log('Received change during drag, will apply after drag completes');
          // Schedule an update after drag completes
          const checkDragComplete = () => {
            if (!isDragging) {
              applySharedState();
              return true; // done
            }
            return false; // not done yet
          };
          
          // Check every 100ms if drag is complete
          const intervalId = setInterval(() => {
            if (checkDragComplete()) {
              clearInterval(intervalId);
            }
          }, 100);
          
          // Safety cleanup after 5 seconds
          setTimeout(() => {
            clearInterval(intervalId);
          }, 5000);
        } else {
          // Apply immediately if not dragging
          applySharedState();
        }
      }
    });
    
    // Initial application of shared state if it exists
    if (sharedBlocks.get('workspace')) {
      console.log('Found existing workspace state, applying...');
      // Apply with short delay to ensure workspace is fully initialized
      setTimeout(() => {
        applySharedState();
      }, 500);
    }
    
    // Return cleanup function
    return () => {
      workspace.removeChangeListener(changeListener);
    };
  } catch (err) {
    console.error('Error setting up Blockly sync:', err);
    return () => {};
  }
}

export function setupCursorTracking(awareness: Awareness, element: HTMLElement) {
  // Get our client ID
  const ydoc = awareness.doc;
  const clientId = ydoc.clientID;
  
  // Update cursor position on mouse move
  element.addEventListener('mousemove', (e) => {
    const localState = awareness.getLocalState();
    if (localState) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Make sure we don't overwrite the draggingBlock state
      awareness.setLocalState({
        ...localState,
        cursor: { x, y }
      });
      
      // If user is dragging a block, update its position in the awareness
      if (localState.draggingBlock) {
        const workspace = Blockly.getMainWorkspace();
        if (workspace) {
          const block = workspace.getBlockById(localState.draggingBlock.id);
          if (block) {
            const xy = block.getRelativeToSurfaceXY();
            awareness.setLocalState({
              ...localState,
              cursor: { x, y },
              draggingBlock: {
                ...localState.draggingBlock,
                x: xy.x,
                y: xy.y
              }
            });
          }
        }
      }
    }
  });
  
  // Clear cursor when mouse leaves
  element.addEventListener('mouseleave', () => {
    const localState = awareness.getLocalState();
    if (localState) {
      awareness.setLocalState({
        ...localState,
        cursor: null
      });
    }
  });
  
  // Create and update cursor elements for other users
  const cursors: {[key: number]: HTMLElement} = {};
  
  awareness.on('change', () => {
    const states = awareness.getStates();
    
    // Create or update cursor for each user
    states.forEach((state: any, id: number) => {
      // Skip our own cursor
      if (id === clientId) return;
      
      if (state.cursor) {
        // Create cursor element if it doesn't exist
        if (!cursors[id]) {
          const cursor = document.createElement('div');
          cursor.className = 'remote-cursor';
          cursor.style.position = 'absolute';
          cursor.style.width = '10px';
          cursor.style.height = '10px';
          cursor.style.borderRadius = '50%';
          cursor.style.zIndex = '1000';
          cursor.style.pointerEvents = 'none';
          
          // Create label with user name
          const label = document.createElement('div');
          label.className = 'remote-cursor-label';
          label.style.position = 'absolute';
          label.style.top = '-20px';
          label.style.left = '10px';
          label.style.borderRadius = '3px';
          label.style.padding = '2px 5px';
          label.style.fontSize = '12px';
          label.style.color = 'white';
          label.style.whiteSpace = 'nowrap';
          
          cursor.appendChild(label);
          element.appendChild(cursor);
          cursors[id] = cursor;
        }
        
        // Update cursor position and style
        const cursor = cursors[id];
        cursor.style.left = `${state.cursor.x}px`;
        cursor.style.top = `${state.cursor.y}px`;
        cursor.style.backgroundColor = state.color || '#ff0000';
        
        // Update label
        const label = cursor.querySelector('.remote-cursor-label');
        if (label) {
          (label as HTMLElement).style.backgroundColor = state.color || '#ff0000';
          (label as HTMLElement).textContent = state.name || `User ${id}`;
        }
      } else if (cursors[id]) {
        // Remove cursor when user's cursor is null (left the area)
        cursors[id].remove();
        delete cursors[id];
      }
    });
    
    // Remove cursors for users who are no longer in the room
    Object.keys(cursors).forEach(id => {
      if (!states.has(parseInt(id))) {
        cursors[parseInt(id)].remove();
        delete cursors[parseInt(id)];
      }
    });
  });
  
  // Return cleanup function
  return () => {
    element.removeEventListener('mousemove', () => {});
    element.removeEventListener('mouseleave', () => {});
    Object.values(cursors).forEach(cursor => cursor.remove());
  };
}

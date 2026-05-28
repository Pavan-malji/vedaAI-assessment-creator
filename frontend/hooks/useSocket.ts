'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '../lib/assignmentStore';
import { QuestionPaper } from '../lib/types';

/**
 * Connects to the backend Socket.io server and listens for job events
 * for the given assignmentId. Updates the Zustand assignment store accordingly.
 * 
 * OPTIMIZED: Stable references to prevent infinite reconnection loops
 */
export function useSocket(assignmentId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get stable store references using useRef to prevent dependency changes
  const storeRef = useRef(useAssignmentStore.getState());
  
  useEffect(() => {
    // Update store ref on each render but don't trigger effect
    storeRef.current = useAssignmentStore.getState();
  });

  useEffect(() => {
    if (!assignmentId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      throw new Error('NEXT_PUBLIC_SOCKET_URL must be set to the deployed socket URL.');
    }

    console.log(`[useSocket] Connecting to ${socketUrl} for assignment ${assignmentId}`);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[useSocket] Connected: ${socket.id}`);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[useSocket] Disconnected');
      setIsConnected(false);
    });

    // Job is being processed by the worker
    socket.on('job:progress', (data: { assignmentId: string; status: string; progress: number }) => {
      if (data.assignmentId === assignmentId) {
        console.log(`[useSocket] job:progress for ${assignmentId}:`, data);
        storeRef.current.setJobStatus('processing');
      }
    });

    // Job completed — paper is ready
    socket.on('job:done', (data: { assignmentId: string; paper: QuestionPaper }) => {
      if (data.assignmentId === assignmentId) {
        console.log(`[useSocket] job:done for ${assignmentId}`);
        storeRef.current.setPaper(data.paper);
        storeRef.current.setJobStatus('completed');
      }
    });

    // Job failed
    socket.on('job:failed', (data: { assignmentId: string; error: string }) => {
      if (data.assignmentId === assignmentId) {
        console.log(`[useSocket] job:failed for ${assignmentId}:`, data.error);
        storeRef.current.setError(data.error);
        storeRef.current.setJobStatus('failed');
      }
    });

    return () => {
      console.log('[useSocket] Cleaning up socket connection');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [assignmentId]); // Only depend on assignmentId - stable reference

  return { isConnected };
}

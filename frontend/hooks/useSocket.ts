'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '../lib/assignmentStore';
import { QuestionPaper } from '../lib/types';

/**
 * Connects to the backend Socket.io server and listens for job events
 * for the given assignmentId. Updates the Zustand assignment store accordingly.
 */
export function useSocket(assignmentId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setJobStatus = useAssignmentStore((s) => s.setJobStatus);
  const setPaper = useAssignmentStore((s) => s.setPaper);
  const setError = useAssignmentStore((s) => s.setError);

  useEffect(() => {
    if (!assignmentId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    console.log(`[useSocket] Connecting to ${socketUrl} for assignment ${assignmentId}`);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
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
        setJobStatus('processing');
      }
    });

    // Job completed — paper is ready
    socket.on('job:done', (data: { assignmentId: string; paper: QuestionPaper }) => {
      if (data.assignmentId === assignmentId) {
        console.log(`[useSocket] job:done for ${assignmentId}`);
        setPaper(data.paper);
        setJobStatus('completed');
      }
    });

    // Job failed
    socket.on('job:failed', (data: { assignmentId: string; error: string }) => {
      if (data.assignmentId === assignmentId) {
        console.log(`[useSocket] job:failed for ${assignmentId}:`, data.error);
        setError(data.error);
        setJobStatus('failed');
      }
    });

    return () => {
      console.log('[useSocket] Cleaning up socket connection');
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [assignmentId, setJobStatus, setPaper, setError]);

  return { isConnected };
}

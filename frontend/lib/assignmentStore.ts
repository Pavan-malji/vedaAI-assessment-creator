import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';
import { AssignmentConfig, JobStatus, QuestionPaper } from './types';

interface AssignmentState {
  // State
  assignmentConfig: AssignmentConfig | null;
  assignmentId: string | null;
  jobId: string | null;
  jobStatus: 'idle' | JobStatus;
  paper: QuestionPaper | null;
  // Map of assignmentId -> paper so multiple assignments always show their own questions
  papers: Record<string, QuestionPaper>;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  setAssignmentConfig: (config: AssignmentConfig) => void;
  setAssignmentId: (id: string) => void;
  setJobId: (id: string) => void;
  setJobStatus: (status: 'idle' | JobStatus) => void;
  setPaper: (paper: QuestionPaper) => void;
  getPaper: (id: string) => QuestionPaper | null;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  _setHasHydrated: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  assignmentConfig: null,
  assignmentId: null,
  jobId: null,
  jobStatus: 'idle' as const,
  paper: null,
  papers: {},
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAssignmentConfig: (config) => set({ assignmentConfig: config }),
      setAssignmentId: (id) => set({ assignmentId: id }),
      setJobId: (id) => set({ jobId: id }),
      setJobStatus: (status) => set({ jobStatus: status }),
      setPaper: (paper) => set((state) => ({
        paper,
        papers: state.assignmentId
          ? { ...state.papers, [state.assignmentId]: paper }
          : state.papers,
      })),
      getPaper: (id) => get().papers[id] ?? null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (message) => set({ error: message }),
      _setHasHydrated: (v) => set({ _hasHydrated: v }),
      reset: () => set(initialState),
    }),
    {
      name: 'vedaai-assignment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assignmentId: state.assignmentId,
        jobId: state.jobId,
        jobStatus: state.jobStatus,
        papers: state.papers,
        assignmentConfig: state.assignmentConfig,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);

// Non-blocking hydration hook for assignmentStore
export const useAssignmentStoreHydrated = () => {
  const [ready, setReady] = useState(
    // If already hydrated (e.g. navigating between pages), skip the wait
    () => useAssignmentStore.getState()._hasHydrated
  );

  useEffect(() => {
    if (ready) return;
    // Subscribe to store — fires once when _hasHydrated flips to true
    const unsub = useAssignmentStore.subscribe((s) => {
      if (s._hasHydrated) {
        setReady(true);
        unsub();
      }
    });
    return unsub;
  }, [ready]);

  return ready;
};

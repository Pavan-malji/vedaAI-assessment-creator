import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AssignmentConfig, JobStatus, QuestionPaper } from './types';

interface AssignmentState {
  // State
  assignmentConfig: AssignmentConfig | null;
  assignmentId: string | null;
  jobId: string | null;
  jobStatus: 'idle' | JobStatus;
  paper: QuestionPaper | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAssignmentConfig: (config: AssignmentConfig) => void;
  setAssignmentId: (id: string) => void;
  setJobId: (id: string) => void;
  setJobStatus: (status: 'idle' | JobStatus) => void;
  setPaper: (paper: QuestionPaper) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

const initialState = {
  assignmentConfig: null,
  assignmentId: null,
  jobId: null,
  jobStatus: 'idle' as const,
  paper: null,
  isLoading: false,
  error: null,
};

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set) => ({
      ...initialState,

      setAssignmentConfig: (config) => set({ assignmentConfig: config }),
      setAssignmentId: (id) => set({ assignmentId: id }),
      setJobId: (id) => set({ jobId: id }),
      setJobStatus: (status) => set({ jobStatus: status }),
      setPaper: (paper) => set({ paper }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (message) => set({ error: message }),
      reset: () => set(initialState),
    }),
    {
      name: 'vedaai-assignment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assignmentConfig: state.assignmentConfig,
        assignmentId: state.assignmentId,
        jobId: state.jobId,
        jobStatus: state.jobStatus,
        paper: state.paper,
        error: state.error,
      }),
    }
  )
);

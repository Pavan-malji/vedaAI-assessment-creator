import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Question {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  section: string;
}

export interface AnswerKeyItem {
  id: string;
  answer: string;
}

export interface Assignment {
  id: string;
  title: string;
  assignedDate: string;
  dueDate: string;
  status: 'draft' | 'published';
  subject: string;
  class: string;
  schoolName: string;
  timeAllowed: string;
  maxMarks: number;
  additionalInfo: string;
  fileUploaded: { name: string; size: string } | null;
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  questions: Question[];
  answerKey: AnswerKeyItem[];
}

interface VedaStore {
  assignments: Assignment[];
  searchQuery: string;
  selectedFilter: string;
  wsStatus: 'idle' | 'connecting' | 'processing' | 'completed' | 'failed';
  wsLogs: string[];
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  triggerGeneration: (assignmentId: string, callback?: any) => void;
}

export const useVedaStore = create<VedaStore>()(
  persist(
    (set) => ({
      assignments: [],
      searchQuery: '',
      selectedFilter: 'All',
      wsStatus: 'idle',
      wsLogs: [],
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      addAssignment: (assignment) =>
        set((state) => ({ assignments: [...state.assignments, assignment] })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),
      triggerGeneration: (assignmentId, callback) => {
        // Replaced by real backend polling or socket
      },
    }),
    {
      name: 'vedaai-veda-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assignments: state.assignments,
        searchQuery: state.searchQuery,
        selectedFilter: state.selectedFilter,
      }),
    }
  )
);

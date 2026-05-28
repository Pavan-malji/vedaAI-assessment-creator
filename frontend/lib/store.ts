import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

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
  _hasHydrated: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedFilter: (filter: string) => void;
  _setHasHydrated: (hydrated: boolean) => void;
  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
}

// Create store WITHOUT persist initially for instant hydration
const useVedaStoreBase = create<VedaStore>()(
  persist(
    (set) => ({
      assignments: [],
      searchQuery: '',
      selectedFilter: 'All',
      _hasHydrated: false,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      _setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      addAssignment: (assignment) =>
        set((state) => ({ assignments: [...state.assignments, assignment] })),
      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'vedaai-veda-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assignments: state.assignments,
        searchQuery: state.searchQuery,
        selectedFilter: state.selectedFilter,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);

// Export optimized selectors to prevent unnecessary re-renders
export const useVedaStore = useVedaStoreBase;

// Optimized selector hooks - only re-render when specific data changes
export const useAssignments = () => useVedaStore((state) => state.assignments);
export const useAssignmentsCount = () => useVedaStore((state) => state.assignments.length);
export const useSearchQuery = () => useVedaStore((state) => state.searchQuery);
export const useSelectedFilter = () => useVedaStore((state) => state.selectedFilter);
export const useSetSearchQuery = () => useVedaStore((state) => state.setSearchQuery);
export const useSetSelectedFilter = () => useVedaStore((state) => state.setSelectedFilter);
export const useAddAssignment = () => useVedaStore((state) => state.addAssignment);
export const useDeleteAssignment = () => useVedaStore((state) => state.deleteAssignment);

// Custom hook for hydration that doesn't block rendering
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // Mark as hydrated immediately on client
    setHydrated(true);
  }, []);
  
  return hydrated;
};

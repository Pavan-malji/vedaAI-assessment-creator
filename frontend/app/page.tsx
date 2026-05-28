'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, X, FileText } from 'lucide-react';
import { 
  useAssignments, 
  useSearchQuery, 
  useSelectedFilter, 
  useSetSearchQuery, 
  useSetSelectedFilter,
  useHydration 
} from '../lib/store';
import AssignmentCard from '../components/AssignmentCard';

export default function Dashboard() {
  // Optimized selectors - only re-render when specific data changes
  const assignments = useAssignments();
  const searchQuery = useSearchQuery();
  const setSearchQuery = useSetSearchQuery();
  const selectedFilter = useSelectedFilter();
  const setSelectedFilter = useSetSelectedFilter();
  const hasHydrated = useHydration();

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Memoized subjects list - only recalculate when assignments change
  const subjects = useMemo(() => 
    ['All', ...Array.from(new Set(assignments.map((a) => a.subject)))],
    [assignments]
  );

  // Memoized filtered assignments - only recalculate when dependencies change
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assign) => {
      const matchesSearch = assign.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            assign.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedFilter === 'All' || assign.subject === selectedFilter;
      return matchesSearch && matchesSubject;
    });
  }, [assignments, searchQuery, selectedFilter]);

  // Memoized callbacks to prevent re-renders
  const handleFilterSelect = useCallback((subj: string) => {
    setSelectedFilter(subj);
    setShowFilterDropdown(false);
  }, [setSelectedFilter]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Title & Description Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Green Pulse Indicator Dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Assignments</h1>
          </div>
          <p className="text-xs font-semibold text-gray-500">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Filter Button */}
        <div className="relative">
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E9ECEF]
              text-xs font-bold text-gray-600 hover:text-brand-orange hover:border-brand-orange/40 hover:shadow-sm
              transition-all duration-200 cursor-pointer w-full sm:w-auto
            "
          >
            <Filter className="h-4 w-4" />
            <span>Filter By: {selectedFilter}</span>
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="
              absolute left-0 mt-2 z-10 w-48 rounded-2xl bg-white border border-[#E9ECEF]
              shadow-lg shadow-black/5 py-2 px-1 animate-in fade-in slide-in-from-top-2 duration-150
            ">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5 border-b border-gray-50 mb-1">
                Filter by Subject
              </p>
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleFilterSelect(subj)}
                  className={`
                    w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors
                    ${selectedFilter === subj 
                      ? 'bg-[#FFF3EF] text-brand-orange' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-dark'
                    }
                  `}
                >
                  {subj === 'All' ? 'All Subjects' : subj}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={handleSearchChange}
            className="
              w-full pl-4 pr-10 py-2.5 rounded-full bg-white border border-[#E9ECEF]
              text-sm font-semibold text-brand-dark placeholder-gray-400
              focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/30
              transition-all duration-300 shadow-sm
            "
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          {searchQuery && (
            <button 
              onClick={handleSearchClear}
              className="absolute inset-y-0 right-10 flex items-center pr-1 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Assignments Grid or Empty State */}
      {!hasHydrated ? (
        <div className="flex flex-col items-center justify-center w-full min-h-112.5 p-8 rounded-3xl bg-white border border-[#EAEDF2] text-center shadow-sm">
          <div className="h-12 w-12 rounded-full border-4 border-[#FFF3EF] border-t-brand-orange animate-spin" />
          <h2 className="mt-6 text-xl font-extrabold text-brand-dark tracking-tight">Loading assignments...</h2>
          <p className="mt-2 text-xs font-semibold text-gray-500">Restoring your saved assignments and filters.</p>
        </div>
      ) : filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
          {filteredAssignments.map((assign) => (
            <AssignmentCard key={assign.id} assignment={assign} />
          ))}
        </div>
      ) : (
        /* Empty State Layout */
        <div className="flex flex-col items-center justify-center w-full min-h-112.5 p-8 rounded-3xl bg-white border border-[#EAEDF2] text-center shadow-sm">
          <div className="relative w-44 h-44 mb-6 select-none">
            <div className="absolute inset-10 rounded-4xl bg-linear-to-br from-[#FFF3EF] to-white border border-[#F1E0D8] shadow-sm" />
            <div className="absolute left-7 top-7 h-28 w-28 rounded-[1.6rem] bg-white border border-[#E9ECEF] shadow-lg shadow-black/5 overflow-hidden">
              <div className="h-10 bg-linear-to-r from-brand-orange to-[#FF8C66]" />
              <div className="p-3 space-y-2">
                <div className="h-2 w-16 rounded-full bg-[#D7DCE2]" />
                <div className="h-2 w-20 rounded-full bg-[#EEF1F5]" />
                <div className="h-2 w-12 rounded-full bg-[#D7DCE2]" />
              </div>
            </div>
            <div className="absolute right-7 bottom-6 flex items-center justify-center w-14 h-14 rounded-full bg-brand-dark text-white shadow-xl shadow-black/20">
              <Plus className="h-7 w-7" />
            </div>
            <div className="absolute left-8 bottom-8 h-12 w-24 rounded-2xl bg-[#F7F8FA] border border-[#EEF1F5]" />
          </div>
          
          <div className="max-w-md space-y-3">
            <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">No assignments yet</h2>
            <p className="text-xs font-semibold text-gray-500 leading-relaxed">
              Create your first assignment to start collecting and grading student submissions. 
              You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
          </div>

          <Link href="/assignments/create" className="mt-8">
            <button className="
              flex items-center gap-2 px-6 py-3.5 rounded-full bg-brand-dark text-white text-xs font-bold tracking-wide
              hover:bg-brand-orange hover:shadow-lg hover:shadow-brand-orange-glow active:scale-98 transition-all duration-300 cursor-pointer
            ">
              <Plus className="h-4.5 w-4.5" />
              <span>Create Your First Assignment</span>
            </button>
          </Link>
        </div>
      )}

      {/* Floating Action Button at Bottom Middle (only if assignments exist) */}
      {hasHydrated && assignments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 no-print">
          <Link href="/assignments/create">
            <button className="
              flex items-center gap-2 px-5 py-3.5 rounded-full bg-brand-dark text-white text-xs font-bold tracking-wide
              border border-transparent hover:border-brand-orange/40 shadow-xl shadow-black/25
              hover:shadow-brand-orange-glow active:scale-98 transition-all duration-300 cursor-pointer
            ">
              <Plus className="h-4 w-4" />
              <span>Create Assignment</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

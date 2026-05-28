'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, FileText, Trash2, CheckSquare } from 'lucide-react';
import { Assignment, useDeleteAssignment } from '../lib/store';

interface AssignmentCardProps {
  assignment: Assignment;
}

function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const deleteAssignment = useDeleteAssignment();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAssignment(assignment.id);
    setShowMenu(false);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/assignments/${assignment.id}/preview`);
  };

  return (
    // Entire card is a clickable link — wrapping with Link makes the whole surface navigable
    <Link
      href={`/assignments/${assignment.id}/preview`}
      className="
        relative group flex flex-col justify-between w-full min-h-42.5 p-6 rounded-3xl bg-white
        border border-[#EAEDF2] hover:border-brand-orange/20 shadow-sm hover:shadow-md
        transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5
      "
    >
      {/* Top Row: Title & Action */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3 min-w-0">
          {/* Code-drawn file tile */}
          <div className="shrink-0 w-14 h-14 rounded-2xl border border-[#E9ECEF] bg-linear-to-br from-[#FFF3EF] via-white to-[#F9FAFB] p-2 shadow-inner shadow-black/5">
            <div className="flex h-full w-full flex-col justify-between rounded-xl bg-white/80 p-2">
              <div className="flex items-center justify-between">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" />
                <span className="h-1.5 w-4 rounded-full bg-[#E5E7EB]" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-[#D9DDE4]" />
                <div className="h-1.5 w-8 rounded-full bg-brand-orange/70" />
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="
              text-lg font-extrabold text-brand-dark tracking-tight leading-snug truncate
              underline decoration-brand-dark/15 underline-offset-4 group-hover:decoration-brand-orange/40
              transition-colors duration-200
            ">
              {assignment.title}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-brand-orange" />
              {assignment.subject} • {assignment.class} Class
            </p>
          </div>
        </div>

        {/* Action Button (Three dots) — stops propagation so it doesn't navigate */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.preventDefault();  // prevent Link navigation
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 hover:text-brand-dark transition-colors cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div className="
              absolute right-0 top-9 z-20 w-44 rounded-2xl bg-white border border-[#E9ECEF] 
              shadow-lg shadow-black/5 py-2 px-1 animate-in fade-in slide-in-from-top-2 duration-150
            ">
              <button 
                onClick={handleView}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#FFF3EF] hover:text-brand-orange transition-colors"
              >
                <FileText className="h-4 w-4" />
                View Assignment
              </button>
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Dates */}
      <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-4 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Assigned on :</span>
          <span className="font-bold text-gray-700">{assignment.assignedDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">Due :</span>
          <span className="font-extrabold text-brand-orange bg-[#FFF3EF] px-2 py-0.5 rounded-lg border border-brand-orange/10">{assignment.dueDate}</span>
        </div>
      </div>
    </Link>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(AssignmentCard, (prevProps, nextProps) => {
  // Only re-render if assignment data actually changed
  return prevProps.assignment.id === nextProps.assignment.id &&
         prevProps.assignment.title === nextProps.assignment.title &&
         prevProps.assignment.status === nextProps.assignment.status;
});

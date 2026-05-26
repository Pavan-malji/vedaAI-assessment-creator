'use client';

import { FolderHeart, Info } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border border-[#EAEDF2] rounded-3xl p-8 text-center shadow-sm max-w-md mx-auto mt-12">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 text-brand-orange mb-4 border border-orange-100">
        <FolderHeart className="h-6 w-6" />
      </div>
      
      <h2 className="text-lg font-extrabold text-brand-dark tracking-tight">My Library</h2>
      <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">
        Save, organize, and reuse past question banks, generated worksheets, and syllabus resources.
      </p>

      <div className="mt-6 flex items-center gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] font-semibold text-gray-500 text-left">
        <Info className="h-4 w-4 text-brand-orange flex-shrink-0" />
        <span>This section is part of the premium teacher dashboard upgrade and is currently locked.</span>
      </div>

      <Link href="/assignments" className="mt-6 w-full">
        <button className="w-full py-3 rounded-full bg-brand-dark hover:bg-brand-orange text-white text-xs font-bold transition-all cursor-pointer">
          Go back to Assignments
        </button>
      </Link>
    </div>
  );
}

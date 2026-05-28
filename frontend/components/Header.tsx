'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, ArrowLeft, Grid, LogOut, Settings, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  // Simple path matching for custom breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === '/assignments/create') {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <button 
            onClick={() => router.back()} 
            className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-border bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>
          <span className="text-gray-400 hover:text-brand-orange transition-colors">
            <Link href="/assignments">Assignment</Link>
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-brand-dark font-semibold">Create New</span>
        </div>
      );
    }

    if (pathname.includes('/preview')) {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <button 
            onClick={() => router.push('/assignments')} 
            className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-border bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>
          <span className="text-gray-400 hover:text-brand-orange transition-colors">
            <Link href="/assignments">Assignment</Link>
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-brand-dark font-semibold">Preview Paper</span>
        </div>
      );
    }

    // Default dashboard breadcrumbs
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
        <button 
          onClick={() => {}} 
          className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-border bg-white transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-gray-400" />
        </button>
        <span className="text-brand-dark font-semibold flex items-center gap-1.5">
          <Grid className="h-4 w-4 text-gray-400" />
          <span>Assignment</span>
        </span>
      </div>
    );
  };

  return (
    <header className="no-print w-full flex items-center justify-between py-4 px-6 md:px-8 bg-transparent">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-4">
        {getBreadcrumbs()}
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex items-center justify-center w-10 h-10 rounded-full border border-brand-border bg-white text-gray-600 hover:text-brand-orange hover:shadow-sm transition-all duration-200 cursor-pointer">
          <Bell className="h-4.5 w-4.5" />
          {/* Notification Dot */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-orange rounded-full ring-2 ring-white" />
        </button>

        {/* User Card */}
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-brand-border bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-brand-orange to-[#FF8C66] text-white font-bold flex items-center justify-center text-sm border border-brand-orange/20 overflow-hidden">
              {user ? (user.name.split(' ').map(n => n[0]).slice(0,2).join('')) : 'JD'}
            </div>
            <span className="text-xs font-bold text-gray-800">{user ? user.name : 'John Doe'}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-72 rounded-3xl border border-brand-border bg-white shadow-2xl shadow-black/10 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 bg-linear-to-br from-[#FFF9F6] to-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark text-white font-extrabold shadow-md shadow-black/10">
                    JD
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-brand-dark truncate">{user ? user.name : 'John Doe'}</div>
                    <div className="text-xs font-medium text-gray-500 truncate">{user ? user.email : 'john.doe@vedaai.school'}</div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  <UserCircle2 className="h-4.5 w-4.5 text-gray-400" />
                  <span>Open profile settings</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  <Settings className="h-4.5 w-4.5 text-gray-400" />
                  <span>Account preferences</span>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    setIsProfileMenuOpen(false);
                    await logout();
                    router.push('/login');
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5 text-gray-400" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Memoize Header to prevent re-renders
export default memo(Header);

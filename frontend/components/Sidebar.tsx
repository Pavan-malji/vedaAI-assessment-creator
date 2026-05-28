'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  Wrench, 
  FolderHeart, 
  Settings, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAssignmentsCount } from '../lib/store';
import { useState, memo } from 'react';
import { useAuthStore } from '@/lib/authStore';

function Sidebar() {
  const pathname = usePathname();
  const assignmentsCount = useAssignmentsCount(); // Optimized selector
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'My Groups', icon: Users, path: '/groups' },
    { name: 'Assignments', icon: FileText, path: '/assignments', badge: assignmentsCount },
    { name: 'AI Teacher\'s Toolkit', icon: Wrench, path: '/toolkit' },
    { name: 'My Library', icon: FolderHeart, path: '/library' },
  ];

  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/assignments' || pathname.startsWith('/assignments/');
    }
    return pathname.startsWith(path);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={toggleSidebar} 
        className="no-print lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md text-gray-700 hover:text-brand-orange transition-colors"
      >
        {isOpen ? <X className="h-6 h-6" /> : <Menu className="h-6 h-6" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="no-print lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        no-print
        fixed lg:static top-0 bottom-0 left-0 z-45
        flex flex-col w-[260px] h-screen bg-brand-sidebar-bg border-r border-brand-border px-5 py-6
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5E24] to-[#FF8C66] shadow-sm">
            <span className="text-white font-extrabold text-xl font-mono tracking-tighter">V</span>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-brand-dark">Veda</span>
            <span className="text-xl font-bold tracking-tight text-brand-orange">AI</span>
          </div>
        </div>

        {/* Action Button: Create Assignment */}
        <div className="px-1 mb-6">
          <Link
            href="/assignments/create"
            onClick={() => setIsOpen(false)}
            className="
              group relative flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-full
              bg-brand-dark text-white text-sm font-semibold tracking-wide cursor-pointer
              border border-transparent hover:border-brand-orange
              shadow-lg shadow-black/10 hover:shadow-brand-orange-glow
              transition-all duration-300 active:scale-98
            "
          >
            <Sparkles className="h-4 w-4 text-brand-orange animate-pulse" />
            <span>Create Assignment</span>
            
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-[#FFF3EF] text-brand-orange font-semibold shadow-sm shadow-brand-orange/5' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon className={`h-5 w-5 ${active ? 'text-brand-orange' : 'text-gray-400 group-hover:text-brand-dark'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-bold leading-5
                    ${active ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4 px-1">
          {/* Settings Link */}
          <Link 
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={`
              flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200
              ${pathname === '/settings' 
                ? 'bg-gray-100 text-brand-dark font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
              }
            `}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span>Settings</span>
          </Link>

          {/* Organization / School Profile Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-light-gray">
                    <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center overflow-hidden">
                      <span className="font-extrabold text-brand-orange text-base font-serif">{useAuthStore.getState().user ? useAuthStore.getState().user!.name.split(' ').map(n => n[0]).slice(0,3).join('') : 'DPS'}</span>
                    </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">Delhi Public School</h4>
              <p className="text-[10px] font-medium text-gray-500 truncate mt-0.5">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Memoize Sidebar to prevent re-renders when unrelated state changes
export default memo(Sidebar);

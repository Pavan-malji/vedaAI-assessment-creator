"use client";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchCurrentUser = useAuthStore(state => state.fetchCurrentUser);
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isAuthChecked = useAuthStore(state => state.isAuthChecked);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (isAuthChecked && !isLoading) {
      const onAuthPages = pathname?.startsWith('/(auth)') || pathname?.startsWith('/login') || pathname?.startsWith('/register');
      if (!isAuthenticated && !onAuthPages) {
        router.push('/login');
      }
      if (isAuthenticated && onAuthPages) {
        router.push('/');
      }
    }
  }, [isAuthChecked, isLoading, isAuthenticated, pathname, router]);

  const onAuthPages = pathname?.startsWith('/(auth)') || pathname?.startsWith('/login') || pathname?.startsWith('/register');

  // Performance Optimization: Prevent rendering internal dashboard pages if auth checks are not complete or user is unauthorized.
  // This eliminates the home page redirect flash.
  if (!onAuthPages) {
    if (!isAuthChecked || isLoading || !isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-orange/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-dark/5 blur-[120px] pointer-events-none" />
          
          <div className="flex flex-col items-center space-y-4 z-10">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-brand-orange/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-brand-dark/60 tracking-wide font-sans">Verifying security session...</p>
          </div>
        </div>
      );
    }
  }

  // If visiting an auth page but already logged in, show a loader while redirecting to workspace
  if (onAuthPages && isAuthChecked && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-brand-orange/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-brand-dark/60 tracking-wide">Redirecting to workspace...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

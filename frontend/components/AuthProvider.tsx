"use client";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchCurrentUser = useAuthStore(state => state.fetchCurrentUser);
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!isLoading) {
      // Debounce redirect to avoid brief flashes caused by short-lived auth state transients
      timer = setTimeout(() => {
        const onAuthPages = pathname?.startsWith('/(auth)') || pathname?.startsWith('/login') || pathname?.startsWith('/register');
        if (!isAuthenticated && !onAuthPages) {
          router.push('/login');
        }
        if (isAuthenticated && onAuthPages) {
          router.push('/');
        }
      }, 250);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}

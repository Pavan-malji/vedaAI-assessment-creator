'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const authRoutes = ['/login', '/register'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell h-full min-h-screen bg-background text-foreground font-sans flex overflow-hidden">
      <Sidebar />

      <div className="app-shell-main grow flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="app-shell-content grow overflow-y-auto px-6 md:px-8 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
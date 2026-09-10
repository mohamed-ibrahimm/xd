'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopProgressBar from '@/components/layout/TopProgressBar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

interface AppShellProps {
  children: React.ReactNode;
  initialPlatformName?: string;
  initialPlatformTagline?: string;
  initialSettings?: Record<string, string>;
  initialUser?: any;
}

export default function AppShell({
  children,
  initialPlatformName,
  initialPlatformTagline,
  initialSettings,
  initialUser,
}: AppShellProps) {
  const pathname = usePathname();

  // Focused learning classroom & Live Room Studio: NO marketing header, NO footer, full screen
  const isFocusedRoom = pathname.startsWith('/learn') || (pathname.startsWith('/live/') && pathname !== '/live');

  // Dedicated Dashboards ONLY (Admin, Instructor Studio, Student Workspace)
  // Must NOT match public pages like /instructors or /instructors/join!
  const isDashboard =
    pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/instructor' || pathname.startsWith('/instructor/') ||
    pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (isFocusedRoom || isDashboard) {
    return (
      <div className="w-full min-h-screen flex flex-col antialiased selection:bg-[#D83F8F] selection:text-white dark:selection:bg-[#E94F9F] dark:selection:text-[#080808]">
        <TopProgressBar />
        {children}
        <FloatingWhatsApp settings={initialSettings} />
      </div>
    );
  }

  // Shell with Header at the top for Public pages (Home, Courses, Books, Diplomas, About, Auth, etc.)
  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-[#D83F8F] selection:text-white dark:selection:bg-[#E94F9F] dark:selection:text-[#080808] relative w-full max-w-[100vw] overflow-x-hidden">
      <TopProgressBar />
      <Header
        initialPlatformName={initialPlatformName}
        initialPlatformTagline={initialPlatformTagline}
        initialSettings={initialSettings}
        initialUser={initialUser}
      />
      <main className={`flex-1 w-full ${pathname === '/' ? 'pt-0 pb-0' : 'pt-20 sm:pt-24 md:pt-28 pb-12'}`}>
        <div key={pathname} className="animate-page-enter">
          {children}
        </div>
      </main>
      <Footer initialSettings={initialSettings} />
      <FloatingWhatsApp settings={initialSettings} />
    </div>
  );
}

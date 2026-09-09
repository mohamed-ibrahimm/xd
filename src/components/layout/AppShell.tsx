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

  if (isFocusedRoom) {
    return (
      <div className="w-full min-h-screen flex flex-col antialiased">
        <TopProgressBar />
        {children}
      </div>
    );
  }

  const isStudio = pathname.startsWith('/admin') || pathname.startsWith('/instructor');

  // Shell with Header at the top across all pages (Public, Admin, Instructor, Student)
  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-black relative w-full max-w-[100vw] overflow-x-hidden">
      <TopProgressBar />
      <Header
        initialPlatformName={initialPlatformName}
        initialPlatformTagline={initialPlatformTagline}
        initialUser={initialUser}
      />
      <main className={`flex-1 w-full ${pathname === '/' ? 'pt-0 pb-0' : isStudio ? 'pt-32 sm:pt-36 md:pt-40 pb-12' : 'pt-20 sm:pt-24 md:pt-28 pb-12'}`}>
        <div key={pathname} className="animate-page-enter">
          {children}
        </div>
      </main>
      {!isStudio && <Footer initialSettings={initialSettings} />}
      <FloatingWhatsApp settings={initialSettings} />
    </div>
  );
}

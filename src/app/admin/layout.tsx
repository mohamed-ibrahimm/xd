import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminSidebarClient from '@/components/admin/AdminSidebarClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin&error=unauthorized_admin');
  }

  let platformName = 'أكاديمية قِمَم';
  try {
    const platformNameSetting = await prisma.platformSetting.findUnique({
      where: { key: 'PLATFORM_NAME' }
    });
    if (platformNameSetting?.value) platformName = platformNameSetting.value;
  } catch (e) {
    console.error('Failed to fetch platform name in admin layout:', e);
  }

  const adminName = user.officialFullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'المدير';

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row bg-[#FAF8FA] dark:bg-[#08060e] text-slate-900 dark:text-white">
      {/* Dynamic Ambient Mesh in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[5%] right-[15%] w-[550px] h-[550px] bg-blue-400/10 dark:bg-amber-500/5 rounded-full blur-[130px]" />
        <div className="dynamic-drift-2 absolute bottom-[10%] right-[40%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Pinned Classical SaaS Sidebar */}
      <AdminSidebarClient
        platformName={platformName}
        adminName={adminName}
        adminEmail={user.email}
        avatarUrl={user.avatarUrl}
      />

      {/* Main Admin View Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1500px] w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
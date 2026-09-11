import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StudentSidebarClient from '@/components/student/StudentSidebarClient';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  let enrolledCount = 0;
  let certificatesCount = 0;

  try {
    const [enrollments, certs] = await Promise.all([
      prisma.enrollment.count({
        where: { userId: user.id, status: 'ACTIVE' },
      }),
      prisma.certificate.count({
        where: { userId: user.id, isValid: true },
      }),
    ]);
    enrolledCount = enrollments;
    certificatesCount = certs;
  } catch (e) {
    console.error('Failed to fetch student counts in dashboard layout:', e);
  }

  const studentName =
    user.officialFullName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    'طالب قمم';

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row bg-[#FAF8FA] dark:bg-[#06040d] text-slate-900 dark:text-white">
      {/* Dynamic Ambient Mesh in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[5%] right-[15%] w-[550px] h-[550px] bg-pink-500/10 dark:bg-[#D83F8F]/5 rounded-full blur-[130px]" />
        <div className="dynamic-drift-2 absolute bottom-[10%] right-[40%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Pinned Classical SaaS Student Sidebar */}
      <StudentSidebarClient
        studentName={studentName}
        studentEmail={user.email}
        avatarUrl={user.avatarUrl}
        enrolledCount={enrolledCount}
        certificatesCount={certificatesCount}
      />

      {/* Main Student View Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1500px] w-full min-w-0">
        {children}
      </main>
    </div>
  );
}

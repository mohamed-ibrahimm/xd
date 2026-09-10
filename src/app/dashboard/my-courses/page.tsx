import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?callbackUrl=/dashboard/my-courses');
  }

  // Fetch only ACTIVE enrollments for the student
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE',
      courseId: { not: null },
    },
    include: {
      course: {
        include: {
          instructor: {
            select: { officialFullName: true, firstName: true, lastName: true }
          },
          sections: {
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  durationMinutes: true,
                }
              }
            }
          },
          certificates: {
            where: { userId: user.id, isValid: true },
            take: 1,
          }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' },
  });

  // For each enrollment, fetch the student's progress and last watched lesson
  const coursesWithDetails = await Promise.all(
    enrollments.map(async (enr) => {
      const course = enr.course!;
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const totalLessonsCount = allLessons.length;

      // Find completed lessons count for this user
      const completedProgresses = await prisma.lessonProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: allLessons.map((l) => l.id) },
          isCompleted: true,
        },
        select: { lessonId: true },
      });
      const completedCount = completedProgresses.length;

      // Find last watched lesson
      const lastProgress = await prisma.lessonProgress.findFirst({
        where: {
          userId: user.id,
          lessonId: { in: allLessons.map((l) => l.id) },
        },
        orderBy: { lastWatchedAt: 'desc' },
        include: { lesson: true },
      });

      const lastLesson = lastProgress?.lesson || allLessons[0] || null;
      const certificate = course.certificates[0] || null;

      // Calculate accurate progress
      const progressPercent = totalLessonsCount > 0
        ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100))
        : Math.round(enr.progressPercent);

      const isCompleted = enr.isCompleted || progressPercent >= 100;

      return {
        enrId: enr.id,
        course,
        totalLessonsCount,
        completedCount,
        progressPercent,
        isCompleted,
        lastLesson,
        certificate,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Breadcrumb & Exit Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/" className="text-slate-500 hover:text-[#D83F8F] dark:text-zinc-400 dark:hover:text-amber-300 transition-colors font-medium">
            الرئيسية
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <Link href="/dashboard" className="text-slate-500 hover:text-[#D83F8F] dark:text-zinc-400 dark:hover:text-amber-300 transition-colors font-medium">
            لوحة المتابعة
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-[#D83F8F] dark:text-amber-300 font-bold">الكورسات المشترك فيها</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:hover:text-white text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-colors"
          >
            ← العودة للرئيسية
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-purple-950/50 dark:via-zinc-900/90 dark:to-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-amber-950/80 border border-pink-200 dark:border-amber-800/60 text-[#D83F8F] dark:text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابة الطالب الأكاديمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">الكورسات المشترك فيها</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            جميع الدورات التدريبية المعتمدة المسجل بها حسابك مع نسب الإنجاز والمتابعة الفورية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 transition-colors"
          >
            لوحة المتابعة العامة
          </Link>
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl bg-[#D83F8F] hover:bg-[#c2337d] text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-xs font-bold dark:text-zinc-950 transition-all shadow-lg shadow-pink-500/20 dark:shadow-amber-950/30"
          >
            استكشف كورسات إضافية
          </Link>
        </div>
      </div>

      {/* Courses List */}
      {coursesWithDetails.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 p-8 space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">لم تشترك في أي دورات بعد</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
            تصفح دليل الكورسات المتاحة وابدأ مسارك الهندسي مع نخبة من أفضل المهندسين المعتمدين.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D83F8F] hover:bg-[#c2337d] text-white text-xs font-bold transition-all shadow-lg shadow-pink-500/20"
          >
            <span>تصفح دليل الكورسات الآن</span>
            <span>←</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithDetails.map((item) => {
            const { course, totalLessonsCount, completedCount, progressPercent, isCompleted, lastLesson, certificate } = item;
            const learnUrl = lastLesson
              ? `/learn/${course.slug}/${lastLesson.slug}`
              : `/learn/${course.slug}`;

            return (
              <div
                key={item.enrId}
                className="rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800/90 hover:border-[#D83F8F] dark:hover:border-amber-500/40 p-5 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                {/* Thumbnail & Badges */}
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/60">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Completion Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مكتمل 100%</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-black/60 dark:bg-zinc-900/90 border border-white/20 dark:border-zinc-700 text-white dark:text-zinc-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>قيد التقدم</span>
                        </span>
                      )}
                    </div>

                    {/* Instructor tag */}
                    <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-[11px] text-zinc-100">
                      <span className="truncate">
                        المحاضر: {course.instructor.officialFullName || `${course.instructor.firstName} ${course.instructor.lastName}`}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[44px]">
                    {course.title}
                  </h3>

                  {/* Last Watched Lesson */}
                  {lastLesson && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 block">آخر درس تمت مشاهدته:</span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5 text-[#D83F8F] dark:text-amber-400 shrink-0" />
                        <span className="truncate">{lastLesson.title}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress & Actions Section */}
                <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-zinc-800/80">
                  {/* Progress Numbers */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-zinc-400">
                        الدروس المكتملة: <strong className="text-slate-900 dark:text-white font-mono">{completedCount}</strong> من {totalLessonsCount}
                      </span>
                      <span className="font-mono font-bold text-[#D83F8F] dark:text-amber-400">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D83F8F] to-pink-400 dark:from-amber-500 dark:to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, progressPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Certificate Status */}
                  <div className="text-xs">
                    {certificate ? (
                      <Link
                        href={`/verify?code=${certificate.certificateNumber}`}
                        className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 flex items-center justify-between transition-colors font-bold text-[11px]"
                      >
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>الشهادة المعتمدة متاحة </span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      </Link>
                    ) : isCompleted ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>مؤهل لاستخراج الشهادة (تواصل مع الدعم)</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-500 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                        <span>الشهادة ستتاح فور إتمام 100% من الدروس</span>
                      </div>
                    )}
                  </div>

                  {/* Continue Learning CTA Button */}
                  <Link
                    href={learnUrl}
                    className="w-full py-3 px-4 rounded-xl bg-[#D83F8F] hover:bg-[#c2337d] text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 dark:shadow-amber-950/20 transition-all hover:scale-[1.02]"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{progressPercent > 0 ? 'متابعة التعلم' : 'ابدأ دراسة الكورس الآن'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

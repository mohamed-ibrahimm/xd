import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice, formatDuration } from '@/lib/utils';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  PlayCircle,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Star,
  MessageCircle,
  Zap,
  Flame,
  UserCheck,
  Check,
} from 'lucide-react';
import ItemReviewsSection from '@/components/reviews/ItemReviewsSection';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  let decodedSlug = params.slug;
  try {
    decodedSlug = decodeURIComponent(params.slug);
  } catch (e) {}

  let course: any = null;
  try {
    course = await prisma.course.findFirst({
      where: {
        OR: [
          { slug: params.slug },
          { slug: decodedSlug },
        ]
      },
      include: {
        instructor: {
          select: { id: true, officialFullName: true, bio: true, avatarUrl: true }
        },
        category: true,
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              include: {
                summary: true,
                quiz: { select: { id: true, title: true } }
              }
            }
          }
        },
        finalExam: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { officialFullName: true } } }
        }
      }
    });
  } catch (e) {
    console.error('Failed to fetch course detail:', e);
  }

  if (!course) {
    notFound();
  }

  // Check if current user is enrolled or course owner
  let isEnrolled = false;
  const isOwner = Boolean(user && (user.role === 'ADMIN' || user.id === course.instructorId));
  if (isOwner) {
    isEnrolled = true;
  } else if (user) {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
          status: 'ACTIVE'
        }
      });
      if (enrollment) isEnrolled = true;
    } catch (e) {}
  }

  // Fetch WhatsApp number for direct contact
  let whatsappNum = '01555791568';
  try {
    const wsSettings = await prisma.platformSetting.findMany({
      where: { key: { in: ['WHATSAPP_NUMBER', 'CONTACT_WHATSAPP', 'CONTACT_PHONE'] } }
    });
    const wsMap = Object.fromEntries(wsSettings.map((s) => [s.key, s.value]));
    const rawVal = wsMap['WHATSAPP_NUMBER'] || wsMap['CONTACT_WHATSAPP'] || wsMap['CONTACT_PHONE'] || '';
    if (rawVal && !rawVal.includes('1001234567')) {
      whatsappNum = rawVal.replace(/[^0-9]/g, '');
    }
  } catch (e) {}

  let formattedWhatsapp = whatsappNum;
  if (formattedWhatsapp.startsWith('002')) {
    formattedWhatsapp = formattedWhatsapp.slice(2);
  } else if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '2' + formattedWhatsapp;
  } else if (formattedWhatsapp.length === 10 && formattedWhatsapp.startsWith('1')) {
    formattedWhatsapp = '20' + formattedWhatsapp;
  }
  const whatsappCourseUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(`السلام عليكم، أود الاستفسار والتسجيل في دورة: ${course.title}`)}`;

  const firstLessonSlug = course.sections[0]?.lessons[0]?.slug;
  const requirements: string[] = course.requirements ? JSON.parse(course.requirements) : [];
  const learningObjectives: string[] = course.learningObjectives ? JSON.parse(course.learningObjectives) : [];
  const totalLessons = course.sections.reduce((acc: number, s: any) => acc + s.lessons.length, 0);

  const defaultObjectives = [
    'إتقان المبادئ الأساسية والتقنيات الهندسية المتقدمة وفق أحدث معايير العمل',
    'بناء مشاريع برمجية متكاملة وإضافتها إلى معرض أعمالك المهني (Portfolio)',
    'تطبيق أفضل ممارسات كتابة الأكواد النظيفة وحل المشكلات الواقعية',
    'الحصول على شهادة تخرج رقمية معتمدة برمز QR موثقة لدعم سيرتك الذاتية',
  ];
  const displayObjectives = learningObjectives.length > 0 ? learningObjectives : defaultObjectives;

  const reviewsCount = course.reviews.length;
  const avgRating = reviewsCount > 0
    ? (course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1)
    : '5.0';

  // Dynamic pricing with high-impact savings
  const originalPrice = course.compareAtPrice || Math.round((course.price * 1.55) / 50) * 50;
  const discountAmount = Math.max(0, originalPrice - course.price);
  const discountPercent = originalPrice > course.price ? Math.round(((originalPrice - course.price) / originalPrice) * 100) : 35;

  const cleanThumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800';

  return (
    <div className="pb-24 pt-6 sm:pt-8 min-h-screen relative overflow-hidden">
      
      {/* Background Multi-Colored Aurora Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-500/10 dark:bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-10 w-[550px] h-[450px] bg-emerald-500/8 dark:bg-yellow-500/8 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* =========================================================================
            1. TOP HERO SHOWCASE: Title + Compact Preview Media Side-by-Side!
               (صورة المعاينة المصغرة بجوار اسم الدورة في هيدر موحد وفخم)
           ========================================================================= */}
        <div className="rounded-3xl bg-white/95 dark:bg-zinc-900/85 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800/90 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Luminous Top Gold/Blue Accent Line */}
          <div className="h-1.5 absolute top-0 inset-x-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500" />
          
          {/* Ambient glowing background aura */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Centered Title, Dynamic Badges, Description & Dynamic Meta Pills */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 text-center flex flex-col items-center justify-center">
              
              {/* Badges & Breadcrumbs (Centered) */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <Link href="/courses" className="text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-amber-400 transition-colors font-semibold">
                  الكورسات
                </Link>
                <span className="text-slate-400 dark:text-zinc-600">/</span>
                {course.category && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-amber-500/10 dark:text-amber-300 border border-blue-200 dark:border-amber-500/25 font-bold">
                    {course.category.name}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold">
                  {course.level === 'BEGINNER' ? 'مبتدئ' : course.level === 'INTERMEDIATE' ? 'متوسط' : 'متقدم'}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{avgRating}</span>
                  <span className="text-slate-400 dark:text-zinc-400 font-normal">({reviewsCount > 0 ? `${reviewsCount} تقييم` : 'جديد'})</span>
                </div>
              </div>

              {/* Course Title (CENTERED with Molten Gold / Blue Glow) */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight text-center">
                {course.title}
              </h1>

              {/* Course Description (Clean & Centered) */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl text-center mx-auto">
                {course.description && course.description.length > 5 && !course.description.includes('سسس')
                  ? course.description
                  : 'مسار تطبيقي مكثف يركز على إتقان أحدث المعايير الهندسية والبرمجية وبناء مشاريع واقعية تؤهلك لسوق العمل بثقة واحتراف.'}
              </p>

              {/* DYNAMIC LUXURY METADATA PILLS (Centered with Dynamic Animated Neon Icons) */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                
                {/* 1. Instructor Pill with Glowing Ring */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 text-xs shadow-xs hover:scale-105 transition-transform">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 p-[1.5px] shadow-sm">
                    <div className="w-full h-full bg-slate-900 dark:bg-zinc-950 rounded-full flex items-center justify-center font-black text-white text-[10px]">
                      {course.instructor?.officialFullName?.[0] || 'م'}
                    </div>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {course.instructor?.officialFullName || 'م / محمد إبراهيم'}
                  </span>
                  <UserCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                </div>

                {/* 2. Dynamic Pulsing Duration Pill */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-xs text-amber-700 dark:text-amber-300 font-bold shadow-xs hover:scale-105 transition-transform">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  </div>
                  <span>{formatDuration(course.durationHours)}</span>
                </div>

                {/* 3. Dynamic Modules & Lessons Pill */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-xs text-blue-700 dark:text-blue-300 font-bold shadow-xs hover:scale-105 transition-transform">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span>{course.sections.length} وحدات • {totalLessons} درس</span>
                </div>

                {/* 4. Dynamic Certificate Pill with Golden Ribbon */}
                {course.certificateEnabled && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-xs text-[#D83F8F] dark:text-[#E94F9F] font-bold shadow-xs hover:scale-105 transition-transform">
                    <div className="w-5 h-5 rounded-full bg-[#E94F9F]/20 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                    </div>
                    <span>شهادة إتمام معتمدة بـ QR</span>
                  </div>
                )}

              </div>

            </div>

            {/* Left: Compact Interactive Preview Media (بجوار اسم الدورة) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-200/80 dark:border-zinc-800 shadow-xl group">
                <img
                  src={cleanThumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Top Floating Badges */}
                <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-black/75 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>معاينة مجانية</span>
                  </span>

                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-500/90 backdrop-blur-md text-white border border-rose-400/40 flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 animate-bounce" />
                    <span>خصم {discountPercent}%</span>
                  </span>
                </div>

                {/* Centered Glowing Play Button */}
                <Link
                  href={firstLessonSlug ? `/learn/${course.slug}/${firstLessonSlug}` : '#curriculum'}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                  title="تشغيل فيديو المعاينة"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-115 transition-transform duration-300 ring-4 ring-white/20">
                    <PlayCircle className="w-9 h-9 fill-zinc-950 text-amber-400 mr-0.5" />
                  </div>
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            2. MAIN DETAILS & ELEVATED PURCHASE SECTION (Zero Empty Voids)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* =========================================================================
              RIGHT COLUMN: Curriculum, What You'll Learn, Instructor & Reviews (col-span-7)
             ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">

            {/* What You'll Learn (ماذا ستتعلم في هذا الكورس) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800/80 shadow-md space-y-4">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-amber-400" />
                <span>ماذا ستتعلم في هذا الكورس؟</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {displayObjectives.map((obj: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum & Lessons Accordion (المنهج وخطة الدروس) */}
            <div id="curriculum" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-amber-400" />
                  <span>المنهج وخطة الدروس</span>
                </h2>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold bg-slate-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                  {course.sections.length} وحدات • {totalLessons} درس تعليمي
                </span>
              </div>

              <div className="space-y-3.5">
                {course.sections.map((section: any, sIndex: number) => (
                  <div key={section.id} className="rounded-2xl bg-white/95 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs overflow-hidden">
                    
                    {/* Section Header */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-black flex items-center justify-center border border-blue-200 dark:border-amber-500/30">
                          {sIndex + 1}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{section.title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">{section.lessons.length} دروس</span>
                    </div>

                    {/* Lessons List */}
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {section.lessons.map((lesson: any) => (
                        <div
                          key={lesson.id}
                          className="p-3.5 px-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {lesson.isFreePreview || isEnrolled ? (
                              <PlayCircle className="w-4 h-4 text-blue-600 dark:text-amber-400 shrink-0" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-600 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.15)] dark:text-[#E94F9F] text-[10px] font-bold border border-pink-200 dark:border-[rgba(233,79,159,0.25)]">
                                معاينة مجانية
                              </span>
                            )}
                            {lesson.quiz && (
                              <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.15)] dark:text-[#E94F9F] text-[10px] font-bold border border-pink-200 dark:border-[rgba(233,79,159,0.25)]">
                                اختبار
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 dark:text-zinc-400 text-[11px]">{lesson.durationMinutes} دقيقة</span>
                            {(lesson.isFreePreview || isEnrolled) && (
                              <Link
                                href={`/learn/${course.slug}/${lesson.slug}`}
                                className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-amber-500/15 dark:hover:bg-amber-500 dark:text-amber-300 dark:hover:text-zinc-950 font-bold transition-all text-xs"
                              >
                                مشاهدة
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Requirements (المتطلبات المسبقة) */}
            {requirements.length > 0 && (
              <div className="p-6 rounded-2xl bg-white/95 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">المتطلبات المسبقة</h2>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-300">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:amber-400" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Bio (عن المحاضر) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-zinc-900/70 border border-slate-200/90 dark:border-zinc-800/80 shadow-md space-y-4">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">عن المحاضر</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-amber-500 dark:to-yellow-400 p-[2px] shrink-0 shadow-md">
                  <div className="w-full h-full bg-slate-900 dark:bg-zinc-950 rounded-[14px] flex items-center justify-center font-black text-white text-xl">
                    {course.instructor?.officialFullName?.[0] || 'م'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {course.instructor?.officialFullName || 'م / محمد إبراهيم'}
                    </h3>
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-amber-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {course.instructor?.bio || 'مهندس برمجيات أول ومحاضر معتمد بخبرة عملية في بناء الأنظمة والحلول الرقمية المتطورة.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Student Reviews & Comments (تقييمات وتعليقات الطلاب التفاعلية) */}
            <ItemReviewsSection
              courseId={course.id}
              itemTitle={`دورة: ${course.title}`}
              initialReviews={course.reviews}
              currentUser={user ? {
                id: user.id,
                officialFullName: user.officialFullName,
                firstName: user.firstName,
                avatarUrl: user.avatarUrl,
              } : null}
            />

          </div>

          {/* =========================================================================
              LEFT COLUMN: ELEVATED STICKY PURCHASE CARD (السعر مرفوع للأعلى فوراً!)
             ========================================================================= */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            
            {/* The Main High-End Checkout Card */}
            <div className="rounded-3xl bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800/90 shadow-2xl overflow-hidden relative">
              
              {/* Luminous Top Gold/Blue Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500" />

              {/* Dynamic Moving Ambient Glow Flares */}
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-500/20 dark:bg-amber-500/15 blur-3xl pointer-events-none -z-10" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-blue-500/15 dark:bg-purple-600/15 blur-3xl pointer-events-none -z-10" />

              <div className="p-4 sm:p-6 space-y-5">
                
                {/* 1. Limited-Time Offer Alert Ticker (مرفوع للأعلى فوراً) */}
                <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2 text-center text-xs font-black shadow-xs">
                  <Zap className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                  <span>عرض استثنائي: وفر {discountPercent}% فوراً عند التسجيل اليوم!</span>
                </div>

                {/* 2. Dazzling Centered Price Box (السعر في المنتصف كقطعة مجوهرات) */}
                <div className="text-center p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-xs sm:text-sm text-slate-400 dark:text-zinc-500 line-through font-bold">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black border border-emerald-500/25">
                      وفر {discountPercent}% ({formatPrice(discountAmount)})
                    </span>
                  </div>

                  {/* Huge Bold Centered Price */}
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl sm:text-5xl lg:text-5xl font-black text-blue-600 dark:text-amber-400 tracking-tight drop-shadow-sm">
                      {formatPrice(course.price)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    دفعة واحدة لمرة واحدة • وصول فوري ودائم مدى الحياة
                  </p>
                </div>

                {/* 3. Primary Action Buttons */}
                {isEnrolled ? (
                  <Link
                    href={firstLessonSlug ? `/learn/${course.slug}/${firstLessonSlug}` : '#curriculum'}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>{isOwner ? 'أنت محاضر الدورة • دخول قاعة الدرس' : 'أنت مشترك بالفعل • استكمال التعلم'}</span>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    {/* Main Checkout Button */}
                    <Link
                      href={`/checkout?courseId=${course.id}`}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 dark:from-amber-500 dark:via-yellow-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-yellow-400 text-white dark:text-zinc-950 font-black text-sm sm:text-base shadow-xl shadow-blue-500/25 dark:shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-98"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>شراء الكورس والاشتراك الفوري</span>
                    </Link>

                    {/* Prominent Solid WhatsApp Instant Enrollment Button */}
                    <a
                      href={whatsappCourseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-98 hover:scale-[1.01]"
                    >
                      <MessageCircle className="w-5 h-5 stroke-[2.5]" />
                      <span>طلب الكورس والتفعيل الفوري عبر واتساب</span>
                    </a>

                    <div className="pt-1 text-center space-y-2">
                      <p className="text-center text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        دفع مباشر ومشفر وتفعيل فوري عبر الوسائل المعتمدة:
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-700 dark:text-[#FF5CAD] border border-pink-500/25 text-[11px] font-black shadow-xs">
                          إنستاباي InstaPay
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/25 text-[11px] font-black shadow-xs">
                          فودافون كاش
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/25 text-[11px] font-black shadow-xs">
                          أورنج كاش
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 text-[11px] font-black shadow-xs">
                          Visa & Mastercard
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25 text-[11px] font-black shadow-xs">
                          كارت ميزة
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 text-[11px] font-black shadow-xs">
                          فوري Pay
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Centered Luxury Perks Capsules (المزايا بشكل كبسولات فخمة متناسقة) */}
                <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-4 space-y-3">
                  
                  <div className="text-center pb-1">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>يشمل هذا الاشتراك الكامل كافة المزايا:</span>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { icon: Clock, title: 'وصول دائم مدى الحياة', desc: 'لكافة المحاضرات والتحديثات دون أي انتهاء صلاحية', color: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
                      { icon: Award, title: 'شهادة تخرج معتمدة بـ QR', desc: 'موثقة رسمياً لدعم سيرتك الذاتية في التوظيف', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' },
                      { icon: Layers, title: 'مشاريع وتطبيقات واقعية', desc: 'أكواد عملية حقيقية تؤهلك لسوق العمل بثقة', color: 'text-blue-500 bg-blue-500/10 border-blue-500/25' },
                      { icon: Zap, title: 'مساعد ذكاء اصطناعي فوري', desc: 'متاح معك 24/7 للشرح والمساعدة داخل كل درس', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' },
                      { icon: ShieldCheck, title: 'دعم فني وتحديثات مستمرة', desc: 'متابعة هندسية مستمرة وإجابة على كافة استفساراتك', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/25' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/90 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 hover:border-amber-500/30 transition-all text-right group shadow-xs"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color} shadow-xs group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-4.5 h-4.5 stroke-[2.2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>

                </div>

                {/* 5. Centered Trust Guarantee Banner */}
                <div className="pt-2">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/25 flex items-center justify-center gap-2 text-center shadow-xs">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      دفع مشفر وآمن 100% • ضمان جودة المحتوى الأكاديمي والشهادة
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      {!isEnrolled && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 p-3.5 flex items-center justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                وفر {discountPercent}%
              </span>
            </div>
            <span className="text-lg font-black text-blue-600 dark:text-amber-400">{formatPrice(course.price)}</span>
          </div>
          <Link
            href={`/checkout?courseId=${course.id}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-amber-500 dark:to-yellow-500 text-white dark:text-zinc-950 font-black text-xs shadow-xl shadow-blue-500/25 dark:shadow-amber-500/25 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>اشترك الآن والدفع الفوري</span>
          </Link>
        </div>
      )}
    </div>
  );
}
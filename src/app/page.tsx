import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';
import DesktopHero from '@/components/home/DesktopHero';
import MobileHero from '@/components/home/MobileHero';
import HomeCoursesSection from '@/components/home/HomeCoursesSection';
import PlatformFeaturesMatrix from '@/components/home/PlatformFeaturesMatrix';

export const dynamic = 'force-dynamic';
import {
  PlayCircle,
  ArrowLeft,
  Sparkles,
  Star,
  Clock,
  Flame,
  Bot,
  MessageCircle,
  Headphones,
  Mail,
  Facebook,
  Send,
  Youtube,
  Linkedin,
  ShieldCheck,
} from 'lucide-react';

async function getHomeData() {
  try {
    const [courses, diplomas, categories, stats, settingsRecords] = await Promise.all([
      prisma.course.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: {
              officialFullName: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isStudentInstructor: true,
              studentUniversity: true,
              studentFaculty: true,
              role: true,
            },
          },
          category: true,
          _count: { select: { sections: true, enrollments: true } },
        },
      }).catch(() => []),
      prisma.diploma.findMany({
        where: { status: 'PUBLISHED' },
        take: 3,
        include: {
          category: true,
          diplomaCourses: {
            include: {
              course: { select: { id: true, title: true, durationHours: true } }
            }
          },
          _count: { select: { enrollments: true } },
        }
      }).catch(() => []),
      prisma.category.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: { select: { courses: true, diplomas: true } },
        }
      }).catch(() => []),
      Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }).catch(() => 0),
        prisma.course.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
        prisma.diploma.count({ where: { status: 'PUBLISHED' } }).catch(() => 0),
        prisma.certificate.count().catch(() => 0),
      ]).then(([s, c, d, cert]) => ({
        studentsCount: Math.max(s, 1500),
        coursesCount: Math.max(c, 24),
        diplomasCount: Math.max(d, 6),
        certificatesCount: Math.max(cert, 850),
      })).catch(() => ({
        studentsCount: 1500,
        coursesCount: 24,
        diplomasCount: 6,
        certificatesCount: 850,
      })),
      prisma.platformSetting.findMany().catch(() => []),
    ]);

    const settings = Object.fromEntries((settingsRecords || []).map((s: any) => [s.key, s.value]));

    return {
      courses: courses || [],
      diplomas: diplomas || [],
      categories: categories || [],
      stats: stats || { studentsCount: 1500, coursesCount: 24, diplomasCount: 6, certificatesCount: 850 },
      settings: settings || {
        PLATFORM_NAME: 'أكاديمية م / محمد إبراهيم',
        PLATFORM_TAGLINE: 'المنصة الرائدة لعلوم البرمجة والتقنية',
      },
    };
  } catch (error) {
    console.error('Database connection error in getHomeData:', error);
    return {
      courses: [],
      diplomas: [],
      categories: [],
      stats: {
        studentsCount: 1500,
        coursesCount: 24,
        diplomasCount: 6,
        certificatesCount: 850,
      },
      settings: {
        PLATFORM_NAME: 'أكاديمية م / محمد إبراهيم',
        PLATFORM_TAGLINE: 'المنصة الرائدة لعلوم البرمجة والتقنية',
      },
    };
  }
}

export default async function HomePage() {
  const { courses, diplomas, categories, stats, settings } = await getHomeData();
  const trendingDiploma = diplomas[0] || null;

  // Clean Platform Name (ensuring سنجر is strictly NEVER present)
  const cleanPlatformName = ((settings.PLATFORM_NAME && !settings.PLATFORM_NAME.includes('?'))
    ? settings.PLATFORM_NAME
    : 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim() || 'أكاديمية م / محمد إبراهيم';

  // Social & Quick Contact URL computations (guaranteeing WhatsApp is ALWAYS active with Admin-configured number)
  const rawWhatsApp = settings.WHATSAPP_NUMBER || settings.CONTACT_WHATSAPP || settings.CONTACT_PHONE || '';
  const safeWhatsApp = (rawWhatsApp && !rawWhatsApp.includes('1001234567')) ? rawWhatsApp : '01555791568';
  const whatsappNum = safeWhatsApp.replace(/[^0-9]/g, '');
  let formattedWhatsapp = whatsappNum;
  if (formattedWhatsapp.startsWith('002')) {
    formattedWhatsapp = formattedWhatsapp.slice(2);
  } else if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '2' + formattedWhatsapp;
  } else if (formattedWhatsapp.length === 10 && formattedWhatsapp.startsWith('1')) {
    formattedWhatsapp = '20' + formattedWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن تفاصيل الكورسات والدبلومات')}`;
  const contactEmail = settings.CONTACT_EMAIL || null;
  const facebookUrl = settings.FACEBOOK_URL || null;
  const telegramUrl = settings.TELEGRAM_URL || null;
  const youtubeUrl = settings.YOUTUBE_URL || null;
  const linkedinUrl = settings.LINKEDIN_URL || null;
  const hasAnySocial = Boolean(whatsappUrl || contactEmail || facebookUrl || telegramUrl || youtubeUrl || linkedinUrl);

  return (
    <div className="page-canvas relative overflow-hidden pb-24 text-zinc-100 min-h-screen">
      {/* Sleek, Hardware-Accelerated Dynamic Ambient Glow Canvas */}
      <div className="ambient-glow absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,91,0.14),_rgba(124,58,237,0.08)_45%,_transparent_70%)] blur-[60px]" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(0,229,91,0.12),_transparent_65%)] blur-[70px] rounded-full animate-ambient-drift" />
        <div className="absolute top-1/3 -left-20 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(147,51,234,0.12),_transparent_65%)] blur-[70px] rounded-full animate-float-slow" />
      </div>

      <div className="relative z-10 flex flex-col">

        {/* 1. Desktop Hero (100% untouched computer design) */}
        <DesktopHero
          settings={settings}
          cleanPlatformName={cleanPlatformName}
          trendingDiploma={trendingDiploma}
          whatsappUrl={whatsappUrl}
          contactEmail={contactEmail}
          facebookUrl={facebookUrl}
          telegramUrl={telegramUrl}
          youtubeUrl={youtubeUrl}
          linkedinUrl={linkedinUrl}
          hasAnySocial={hasAnySocial}
        />

        {/* 2. Mobile Hero (Dedicated mobile copy with dark/light calibration, soft glow, and comfortable spacing) */}
        <MobileHero
          settings={settings}
          cleanPlatformName={cleanPlatformName}
          trendingDiploma={trendingDiploma}
          whatsappUrl={whatsappUrl}
          contactEmail={contactEmail}
          facebookUrl={facebookUrl}
          telegramUrl={telegramUrl}
          youtubeUrl={youtubeUrl}
          linkedinUrl={linkedinUrl}
          hasAnySocial={hasAnySocial}
        />

        <section className="px-4 sm:px-6 py-20 bg-slate-100/50 dark:bg-zinc-900/20 border-b border-slate-200/80 dark:border-zinc-800/40 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-indigo-600 dark:text-[#00e55b] uppercase tracking-wider mb-2">إنجازات الأكاديمية</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-zinc-100 mb-3">أرقام تتحدث عن نفسها</h2>
              <p className="text-slate-600 dark:text-zinc-400 max-w-lg mx-auto text-sm">نفخر بثقة طلابنا وخريجينا في مصر والوطن العربي ونسعى دائماً لتقديم أفضل تجربة تدريب هندسي</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/50 hover:border-blue-300 dark:hover:border-zinc-700/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="font-display text-3xl md:text-4xl font-bold text-blue-600 dark:text-zinc-100 mb-1 group-hover:scale-105 transition-transform">+{stats.studentsCount}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-400 mb-1">طالب وخريج</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-600">في مصر والعالم العربي</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/50 hover:border-indigo-300 dark:hover:border-zinc-700/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="font-display text-3xl md:text-4xl font-bold text-indigo-600 dark:text-zinc-100 mb-1 group-hover:scale-105 transition-transform">+{stats.coursesCount}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-400 mb-1">كورس هندسي</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-600">محدثة ومبنية لسوق العمل</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/50 hover:border-amber-300 dark:hover:border-zinc-700/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="font-display text-3xl md:text-4xl font-bold text-amber-600 dark:text-[#00e55b] mb-1 group-hover:scale-105 transition-transform">+{stats.diplomasCount}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-400 mb-1">دبلومات مهنية</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-600">تأهيل وظيفي شامل</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/90 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/50 hover:border-emerald-300 dark:hover:border-zinc-700/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="font-display text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-105 transition-transform">94%</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-400 mb-1">نسبة التوظيف</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-600">في الشركات والعمل الحر</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {trendingDiploma && (
          <section id="trending-diploma" className="px-4 sm:px-6 py-20 sm:py-24 relative overflow-hidden scroll-mt-24">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/10 dark:from-[#00e55b]/10 dark:to-transparent rounded-full blur-[140px]" />
            </div>

            <div className="max-w-5xl mx-auto relative">
              <div className="relative rounded-3xl border border-indigo-200/70 dark:border-[#00e55b]/40 bg-gradient-to-br from-white/95 via-indigo-50/30 to-amber-50/20 dark:from-[#00e55b]/10 dark:via-zinc-900/80 dark:to-zinc-950 overflow-hidden shadow-2xl backdrop-blur-xl p-8 md:p-12">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-[#00e55b]/10 border border-indigo-200 dark:border-[#00e55b]/30 text-indigo-700 dark:text-[#70ff9b] text-xs font-bold mb-6 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-[#00e55b]" />
                  <span>الدبلومة الهندسية الأكثر طلباً ومبيعاً لعام 2026 (TRENDING #1)</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                      {trendingDiploma.title}
                      {trendingDiploma.compareAtPrice && trendingDiploma.compareAtPrice > trendingDiploma.price && (
                        <span className="block mt-1 bg-gradient-to-l from-indigo-700 via-blue-600 to-sky-600 dark:from-[#0df268] dark:to-[#00e55b] bg-clip-text text-transparent">
                          خصم استثنائي {Math.round(((trendingDiploma.compareAtPrice - trendingDiploma.price) / trendingDiploma.compareAtPrice) * 100)}% لفترة محدودة
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-sm max-w-lg">
                      {trendingDiploma.shortDescription || trendingDiploma.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-400 text-xs shadow-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-[#00e55b]/20 dark:text-[#00e55b] text-[10px] font-bold flex items-center justify-center">1</span>
                        12 مشروع إنتاج واقعي
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-400 text-xs shadow-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-[#00e55b]/20 dark:text-[#00e55b] text-[10px] font-bold flex items-center justify-center">2</span>
                        مشغل آمن بعلامة مائية
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800/60 text-slate-700 dark:text-zinc-400 text-xs shadow-xs">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-[#00e55b]/20 dark:text-[#00e55b] text-[10px] font-bold flex items-center justify-center">3</span>
                        شهادة معتمدة بـ QR
                      </span>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-500 block font-medium">سعر الاشتراك بالخصم الحصري:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-[#00e55b]">{formatPrice(trendingDiploma.price)}</span>
                          {trendingDiploma.compareAtPrice && (
                            <span className="text-sm text-slate-400 dark:text-zinc-500 line-through">
                              {formatPrice(trendingDiploma.compareAtPrice)}
                            </span>
                          )}
                          {trendingDiploma.compareAtPrice && trendingDiploma.compareAtPrice > trendingDiploma.price && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                              وفر {Math.round(((trendingDiploma.compareAtPrice - trendingDiploma.price) / trendingDiploma.compareAtPrice) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/diplomas/${trendingDiploma.slug}`}
                        className="shimmer-border-wrapper group"
                      >
                        <div className="shimmer-beam-gold" />
                        <div className="shimmer-button-content px-8 py-3.5 text-sm font-bold text-slate-900 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] dark:border-[#00e55b]/60 dark:shadow-[0_10px_30px_rgba(0,229,91,0.45)]">
                          <Flame className="w-4 h-4 text-amber-500 dark:text-black animate-bounce" />
                          <span>سجل الآن في الدبلومة الأكثر طلباً</span>
                          <ArrowLeft className="w-4 h-4 text-slate-900 dark:text-black group-hover:-translate-x-1.5 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl group">
                      <Image
                        src={trendingDiploma.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                        alt={trendingDiploma.title}
                        width={540}
                        height={360}
                        sizes="(max-width: 768px) 100vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-indigo-300 dark:border-[#00e55b]/40 text-indigo-600 dark:text-[#00e55b] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-7 h-7" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-white font-bold backdrop-blur-sm">
                          {trendingDiploma.diplomaCourses?.length || 4} كورسات مدمجة
                        </span>
                        <span className="px-2.5 py-1 rounded bg-emerald-700/95 text-white font-bold backdrop-blur-sm">
                          تأهيل وظيفي كامل
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        <HomeCoursesSection initialCourses={courses} categories={categories} />

        {/* =========================================================================
            6. PLATFORM FEATURES & COMPARISON MATRIX (جدول مميزات ومقارنة المنصة)
           ========================================================================= */}
        <PlatformFeaturesMatrix platformName={cleanPlatformName} whatsappUrl={whatsappUrl} />

        {/* =========================================================================
            7. TESTIMONIALS (قصص نجاح وإشادات حقيقية)
           ========================================================================= */}
        <section className="px-4 sm:px-6 py-20 sm:py-24 bg-slate-100/70 dark:bg-zinc-900/20 border-y border-slate-200/90 dark:border-zinc-800/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-2">
              <p className="text-xs font-black text-indigo-600 dark:text-[#00e55b] uppercase tracking-wider">آراء الطلاب والخريجين</p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-950 dark:text-zinc-100">قصص نجاح من قلب سوق العمل</h2>
              <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-lg mx-auto">تجارب حقيقية لطلاب انطلقوا من الأكاديمية إلى كبرى الشركات والعمل الحر</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/50 space-y-4 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 text-amber-500 dark:text-[#00e55b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 dark:fill-[#00e55b] text-amber-400 dark:text-[#00e55b]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  "الدبلومة غيرت مساري المهني بالكامل! الشرح كان عملياً على مشاريع إنتاج حقيقية، وحصلت على وظيفة مطور برمجيات بعد تخرجي بشهرين فقط."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-[#00e55b]/20 flex items-center justify-center text-xs font-black text-amber-700 dark:text-[#00e55b]">
                    أ
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-zinc-200">أحمد حسام</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">مطور Full-Stack • خريج دبلوم Next.js</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/50 space-y-4 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 text-amber-500 dark:text-[#00e55b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 dark:fill-[#00e55b] text-amber-400 dark:text-[#00e55b]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  "أفضل تجربة تعليمية في الوطن العربي. مشغل الفيديو فائق السرعة والمساعد الذكي يحل أي مشكلة برمجية تواجهك في ثوانٍ معدودة."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-purple-700 dark:text-purple-400">
                    م
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-zinc-200">مريم الكردي</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">مطورة واجهات أمامية وتطبيقات</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/50 space-y-4 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 text-amber-500 dark:text-[#00e55b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 dark:fill-[#00e55b] text-amber-400 dark:text-[#00e55b]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  "الشهادة المعتمدة برمز QR سهلت عليّ إثبات مهاراتي لعملاء الفريلانس الدوليين. الدفع عبر إنستاباي وفودافون كاش جعل الاشتراك فائق السهولة."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400">
                    خ
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-zinc-200">خالد عبد الله</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">مستقل معتمد (Top Rated)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
            BOTTOM QUICK DIRECT CONTACT STRIP (Relocated from hero as requested)
           ======================================================================= */}
        {hasAnySocial && (
          <section className="px-4 sm:px-6 py-14 sm:py-16 bg-slate-900/[0.03] dark:bg-zinc-950/60 border-t border-slate-200/80 dark:border-zinc-800/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,91,0.06),_transparent_70%)] pointer-events-none" />
            <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8">
              
              {/* Header */}
              <div className="space-y-2.5 max-w-xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-[#00e55b]/10 border border-blue-200 dark:border-[#00e55b]/30 text-blue-700 dark:text-[#70ff9b] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تواصل فوري ومباشر مع إدارة الأكاديمية</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-slate-950 dark:text-zinc-100">
                  فريقنا معك في كل خطوة
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  هل لديك استفسار عن الكورسات، أو ترغب في مساعدة فورية بالتسجيل؟ تواصل معنا مباشرة عبر القناة الأنسب لك
                </p>
              </div>

              {/* Action Buttons Matrix */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00e55b] dark:hover:bg-[#0df268] dark:text-black font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 dark:shadow-[0_4px_25px_rgba(0,229,91,0.35)] hover:scale-105 active:scale-95"
                    title="محادثة واتساب مباشرة"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>واتساب الأكاديمية (رد فوري)</span>
                  </a>
                )}

                <Link
                  href="/support"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 font-bold text-xs sm:text-sm transition-all shadow-sm hover:scale-105 active:scale-95"
                  title="الدعم الفني والمساعدة"
                >
                  <Headphones className="w-4 h-4 text-blue-600 dark:text-[#00e55b] shrink-0" />
                  <span>مركز الدعم الفني</span>
                </Link>

                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="راسلنا عبر البريد"
                  >
                    <Mail className="w-4 h-4 text-slate-600 dark:text-zinc-400 shrink-0" />
                    <span>البريد الإلكتروني</span>
                  </a>
                )}

                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="صفحة الفيسبوك الرسمية"
                  >
                    <Facebook className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>فيسبوك</span>
                  </a>
                )}

                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="قناة التيليجرام"
                  >
                    <Send className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>تيليجرام</span>
                  </a>
                )}

                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="قناة اليوتيوب الرسمية"
                  >
                    <Youtube className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>يوتيوب</span>
                  </a>
                )}

                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="لينكد إن"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span>لينكد إن</span>
                  </a>
                )}
              </div>

            </div>
          </section>
        )}

      </div>
    </div>
  );
}
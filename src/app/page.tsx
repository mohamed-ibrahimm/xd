import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import DesktopHero from '@/components/home/DesktopHero';
import MobileHero from '@/components/home/MobileHero';
import HomeFeatureBar from '@/components/home/HomeFeatureBar';
import HomeCoursesSection from '@/components/home/HomeCoursesSection';
import PlatformFeaturesMatrix from '@/components/home/PlatformFeaturesMatrix';

import ColorBendsBackground from '@/components/home/ColorBendsBackground';

export const dynamic = 'force-dynamic';
import {
  PlayCircle,
  ArrowLeft,
  Sparkles,
  Star,
  Flame,
  MessageCircle,
  Headphones,
  Mail,
  Facebook,
  Send,
  Youtube,
  Linkedin,
  ShieldCheck,
} from 'lucide-react';

// Lightning-fast in-memory cache with stale-while-revalidate pattern for instant sub-millisecond loads
let cachedHomeData: any = null;
let lastHomeFetchTime = 0;
let isRevalidating = false;
const CACHE_TTL_MS = 120 * 1000; // 2 minutes

async function fetchFreshHomeData() {
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

async function getHomeData() {
  const now = Date.now();
  if (cachedHomeData) {
    // If cache is fresh, return immediately (< 1ms)
    if (now - lastHomeFetchTime < CACHE_TTL_MS) {
      return cachedHomeData;
    }
    // Stale-while-revalidate: return existing cache instantly, refresh in background
    if (!isRevalidating) {
      isRevalidating = true;
      fetchFreshHomeData()
        .then((fresh) => {
          cachedHomeData = fresh;
          lastHomeFetchTime = Date.now();
        })
        .catch(() => {})
        .finally(() => {
          isRevalidating = false;
        });
    }
    return cachedHomeData;
  }

  const fresh = await fetchFreshHomeData();
  cachedHomeData = fresh;
  lastHomeFetchTime = Date.now();
  return fresh;
}

export default async function HomePage() {
  const { courses, diplomas, categories, stats, settings } = await getHomeData();
  const trendingDiploma = diplomas[0] || null;

  // Clean Platform Name
  const cleanPlatformName = ((settings.PLATFORM_NAME && !settings.PLATFORM_NAME.includes('?'))
    ? settings.PLATFORM_NAME
    : 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim() || 'أكاديمية م / محمد إبراهيم';

  // Social & WhatsApp URLs
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
    <div className="page-canvas relative overflow-hidden pb-12 text-slate-900 dark:text-[#FAFAFA] min-h-screen bg-[#FAF8FA] dark:bg-[#050505]">

      {/* Light Mode Soft Aurora Ambient Glow (Desktop only for max mobile performance) */}
      <div className="hidden md:block dark:hidden ambient-glow absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-[radial-gradient(ellipse_at_top,_rgba(216,63,143,0.08),_rgba(233,79,159,0.05)_45%,_transparent_70%)] blur-[80px]" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(216,63,143,0.05),_transparent_65%)] blur-[90px] rounded-full" />
        <div className="absolute top-1/3 -left-20 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(233,79,159,0.04),_transparent_65%)] blur-[90px] rounded-full" />
      </div>

      {/* Dark Mode Ambient Atmosphere Continuity across all page sections (Desktop only) */}
      <div className="hidden md:dark:block ambient-glow absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-[800px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(233,79,159,0.02),_transparent_70%)] blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col">

        {/* 1. HERO SECTION (Desktop & Mobile) - Matches top half of reference */}
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

        {/* 2. FLOATING 4-FEATURE BAR - Direct translation of Lingua feature cards */}
        <HomeFeatureBar platformName={cleanPlatformName} />

        {/* 3. POPULAR COURSES - 4 Cards Grid with Level Pill & Round Action Buttons */}
        <HomeCoursesSection initialCourses={courses} categories={categories} />


        {/* 6. FEATURED / TRENDING DIPLOMA (If available) */}
        {trendingDiploma && (
          <section id="trending-diploma" className="px-4 sm:px-6 py-16 relative overflow-hidden scroll-mt-24">
            <div className="max-w-5xl mx-auto relative">
              <div className="relative rounded-3xl border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] bg-gradient-to-br from-white via-pink-50/40 to-purple-50/30 dark:from-[#111113] dark:via-[#0A0A0C] dark:to-[#050505] overflow-hidden shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(233,79,159,0.10)] p-8 md:p-12">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-bold mb-6 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                  <span>الدبلومة الهندسية الأكثر طلباً ومبيعاً لعام 2026 (TRENDING #1)</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#FAFAFA] leading-tight">
                      {trendingDiploma.title}
                      {trendingDiploma.compareAtPrice && trendingDiploma.compareAtPrice > trendingDiploma.price && (
                        <span className="block mt-1 text-[#D83F8F] dark:text-[#E94F9F] text-lg font-bold">
                          خصم استثنائي {Math.round(((trendingDiploma.compareAtPrice - trendingDiploma.price) / trendingDiploma.compareAtPrice) * 100)}% لفترة محدودة
                        </span>
                      )}
                    </h2>
                    <p className="text-slate-600 dark:text-[#C5C5C8] leading-relaxed text-xs sm:text-sm max-w-lg">
                      {trendingDiploma.shortDescription || trendingDiploma.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.18)] text-slate-700 dark:text-[#C5C5C8] text-xs font-bold">
                        12 مشروع إنتاج واقعي
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.18)] text-slate-700 dark:text-[#C5C5C8] text-xs font-bold">
                        مشغل آمن ومحمي
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.18)] text-slate-700 dark:text-[#C5C5C8] text-xs font-bold">
                        شهادة معتمدة بـ QR
                      </span>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-[#85858A] block font-medium">سعر الاشتراك بالخصم:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-[#D83F8F] dark:text-[#E94F9F]">{formatPrice(trendingDiploma.price)}</span>
                          {trendingDiploma.compareAtPrice && (
                            <span className="text-xs text-slate-400 dark:text-[#85858A] line-through">
                              {formatPrice(trendingDiploma.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/diplomas/${trendingDiploma.slug}`}
                        className="px-6 py-3 rounded-full text-xs sm:text-sm font-black text-white dark:text-[#080808] bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] shadow-lg shadow-pink-600/25 dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] border border-pink-600/30 dark:border-[rgba(233,79,159,0.40)] flex items-center gap-2 transition-all hover:scale-105"
                      >
                        <Flame className="w-4 h-4 text-white dark:text-[#080808] animate-bounce" />
                        <span>سجل الآن في الدبلومة</span>
                        <ArrowLeft className="w-4 h-4 text-white dark:text-[#080808]" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 relative">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] shadow-xl group">
                      <Image
                        src={trendingDiploma.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                        alt={trendingDiploma.title}
                        width={540}
                        height={360}
                        sizes="(max-width: 768px) 100vw, 540px"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-[#111113]/90 text-[#D83F8F] dark:text-[#E94F9F] border border-white/20 dark:border-[rgba(233,79,159,0.30)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* 7. PLATFORM COMPARISON MATRIX (Collapsible/Accessible) */}
        <PlatformFeaturesMatrix platformName={cleanPlatformName} whatsappUrl={whatsappUrl} />



      </div>
    </div>
  );
}
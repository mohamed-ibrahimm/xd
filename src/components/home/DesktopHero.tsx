'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  GraduationCap,
  Video,
  FileText,
  Star,
} from 'lucide-react';

import ColorBendsBackground from '@/components/home/ColorBendsBackground';
import { useLanguage } from '@/components/LanguageProvider';

interface DesktopHeroProps {
  settings: Record<string, string>;
  cleanPlatformName: string;
  trendingDiploma: any;
  whatsappUrl?: string | null;
  contactEmail?: string | null;
  facebookUrl?: string | null;
  telegramUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  hasAnySocial?: boolean;
}

export default function DesktopHero({
  settings,
  cleanPlatformName,
}: DesktopHeroProps) {
  const { t, lang } = useLanguage();

  return (
    <section className="hidden md:flex flex-col justify-between items-center min-h-screen lg:h-screen pt-24 pb-0 px-4 sm:px-6 lg:px-8 relative overflow-hidden shrink-0 select-none">
      
      {/* 1. Dynamic WebGL Fluid Wave Background (Dark) / Soft Luxury Atmosphere (Light) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505]">
        {/* Dark Mode - Interactive Dynamic ColorBends WebGL Fluid Canvas */}
        <div className="hidden dark:block absolute inset-0 pointer-events-none overflow-hidden">
          <ColorBendsBackground
            colors={['#E94F9F', '#9B2C6E', '#1A0B2E']}
            speed={0.22}
            rotation={44}
            scale={2.2}
            frequency={1.0}
            warpStrength={1.0}
            intensity={1.15}
            bandWidth={6.5}
          />
          {/* Smooth GPU vignettes to seamlessly blend into deep black without harsh edges */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-[#050505]/40 to-[#050505]/90" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent" />
        </div>

        {/* Light Mode Atmosphere - Calming, eye-friendly, feather-light */}
        <div
          className="dark:hidden absolute inset-0 pointer-events-none overflow-hidden bg-[#FAF8FA]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(216, 63, 143, 0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="max-w-[1536px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 items-end gap-6 xl:gap-8 z-10 px-2 sm:px-4">
        
        {/* =========================================================================
            RIGHT COLUMN IN RTL (1st in DOM): TEXT HEADLINES, BADGES, & ACTION BUTTONS
           ========================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-start space-y-4 lg:space-y-5 self-center py-4 lg:py-6">
          
          {/* Promotional Dynamic Shimmer Banner */}
          {settings.BANNER_ENABLED !== 'false' && (
            <div className="inline-block max-w-full">
              <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block max-w-full">
                <div className="shimmer-beam-cyber" />
                <div className="shimmer-button-content px-4 py-2 text-xs sm:text-sm font-bold bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.20)] dark:hover:border-[#E94F9F]/50 text-slate-800 dark:text-[#FAFAFA] backdrop-blur-md flex items-center gap-2 shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all">
                  <Sparkles className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F] animate-pulse shrink-0" />
                  <span className="text-[#D83F8F] dark:text-[#E94F9F] font-black shrink-0">
                    {t(settings.HERO_BADGE || 'جديد 2026', 'New 2026')}
                  </span>
                  <span className="text-slate-300 dark:text-zinc-600 shrink-0">•</span>
                  <span className="truncate max-w-xl text-slate-700 dark:text-zinc-300 font-medium">
                    {t((settings.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات والدبلومات الهندسية').trim(), 'Special 50% Discount for a Limited Time on All Engineering Tracks & Diplomas')}
                  </span>
                  <ArrowLeft className={`w-4 h-4 text-slate-400 dark:text-[#E94F9F] -translate-x-0.5 group-hover:-translate-x-1 transition-transform shrink-0 ${lang === 'en' ? 'rotate-180' : ''}`} />
                </div>
              </a>
            </div>
          )}

          {/* Headlines: Clean, Inspiring & Expansive Typography */}
          <div className="space-y-3 max-w-[720px] text-start">
            <h1 className="text-3xl sm:text-4xl lg:text-[48px] xl:text-[56px] font-black text-slate-900 dark:text-white leading-[1.22] tracking-tight">
              <span className="block">{t(settings.HERO_TITLE || 'بوابتك الذكية لاحتراف', 'Your Smart Gateway to Mastering')}</span>
              <span className="block mt-1.5 bg-gradient-to-r from-[#D83F8F] via-[#E94F9F] to-[#FF5CAD] bg-clip-text text-transparent leading-[1.22] py-1 max-w-[540px]">
                {t((settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي').replace(/،/g, '').trim(), 'Coding, Systems Engineering & AI')}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-[17px] text-slate-600 dark:text-zinc-300 max-w-[640px] leading-relaxed font-normal pt-1">
              {t(settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`, `${cleanPlatformName} — Integrated engineering tracks, accredited diplomas, and real production projects qualifying you for the job market.`)}
            </p>
          </div>

          {/* TWO MAIN PROMINENT CTA BUTTONS */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <a
              href="#trending-diploma"
              className="shimmer-border-wrapper group shrink-0 cursor-pointer"
            >
              <div className="shimmer-beam-cyber" />
              <div className="shimmer-button-content px-7 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] dark:text-black rounded-full shadow-lg border border-slate-900/15 dark:border-[rgba(233,79,159,0.40)] dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] group-hover:opacity-95 transition-all">
                <Flame className="w-4 h-4 text-amber-300 dark:text-black animate-bounce shrink-0" />
                <span className="font-black whitespace-nowrap">
                  {t((settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل').trim(), 'Most In-Demand Diploma in the Job Market')}
                </span>
                <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowLeft className={`w-3.5 h-3.5 text-white dark:text-black group-hover:-translate-x-0.5 transition-transform shrink-0 ${lang === 'en' ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </a>

            <Link
              href="/books"
              className="px-6 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:border-slate-300 flex items-center gap-2.5 transition-all hover:scale-105 dark:bg-[#111113] dark:hover:bg-[#17171A] dark:text-white dark:border-[rgba(233,79,159,0.25)] hover:dark:border-[#E94F9F]/60 dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <FileText className="w-4 h-4 text-slate-700 dark:text-white" />
              <span>{t('سوق المذكرات والكتب', 'Notes & Books Marketplace')}</span>
            </Link>
          </div>

          {/* Student Social Proof Row */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1.5">
            <div className="flex -space-x-2 rtl:space-x-reverse shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="طالبة بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-sm" />
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E94F9F] animate-pulse" />
                <span className="text-slate-900 dark:text-white font-black">
                  {t('+1,540 طالب يدرسون الآن', '+1,540 Students Studying Now')}
                </span>
              </span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-4 h-4 fill-current text-amber-400" />
                <span className="font-black text-slate-900 dark:text-white">4.9/5</span>
                <span className="text-slate-500 dark:text-zinc-400 text-xs font-medium">
                  {t('(تقييم خريجي المنصة)', '(Platform Alumni Rating)')}
                </span>
              </div>
            </div>
          </div>

          {/* Dual Join Instructor Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/instructors/join?track=expert"
              prefetch={true}
              className="group flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 dark:bg-[#111113] dark:text-white dark:border-white/10 dark:hover:border-[#E94F9F] dark:hover:text-[#E94F9F] backdrop-blur-md transition-all rounded-full shadow-xs hover:scale-105 shrink-0"
            >
              <Video className="w-3.5 h-3.5 text-slate-600 dark:text-white group-hover:text-[#E94F9F] shrink-0" />
              <span className="whitespace-nowrap">
                {t('انضم كـ مدرس أو دكتور (14 يوماً مجاناً • 0% عمولة)', 'Join as Teacher or Doctor (14 Days Free • 0% Commission)')}
              </span>
            </Link>

            <Link
              href="/instructors/join?track=student"
              prefetch={true}
              className="group flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 dark:bg-[#111113] dark:text-white dark:border-white/10 dark:hover:border-[#E94F9F] dark:hover:text-[#E94F9F] backdrop-blur-md transition-all rounded-full shadow-xs hover:scale-105 shrink-0"
            >
              <GraduationCap className="w-4 h-4 text-slate-600 dark:text-white group-hover:text-[#E94F9F] shrink-0" />
              <span className="whitespace-nowrap">
                {t('اشترك كمحاضر طالب (منحة 14 يوماً مجاناً)', 'Join as Student Instructor (14 Days Free Grant)')}
              </span>
            </Link>
          </div>

        </div>

        {/* =========================================================================
            LEFT COLUMN IN RTL (2nd in DOM): SEAMLESS INTEGRATED CINEMATIC HERO VISUAL
           ========================================================================= */}
        <div
          dir="ltr"
          className="lg:col-span-6 xl:col-span-6 relative w-full flex items-end justify-start self-end pointer-events-none select-none pb-0 mb-0"
        >
          {/* Student Visual: Frameless, Clean, Scaled Large and Aligned to Bottom Edge */}
          <div
            dir="ltr"
            className="relative w-full flex items-end justify-start"
          >
            <img
              src="/images/hero-student-cutout.png"
              alt={t('طالب الأكاديمية', 'Academy Student')}
              className="w-auto h-[500px] sm:h-[550px] lg:h-[610px] xl:h-[635px] 2xl:h-[660px] max-h-[82vh] max-w-none object-contain object-bottom -translate-x-8 lg:-translate-x-16 transition-all duration-300 pointer-events-auto filter-none drop-shadow-none dark:drop-shadow-none"
            />
          </div>

        </div>

      </div>
    </section>
  );
}

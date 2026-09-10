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
import { useTheme } from '@/components/ThemeProvider';

interface MobileHeroProps {
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

export default function MobileHero({
  settings,
  cleanPlatformName,
}: MobileHeroProps) {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className="md:hidden flex flex-col w-full text-center relative overflow-hidden">
      
      {/* 1. Dynamic WebGL Fluid Wave (Dark Mode) / Soft Luxury Atmosphere (Light Mode) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505]">
        {/* Dark Mode - Dynamic ColorBends WebGL Fluid Canvas (Sleek Side Accent Line - Soft & Eye-Friendly) */}
        <div className="hidden dark:block absolute -left-4 top-0 bottom-0 w-[52%] pointer-events-none overflow-hidden opacity-70">
          <ColorBendsBackground
            colors={['#D83F8F', '#851E59', '#1A0B2E']}
            speed={0.13}
            rotation={42}
            scale={2.2}
            frequency={0.95}
            warpStrength={0.9}
            intensity={0.7}
            bandWidth={3.2}
          />
          {/* Smooth fades to blend line into background without sharp edges */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#050505]/60 to-transparent" />
        </div>

        {/* Light Mode Atmosphere - Identical to Desktop Luxury Atmosphere, zero WebGL overhead */}
        <div
          className="dark:hidden absolute inset-0 pointer-events-none overflow-hidden bg-[#FAF8FA]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 45% at 50% 0%, rgba(216, 63, 143, 0.03) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Main Mobile Hero Fold */}
      <section className="flex flex-col pt-20 pb-8 px-4 relative z-10 space-y-4">
        
        {/* 1. Promotional Announcement Pill */}
        {settings.BANNER_ENABLED !== 'false' && (
          <div className="inline-block w-full max-w-sm mx-auto">
            <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block w-full">
              <div className="shimmer-beam-cyber" />
              <div className="shimmer-button-content w-full px-3.5 py-1.5 text-[11px] font-bold text-slate-800 dark:text-[#FAFAFA] bg-white dark:bg-[#111113]/90 border border-slate-200/90 dark:border-[rgba(233,79,159,0.25)] flex items-center justify-between gap-1.5 rounded-full shadow-xs">
                <div className="flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F] animate-pulse shrink-0" />
                  <span className="!text-[#D83F8F] dark:!text-[#E94F9F] font-black shrink-0">
                    {t(settings.HERO_BADGE || 'جديد 2026', 'New 2026')}
                  </span>
                </div>
                <span className="truncate text-slate-700 dark:text-zinc-300 group-hover:text-[#D83F8F] dark:group-hover:text-[#FF5CAD] transition-colors font-medium text-[10.5px]">
                  {t((settings.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات').trim(), 'Special 50% Discount for a Limited Time on All Tracks')}
                </span>
                <ArrowLeft className={`w-3.5 h-3.5 text-slate-400 dark:text-[#E94F9F] group-hover:-translate-x-0.5 transition-transform shrink-0 ${lang === 'en' ? 'rotate-180' : ''}`} />
              </div>
            </a>
          </div>
        )}

        {/* 2. Headline & Subtitle */}
        <div className="space-y-2 text-center max-w-sm mx-auto">
          <h1 className="font-black tracking-tight space-y-1">
            <span className="text-slate-900 dark:text-[#FAFAFA] block font-black text-2xl xs:text-3xl leading-tight">
              {t(settings.HERO_TITLE || 'بوابتك الذكية لاحتراف', 'Your Smart Gateway to Mastering')}
            </span>
            <span className="block font-black text-xl xs:text-2xl leading-snug bg-gradient-to-r from-[#D83F8F] via-[#E94F9F] to-[#FF5CAD] bg-clip-text text-transparent">
              {t((settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي').replace(/،/g, '').trim(), 'Coding, Systems Engineering & AI')}
            </span>
          </h1>

          <p className="text-xs xs:text-[13px] text-slate-600 dark:text-zinc-300 leading-relaxed font-normal pt-0.5">
            {t(settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة ومشاريع واقعية تؤهلك لسوق العمل بثقة واحتراف.`, `${cleanPlatformName} — Integrated engineering tracks, accredited diplomas, and real production projects qualifying you for the job market.`)}
          </p>
        </div>

        {/* 3. CENTRAL HERO VISUAL: Clean Cutout Front & Center (No Overlapping Badges) */}
        <div className="relative w-full flex items-center justify-center my-0.5 select-none pointer-events-none">
          {/* Soft Deep Ambient Tone (Dark Mode Only) */}
          <div className="hidden dark:block absolute w-48 h-48 rounded-full bg-[#D83F8F]/5 blur-3xl -z-10 pointer-events-none" />

          {/* Student Cutout */}
          <div className="relative flex items-end justify-center w-full">
            <img
              src="/images/hero-student-cutout.png"
              alt={t('طلاب الأكاديمية', 'Academy Students')}
              className="w-auto h-[265px] xs:h-[300px] sm:h-[335px] max-w-[94%] object-contain object-bottom pointer-events-auto filter-none drop-shadow-none"
            />
            {/* Soft Bottom Transition Fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#FAF8FA] dark:from-[#050505] to-transparent" />
          </div>
        </div>

        {/* 4. Action Section: Ergonomic & High-Converting Hierarchy */}
        <div className="w-full max-w-sm mx-auto flex flex-col gap-2.5 pt-1">
          
          {/* Button 1: Primary Featured Diploma (Cyber Shimmer Pill) */}
          <a href="#trending-diploma" className="shimmer-border-wrapper group w-full block">
            <div className="shimmer-beam-cyber" />
            <div className="shimmer-button-content w-full px-5 py-3 text-xs xs:text-sm font-black text-white dark:text-[#080808] bg-slate-900 hover:bg-slate-800 dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] group-hover:opacity-95 flex items-center justify-center gap-2.5 rounded-2xl shadow-md shadow-slate-900/10 border border-slate-900/15 dark:border-[rgba(233,79,159,0.40)] dark:shadow-[0_8px_25px_rgba(233,79,159,0.30)] transition-all relative">
              <div className="flex items-center justify-center gap-2 text-center">
                <Flame className="w-4 h-4 text-amber-300 dark:text-[#080808] animate-bounce shrink-0" />
                <span className="font-black whitespace-nowrap">
                  {t((settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل').trim(), 'Most In-Demand Diploma in the Job Market')}
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center shrink-0 absolute end-3.5">
                <ArrowLeft className={`w-3.5 h-3.5 text-white dark:text-black shrink-0 ${lang === 'en' ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </a>

          {/* Button 2: Digital Notes & Books Marketplace */}
          <Link
            href="/books"
            prefetch={true}
            className="group flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs xs:text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 dark:bg-[#111113] dark:text-white dark:border-[rgba(233,79,159,0.25)] dark:hover:border-[#E94F9F]/60 transition-all rounded-2xl shadow-xs active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-slate-700 dark:text-white shrink-0" />
            <span className="whitespace-nowrap">
              {t('سوق المذكرات والكتب (خصم 50% ومعاينة)', 'Notes & Books Marketplace (50% Off & Preview)')}
            </span>
          </Link>

          {/* Dual Instructor Segmented Row (2 Side-by-Side Compact Pills) */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              href="/instructors/join?track=expert"
              prefetch={true}
              className="group flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 hover:border-slate-300 dark:bg-[#111113] dark:text-zinc-200 dark:border-white/10 dark:hover:border-[#E94F9F]/40 rounded-xl transition-all shadow-xs text-center"
            >
              <Video className="w-3.5 h-3.5 text-slate-600 dark:text-[#E94F9F] group-hover:text-[#D83F8F] shrink-0" />
              <span className="truncate">{t('مدرس (0% عمولة)', 'Teacher (0% Fee)')}</span>
            </Link>

            <Link
              href="/instructors/join?track=student"
              prefetch={true}
              className="group flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 hover:border-slate-300 dark:bg-[rgba(233,79,159,0.08)] dark:text-[#E94F9F] dark:border-[rgba(233,79,159,0.20)] dark:hover:border-[#E94F9F]/50 rounded-xl transition-all shadow-xs text-center"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-600 dark:text-[#E94F9F] group-hover:text-[#D83F8F] shrink-0" />
              <span className="truncate">{t('محاضر طالب (منحة)', 'Student Teacher')}</span>
            </Link>
          </div>

          {/* 5. Student Social Proof: Sleek Bottom Pill */}
          <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-white/95 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 mx-auto w-fit shadow-xs mt-1">
            <div className="flex -space-x-1.5 rtl:space-x-reverse shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="طالب بالأكاديمية" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-xs" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="طالب بالأكاديمية" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-xs" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="طالب بالأكاديمية" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-xs" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="طالبة بالأكاديمية" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#050505] object-cover shadow-xs" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1 text-slate-900 dark:text-white font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E94F9F] animate-pulse" />
                <span>{t('+1,540 طالب يدرسون الآن', '+1,540 Students Studying Now')}</span>
              </span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <div className="flex items-center gap-1 text-amber-500 dark:text-[#E94F9F]">
                <Star className="w-3 h-3 fill-current text-amber-400" />
                <span className="font-black text-slate-900 dark:text-white">4.9/5</span>
              </div>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}

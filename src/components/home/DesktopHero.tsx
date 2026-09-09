import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  GraduationCap,
  Video,
  FileText,
} from 'lucide-react';

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
  return (
    <section className="hidden md:flex flex-col justify-center items-center h-[100dvh] max-h-[100dvh] pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center shrink-0 select-none">
      <div className="max-w-6xl mx-auto w-full my-auto flex flex-col items-center justify-center space-y-5 lg:space-y-6 z-10">
        
        {/* Promotional Dynamic Shimmer Banner */}
        {settings.BANNER_ENABLED !== 'false' && (
          <div className="inline-block max-w-full px-2">
            <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block max-w-full">
              <div className="shimmer-beam-gold" />
              <div className="shimmer-button-content px-6 py-2 text-xs lg:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-3 flex-nowrap justify-center rounded-full">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#00e55b] animate-pulse" />
                  <span className="text-blue-700 dark:text-[#70ff9b] font-black">{settings.HERO_BADGE || 'جديد 2026'}</span>
                </div>
                <div className="h-4 w-px bg-slate-300 dark:bg-[#00e55b]/40 shrink-0" />
                <span className="group-hover:text-blue-700 dark:group-hover:text-[#0df268] transition-colors font-bold text-xs lg:text-sm leading-normal">
                  {settings.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات الهندسية'}
                </span>
                <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-[#00e55b] group-hover:-translate-x-1.5 transition-transform shrink-0" />
              </div>
            </a>
          </div>
        )}

        {/* Headlines: Centered, Majestic, Clean & Expansive Non-Colliding Typography */}
        <div className="space-y-3.5 max-w-5xl mx-auto px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-extrabold text-slate-950 dark:text-white leading-[1.32] tracking-tight">
            <span className="block">{settings.HERO_TITLE || 'بوابتك الذكية لاحتراف'}</span>
            <span className="block mt-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] bg-clip-text text-transparent leading-[1.32] py-1 drop-shadow-sm">
              {(settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي').replace(/،/g, '').trim()}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed font-normal pt-1">
            {settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`}
          </p>
        </div>

        {/* 4 Premium Action Pillars: Lowered Smoothly With Breathing Room & Zero Crowding */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-6 sm:pt-8 pb-2 w-full max-w-5xl mx-auto">
          
          {/* 1. Diploma Button (Electric Cyber Neon Green Pill) */}
          <a href="#trending-diploma" className="shimmer-border-wrapper group shrink-0">
            <div className="shimmer-beam-gold" />
            <div className="shimmer-button-content px-6 lg:px-7 py-3 lg:py-3.5 text-xs lg:text-sm font-black text-amber-950 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] flex items-center justify-center gap-2.5 rounded-full shadow-xl border border-amber-400 dark:border-[#00e55b]/60 dark:shadow-[0_10px_35px_rgba(0,229,91,0.45)] group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-amber-700 dark:text-black animate-bounce shrink-0" />
              <span className="whitespace-nowrap">{settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل (خصم 51%)'}</span>
              <ArrowLeft className="w-4 h-4 text-amber-950 dark:text-black group-hover:-translate-x-1.5 transition-transform shrink-0" />
            </div>
          </a>

          {/* 2. Digital Notes & Books Marketplace */}
          <Link
            href="/books"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-sm font-bold bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/90 transition-all rounded-full shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 backdrop-blur-md shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">{settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة)'}</span>
          </Link>

          {/* 3. Expert Instructor Button */}
          <Link
            href="/instructors/join?track=expert"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-sm font-bold bg-purple-100/90 text-purple-950 border-2 border-purple-400 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-500/60 hover:bg-purple-200 dark:hover:bg-purple-900/90 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
          >
            <Video className="w-4 h-4 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_EXPERT
                ? settings.HERO_BTN_EXPERT.replace(/14\s*يوماً|14\s*يوم/g, `${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً`)
                : `انضم كـ مدرس أو دكتور (${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً مجاناً • 0% عمولة)`}
            </span>
          </Link>

          {/* 4. Student Instructor Button */}
          <Link
            href="/instructors/join?track=student"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-sm font-bold bg-amber-100/90 text-amber-950 border-2 border-amber-400 dark:bg-[#00e55b]/10 dark:text-[#70ff9b] dark:border-[#00e55b]/50 hover:bg-amber-200 dark:hover:bg-[#00e55b]/20 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
          >
            <GraduationCap className="w-4.5 h-4.5 text-amber-700 dark:text-[#00e55b] group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_STUDENT
                ? settings.HERO_BTN_STUDENT.replace(/30\s*يوماً|30\s*يوم/g, `${settings.STUDENT_TRIAL_DAYS || '14'} يوماً`)
                : `اشترك كمحاضر طالب (منحة ${settings.STUDENT_TRIAL_DAYS || '14'} يوماً مجاناً)`}
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}

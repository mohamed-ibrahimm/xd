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
  return (
    <div className="md:hidden flex flex-col w-full text-right relative overflow-hidden">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[140%] max-w-lg h-[380px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,91,0.12),_rgba(124,58,237,0.06)_40%,_transparent_75%)] blur-[95px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 -right-16 w-[280px] h-[280px] bg-[radial-gradient(circle,_rgba(0,229,91,0.10),_transparent_65%)] blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-16 w-[300px] h-[300px] bg-[radial-gradient(circle,_rgba(147,51,234,0.08),_transparent_70%)] blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Main Mobile Hero Fold */}
      <section className="flex flex-col pt-20 pb-12 px-4 relative z-10 space-y-6">
        
        {/* 1. Promotional Shimmer Announcement */}
        {settings.BANNER_ENABLED !== 'false' && (
          <div className="w-full max-w-sm mx-auto">
            <a href="#trending-diploma" className="shimmer-border-wrapper group w-full block">
              <div className="shimmer-beam-gold dark:block hidden" />
              <div className="shimmer-beam-blue dark:hidden block" />
              <div className="shimmer-button-content w-full px-3.5 py-2 text-[11px] text-slate-800 dark:text-zinc-200 flex items-center justify-between gap-1.5 rounded-full">
                <div className="flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#00e55b] animate-pulse" />
                  <span className="text-blue-700 dark:text-[#70ff9b] font-black">{settings.HERO_BADGE || 'جديد!'}</span>
                </div>
                <span className="truncate group-hover:text-blue-700 dark:group-hover:text-[#0df268] transition-colors font-semibold text-[10.5px]">
                  {settings.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات'}
                </span>
                <ArrowLeft className="w-3 h-3 text-blue-600 dark:text-[#00e55b] group-hover:-translate-x-1 transition-transform shrink-0" />
              </div>
            </a>
          </div>
        )}

        {/* 2. Headline & Subtitle */}
        <div className="space-y-3 text-center sm:text-right">
          <h1 className="font-black tracking-tight space-y-1.5">
            <span className="text-slate-950 dark:text-white block font-black text-2xl xs:text-3xl leading-snug">
              {settings.HERO_TITLE || 'بوابتك الذكية لاحتراف'}
            </span>
            <span className="block font-black text-xl xs:text-2xl leading-snug bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-[#00e55b] dark:via-[#10f068] dark:to-[#00b846] bg-clip-text text-transparent">
              {settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي'}
            </span>
          </h1>

          <p className="text-xs xs:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium max-w-md mx-auto sm:mr-0">
            {settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`}
          </p>
        </div>

        {/* 3. Student Ambition & Social Proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 p-3.5 rounded-2xl bg-slate-200/50 dark:bg-zinc-900/60 border border-slate-300/60 dark:border-zinc-800/80 backdrop-blur-md">
          <div className="flex -space-x-2 rtl:space-x-reverse shrink-0">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="طالب بالأكاديمية" className="w-7 h-7 rounded-full border border-white dark:border-zinc-800 object-cover" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="طالب بالأكاديمية" className="w-7 h-7 rounded-full border border-white dark:border-zinc-800 object-cover" />
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="طالب بالأكاديمية" className="w-7 h-7 rounded-full border border-white dark:border-zinc-800 object-cover" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="طالبة بالأكاديمية" className="w-7 h-7 rounded-full border border-white dark:border-zinc-800 object-cover" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
            <span className="flex items-center gap-1 text-[#00e55b]">
              <span className="w-2 h-2 rounded-full bg-[#00e55b] animate-pulse" />
              <span className="text-slate-900 dark:text-zinc-100 font-extrabold">+1,540 طالب</span>
            </span>
            <span className="text-slate-400 dark:text-zinc-600">•</span>
            <div className="flex items-center gap-1 text-amber-500 dark:text-[#00e55b]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-black text-slate-900 dark:text-white">4.9/5</span>
            </div>
          </div>
        </div>

        {/* 4. 4 Action Buttons Matrix */}
        <div className="w-full flex flex-col gap-2.5 pt-2">
          
          {/* Button 1: Diploma (Electric Cyber Neon Green Pill) */}
          <a href="#trending-diploma" className="shimmer-border-wrapper group w-full block">
            <div className="shimmer-beam-gold" />
            <div className="shimmer-button-content w-full px-4 py-3 text-xs xs:text-sm font-black text-amber-950 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] group-hover:opacity-95 flex items-center justify-center gap-2 rounded-2xl shadow-lg border border-amber-400 dark:border-[#00e55b]/60 dark:shadow-[0_10px_30px_rgba(0,229,91,0.45)]">
              <Flame className="w-4 h-4 text-amber-700 dark:text-black animate-bounce shrink-0" />
              <span className="whitespace-nowrap">{settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل'}</span>
              <ArrowLeft className="w-4 h-4 text-amber-950 dark:text-black shrink-0" />
            </div>
          </a>

          {/* Button 2: Digital Notes & Books Marketplace */}
          <Link
            href="/books"
            prefetch={true}
            className="group flex items-center justify-center gap-2 w-full py-3 px-3.5 text-xs xs:text-sm font-black bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/60 transition-all rounded-2xl shadow-md shadow-emerald-500/10 backdrop-blur-md active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">{settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة)'}</span>
          </Link>

          {/* Button 3: Join as Expert Instructor */}
          <Link
            href="/instructors/join?track=expert"
            prefetch={true}
            className="group flex items-center justify-center gap-2 w-full py-3 px-3.5 text-xs xs:text-sm font-black bg-purple-100/90 text-purple-950 border-2 border-purple-400 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-500/60 transition-all rounded-2xl shadow-md shadow-purple-500/10 backdrop-blur-md active:scale-[0.98]"
          >
            <Video className="w-4 h-4 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_EXPERT
                ? settings.HERO_BTN_EXPERT.replace(/14\s*يوماً|14\s*يوم/g, `${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً`)
                : `انضم كـ مدرس أو دكتور (${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً مجاناً • 0% عمولة)`}
            </span>
          </Link>

          {/* Button 4: Join as Student Instructor */}
          <Link
            href="/instructors/join?track=student"
            prefetch={true}
            className="group flex items-center justify-center gap-2 w-full py-3 px-3.5 text-xs xs:text-sm font-black bg-amber-100/90 text-amber-950 border-2 border-amber-400 dark:bg-[#00e55b]/10 dark:text-[#70ff9b] dark:border-[#00e55b]/50 transition-all rounded-2xl shadow-md shadow-amber-500/10 dark:shadow-[#00e55b]/15 backdrop-blur-md active:scale-[0.98]"
          >
            <GraduationCap className="w-4.5 h-4.5 text-amber-700 dark:text-[#00e55b] group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_STUDENT
                ? settings.HERO_BTN_STUDENT.replace(/30\s*يوماً|30\s*يوم/g, `${settings.STUDENT_TRIAL_DAYS || '14'} يوماً`)
                : `اشترك كمحاضر طالب (منحة ${settings.STUDENT_TRIAL_DAYS || '14'} يوماً مجاناً)`}
            </span>
          </Link>
        </div>

      </section>
    </div>
  );
}


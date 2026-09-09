import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  GraduationCap,
  Video,
  FileText,
  Radio,
  Star,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
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
    <section className="hidden md:flex flex-col justify-center items-center h-[100dvh] max-h-[100dvh] pt-24 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden shrink-0 select-none">
      
      {/* 1. Subtle Ambient Atmosphere Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <img
          src="/assets/egyptian-students.jpg"
          alt="أجواء دراسة وتطوير البرمجيات"
          className="w-full h-full object-cover object-center opacity-[0.03] dark:opacity-[0.05] mix-blend-luminosity filter blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/95 dark:from-[#0c0918] dark:via-[#0c0918]/90 dark:to-[#0c0918]" />
        <div className="absolute -top-16 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(0,229,91,0.12),_transparent_65%)] blur-[90px] rounded-full pointer-events-none" />
      </div>

      <div className="max-w-[1440px] mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 xl:gap-14 z-10 px-2 sm:px-4">
        
        {/* =========================================================================
            RIGHT COLUMN (1st in RTL DOM): NATURAL EGYPTIAN STUDENTS SHOWCASE CARD
           ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 relative w-full flex justify-center order-1">
          
          {/* Ambient Glow Flare behind Card */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-[#00e55b]/20 via-emerald-600/10 to-transparent rounded-3xl blur-xl pointer-events-none -z-10" />

          {/* Unified, Self-Contained Master Card: Zero Overlaps, Zero Collisions */}
          <div className="w-full max-w-[460px] rounded-3xl bg-white/95 dark:bg-[#0d0a1c]/95 border border-slate-200/90 dark:border-[#00e55b]/30 shadow-2xl backdrop-blur-2xl overflow-hidden text-right group">
            
            {/* 1. Card Header */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-black/50 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e55b] animate-pulse" />
                <span className="text-xs font-black text-slate-800 dark:text-zinc-200">
                  مجتمع التطوير والتطبيق العملي
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-[#00e55b]/15 text-[10px] font-black text-slate-700 dark:text-[#70ff9b] border border-slate-300/60 dark:border-[#00e55b]/30">
                <span>دفعة 2026</span>
              </div>
            </div>

            {/* 2. Photo: Authentic Natural Egyptian Students Studying in Library */}
            <div className="relative h-[220px] xl:h-[240px] w-full overflow-hidden bg-slate-900">
              <img
                src="/assets/egyptian-students.jpg"
                alt="طلاب الأكاديمية أثناء التطبيق والبرمجة المشتركة"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Discrete Bottom Overlay Badge */}
              <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-white">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00e55b]" />
                  <span>تطبيق ومشاريع برمجية واقعية</span>
                </span>
                <span className="text-[#70ff9b] font-mono font-bold text-[10px]">100% عملي</span>
              </div>
            </div>

            {/* 3. Dedicated Interactive Dock (3 Clear Clickable Buttons with Zero Overlap) */}
            <div className="p-3 bg-slate-50 dark:bg-black/40 border-t border-slate-200/80 dark:border-white/[0.06] grid grid-cols-3 gap-2">
              
              {/* Button 1: Live Broadcast */}
              <Link
                href="/live"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-500/25 text-[11px] font-bold transition-all hover:scale-[1.03] text-center"
                title="أستوديو البث المباشر"
              >
                <div className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span className="font-black">البث الحي</span>
                </div>
                <span className="text-[9px] text-red-600/80 dark:text-red-300/80 font-medium">مباشر 1080p</span>
              </Link>

              {/* Button 2: Instant Chat & Consultation */}
              <Link
                href="/chat"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/25 text-[11px] font-bold transition-all hover:scale-[1.03] text-center"
                title="الاستشارات والمحادثة الفورية"
              >
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="font-black">استشارات</span>
                </div>
                <span className="text-[9px] text-purple-600/80 dark:text-purple-300/80 font-medium">توجيه فوري</span>
              </Link>

              {/* Button 3: Certificate Verification */}
              <Link
                href="/verify"
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-[#00e55b]/10 dark:hover:bg-[#00e55b]/20 text-emerald-800 dark:text-[#70ff9b] border border-emerald-200/80 dark:border-[#00e55b]/30 text-[11px] font-bold transition-all hover:scale-[1.03] text-center"
                title="فحص واعتماد الشهادات"
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00e55b]" />
                  <span className="font-black">الشهادات</span>
                </div>
                <span className="text-[9px] text-emerald-700/80 dark:text-[#70ff9b]/80 font-medium">اعتماد رسمي</span>
              </Link>

            </div>

          </div>

        </div>

        {/* =========================================================================
            LEFT COLUMN (2nd in RTL DOM): TEXT HEADLINES, BADGES, & 4 ACTION BUTTONS
           ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-right space-y-4 lg:space-y-4.5 order-2">
          
          {/* Promotional Dynamic Shimmer Banner */}
          {settings.BANNER_ENABLED !== 'false' && (
            <div className="inline-block max-w-full">
              <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block max-w-full">
                <div className="shimmer-beam-gold" />
                <div className="shimmer-button-content px-5 py-1.5 text-xs lg:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-2.5 flex-nowrap justify-center rounded-full">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#00e55b] animate-pulse" />
                    <span className="text-blue-700 dark:text-[#70ff9b] font-black">{settings.HERO_BADGE || 'جديد 2026'}</span>
                  </div>
                  <div className="h-3.5 w-px bg-slate-300 dark:bg-[#00e55b]/40 shrink-0" />
                  <span className="group-hover:text-blue-700 dark:group-hover:text-[#0df268] transition-colors font-bold text-xs lg:text-sm leading-normal">
                    {settings.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات الهندسية'}
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-600 dark:text-[#00e55b] group-hover:-translate-x-1 transition-transform shrink-0" />
                </div>
              </a>
            </div>
          )}

          {/* Headlines: Clean, Inspiring & Expansive Typography */}
          <div className="space-y-2.5 max-w-2xl text-right">
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[46px] font-extrabold text-slate-950 dark:text-white leading-[1.3] tracking-tight">
              <span className="block">{settings.HERO_TITLE || 'بوابتك الذكية لاحتراف'}</span>
              <span className="block mt-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] bg-clip-text text-transparent leading-[1.3] py-1 drop-shadow-sm">
                {(settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي').replace(/،/g, '').trim()}
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-300 max-w-xl leading-relaxed font-normal pt-0.5">
              {settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`}
            </p>
          </div>

          {/* Student Social Proof Row */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <div className="flex -space-x-2 rtl:space-x-reverse shrink-0">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="طالب بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="طالبة بالأكاديمية" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e55b] animate-pulse" />
                <span className="text-slate-900 dark:text-zinc-100 font-extrabold">+1,540 طالب يدرسون الآن</span>
              </span>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <div className="flex items-center gap-1 text-amber-500 dark:text-[#00e55b]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-black text-slate-900 dark:text-white">4.9/5</span>
                <span className="text-slate-500 dark:text-zinc-400 font-medium">(تقييم خريجي المنصة)</span>
              </div>
            </div>
          </div>

          {/* 4 Premium Action Pillars Lowered with High-End Hierarchy */}
          <div className="space-y-3 pt-2 w-full">
            {/* Row 1: Primary Bestselling Diploma & Digital Notes Marketplace */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 1. Diploma Button (Electric Cyber Neon Green Pill) */}
              <a href="#trending-diploma" className="shimmer-border-wrapper group shrink-0">
                <div className="shimmer-beam-gold" />
                <div className="shimmer-button-content px-6 py-3 text-xs lg:text-sm font-black text-amber-950 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] flex items-center justify-center gap-2.5 rounded-full shadow-xl border border-amber-400 dark:border-[#00e55b]/60 dark:shadow-[0_10px_35px_rgba(0,229,91,0.45)] group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4 text-amber-700 dark:text-black animate-bounce shrink-0" />
                  <span className="whitespace-nowrap">{settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل (خصم 51%)'}</span>
                  <ArrowLeft className="w-4 h-4 text-amber-950 dark:text-black group-hover:-translate-x-1.5 transition-transform shrink-0" />
                </div>
              </a>

              {/* 2. Digital Notes & Books Marketplace */}
              <Link
                href="/books"
                prefetch={true}
                className="group flex items-center justify-center gap-2 px-5 py-3 text-xs lg:text-sm font-bold bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/90 transition-all rounded-full shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 backdrop-blur-md shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="whitespace-nowrap">{settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة)'}</span>
              </Link>
            </div>

            {/* Row 2: Expert & Student Instructors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 3. Expert Instructor Button */}
              <Link
                href="/instructors/join?track=expert"
                prefetch={true}
                className="group flex items-center justify-center gap-2 px-5 py-3 text-xs lg:text-sm font-bold bg-purple-100/90 text-purple-950 border-2 border-purple-400 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-500/60 hover:bg-purple-200 dark:hover:bg-purple-900/90 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
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
                className="group flex items-center justify-center gap-2 px-5 py-3 text-xs lg:text-sm font-bold bg-amber-100/90 text-amber-950 border-2 border-amber-400 dark:bg-[#00e55b]/10 dark:text-[#70ff9b] dark:border-[#00e55b]/50 hover:bg-amber-200 dark:hover:bg-[#00e55b]/20 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
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

        </div>

      </div>
    </section>
  );
}

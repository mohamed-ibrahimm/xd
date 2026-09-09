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
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface DesktopHeroProps {
  settings: Record<string, string>;
  cleanPlatformName: string;
  trendingDiploma: any;
  whatsappUrl: string | null;
  contactEmail: string | null;
  facebookUrl: string | null;
  telegramUrl: string | null;
  youtubeUrl: string | null;
  linkedinUrl: string | null;
  hasAnySocial: boolean;
}

export default function DesktopHero({
  settings,
  cleanPlatformName,
}: DesktopHeroProps) {
  return (
    <section className="hidden md:flex flex-col justify-center items-center min-h-[calc(100vh-3rem)] pt-24 sm:pt-28 lg:pt-32 pb-16 lg:pb-24 relative overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 w-full my-auto">
        
        {/* =========================================================================
            MODERN 2-COLUMN ASYMMETRIC SPLIT HERO GRID (RTL First: Right Content, Left Virtual Stage)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* =======================================================================
              RIGHT COLUMN: TYPOGRAPHY, STUDENT TRUST PROOF & ACTION MATRIX
             ======================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-right">
            
            {/* Top Promotional Shimmer Announcement */}
            {settings.BANNER_ENABLED !== 'false' && (
              <div className="inline-block max-w-full">
                <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block max-w-full">
                  <div className="shimmer-beam-gold" />
                  <div className="shimmer-button-content px-5 py-2 text-xs lg:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-2.5 flex-nowrap justify-start">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#00e55b] animate-pulse" />
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

            {/* Headline with authoritative, high-energy presence */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[54px] font-black text-slate-950 dark:text-white leading-[1.2] tracking-tight">
                {settings.HERO_TITLE || 'بوابتك الذكية لاحتراف'}
                <span className="block mt-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#00e55b] dark:via-[#10f068] dark:to-[#00b846] bg-clip-text text-transparent">
                  {settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي'}
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed font-medium pt-1">
                {settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`}
              </p>
            </div>

            {/* Student Social Proof & Learning Ambition Row */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex -space-x-2.5 rtl:space-x-reverse shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="طالب بالأكاديمية" className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="طالب بالأكاديمية" className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="طالب بالأكاديمية" className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" alt="طالبة بالأكاديمية" className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0c0918] object-cover shadow-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e55b] animate-pulse" />
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
            <div className="space-y-3 pt-3">
              {/* Row 1: Primary Bestselling Diploma & Digital Notes Marketplace */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Diploma Button (Electric Cyber Neon Green Pill) */}
                <a href="#trending-diploma" className="shimmer-border-wrapper group shrink-0">
                  <div className="shimmer-beam-gold" />
                  <div className="shimmer-button-content px-6 py-3.5 text-xs lg:text-sm font-black text-amber-950 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] flex items-center justify-center gap-2.5 rounded-full shadow-xl border border-amber-400 dark:border-[#00e55b]/60 dark:shadow-[0_10px_35px_rgba(0,229,91,0.45)] group-hover:scale-105 transition-transform">
                    <Flame className="w-4 h-4 text-amber-700 dark:text-black animate-bounce shrink-0" />
                    <span className="whitespace-nowrap">{settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل (خصم 51%)'}</span>
                    <ArrowLeft className="w-4 h-4 text-amber-950 dark:text-black group-hover:-translate-x-1.5 transition-transform shrink-0" />
                  </div>
                </a>

                {/* 2. Digital Notes & Books Marketplace */}
                <Link
                  href="/books"
                  prefetch={true}
                  className="group flex items-center justify-center gap-2 px-5 py-3.5 text-xs lg:text-sm font-black bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 transition-all rounded-full shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 backdrop-blur-md shrink-0"
                >
                  <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">{settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة)'}</span>
                </Link>
              </div>

              {/* Row 2: Expert Instructor & Student Instructor Opportunities */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 3. Expert Instructor Button */}
                <Link
                  href="/instructors/join?track=expert"
                  prefetch={true}
                  className="group flex items-center justify-center gap-2 px-5 py-2.5 text-xs lg:text-sm font-black bg-purple-100/90 text-purple-950 border-2 border-purple-400 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-500/50 hover:bg-purple-200 dark:hover:bg-purple-900/80 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
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
                  className="group flex items-center justify-center gap-2 px-5 py-2.5 text-xs lg:text-sm font-black bg-amber-100/90 text-amber-950 border-2 border-amber-400 dark:bg-[#00e55b]/10 dark:text-[#70ff9b] dark:border-[#00e55b]/50 hover:bg-amber-200 dark:hover:bg-[#00e55b]/20 transition-all rounded-full shadow-md hover:scale-105 backdrop-blur-md shrink-0"
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

          {/* =======================================================================
              LEFT COLUMN: VIRTUAL CLASSROOM & ACTIVE STUDENT AMBITION STAGE
             ======================================================================= */}
          <div className="lg:col-span-5 relative w-full pt-8 lg:pt-0">
            
            {/* Ambient Background Flare */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#00e55b]/20 via-purple-600/15 to-blue-600/20 rounded-3xl blur-2xl pointer-events-none -z-10" />

            {/* 1. Top Floating Card: Real Student Success & Employment Badge */}
            <div className="absolute -top-6 -right-3 sm:-right-6 z-20 animate-float-slow bg-white/95 dark:bg-[#0d0a1c]/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-[#00e55b]/40 shadow-xl dark:shadow-[0_12px_35px_rgba(0,229,91,0.25)] flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
                  alt="طالب متفوق بالمنصة"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-[#00e55b]/50"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00e55b] border-2 border-white dark:border-[#0c0918] flex items-center justify-center text-[8px] text-black font-black">
                  ✓
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">م / أحمد فتحي</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00e55b]/15 text-[#70ff9b] font-bold">خريج معتمد</span>
                </div>
                <p className="text-[11px] text-[#00e55b] font-bold leading-tight mt-0.5">
                  تم التوظيف في كبرى الشركات التقنية
                </p>
              </div>
            </div>

            {/* 2. Centerpiece: Virtual Study Studio & Code IDE Window */}
            <div className="rounded-3xl bg-slate-900/95 dark:bg-[#070512]/95 border-2 border-slate-700/60 dark:border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden text-right">
              
              {/* Window Header */}
              <div className="px-4 py-3 bg-slate-800/80 dark:bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-xs" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-xs" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-xs" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 dark:text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-[#00e55b] animate-pulse" />
                  <span className="font-mono text-[11px]">Next.js 15 & AI Systems • أستوديو التطبيق العملي</span>
                </div>
                <div className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#00e55b]/20 text-[#70ff9b] border border-[#00e55b]/40">
                  مباشر 1080p
                </div>
              </div>

              {/* Code Snippet */}
              <div className="p-5 font-mono text-xs leading-relaxed space-y-2 text-slate-300 dark:text-zinc-200">
                <p className="text-slate-500 dark:text-zinc-500 text-[11px]">// أكاديمية م / محمد إبراهيم — الدبلومة الشاملة</p>
                <p>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-[#00e55b] font-bold">studentGraduate</span> ={' '}
                  <span className="text-sky-400">await</span> qimam.<span className="text-amber-300">enrollCareerTrack</span>({'{'}
                </p>
                <p className="pr-4 text-zinc-400">
                  specialization:{' '}
                  <span className="text-emerald-400">&quot;Full-Stack & AI Systems&quot;</span>,
                </p>
                <p className="pr-4 text-zinc-400">
                  practicalProjects:{' '}
                  <span className="text-cyan-300">12 مشاريع واقعية</span>,
                </p>
                <p className="pr-4 text-zinc-400">
                  verifiedCertificateQR:{' '}
                  <span className="text-purple-300">true</span>,
                </p>
                <p className="pr-4 text-zinc-400">
                  status:{' '}
                  <span className="text-[#00e55b] font-bold">&quot;امتياز مع مرتبة الشرف&quot;</span>
                </p>
                <p>{'}'});</p>
                <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-[#70ff9b] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e55b]" />
                    <span>تم بناء ونشر أول مشروع إنتاجي واقعي بنجاح</span>
                  </span>
                  <span className="text-slate-400 font-sans font-bold">إتقان 98%</span>
                </div>
              </div>

              {/* Window Footer: Accreditation Verification */}
              <div className="px-5 py-3 bg-slate-800/40 dark:bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#00e55b]" />
                  <span>كود التحقق الرقمي الدولي: <strong className="text-white font-mono">QIMAM-2026</strong></span>
                </div>
                <span className="text-emerald-400 font-bold">شهادة معتمدة</span>
              </div>
            </div>

            {/* 3. Bottom Floating Card: Live Study Room & Active Audio Discussions */}
            <div className="absolute -bottom-6 -left-3 sm:-left-6 z-20 animate-float-slow bg-white/95 dark:bg-[#0d0a1c]/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-purple-500/40 shadow-xl dark:shadow-[0_12px_35px_rgba(168,85,247,0.25)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">غرفة المذاكرة الحية Pro</span>
                  <span className="w-2 h-2 rounded-full bg-[#00e55b] animate-ping" />
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 font-medium mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-[#00e55b] rounded-full animate-bounce" />
                    <span className="w-1 h-4 bg-[#0df268] rounded-full animate-bounce delay-75" />
                    <span className="w-1 h-2 bg-[#70ff9b] rounded-full animate-bounce delay-150" />
                  </div>
                  <span>18 طالب متواجدين في المناقشة الصوتية الآن</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

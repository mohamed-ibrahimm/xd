import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  MessageCircle,
  Headphones,
  Mail,
  Facebook,
  Send,
  Youtube,
  Linkedin,
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
  whatsappUrl,
  contactEmail,
  facebookUrl,
  telegramUrl,
  youtubeUrl,
  linkedinUrl,
  hasAnySocial,
}: DesktopHeroProps) {
  return (
    <section className="hidden md:flex flex-col justify-center items-center min-h-[calc(100vh-2rem)] pt-24 sm:pt-28 lg:pt-32 pb-20 lg:pb-28 relative">
      <div className="max-w-[1500px] mx-auto px-4 lg:px-8 text-center my-auto w-full space-y-6 lg:space-y-8">
        
        {/* Promotional Dynamic Rotating Shimmer Banner */}
        {settings.BANNER_ENABLED !== 'false' && (
          <div className="inline-block max-w-full px-2">
            <a href="#trending-diploma" className="shimmer-border-wrapper group inline-block max-w-full">
              <div className="shimmer-beam-gold" />
              <div className="shimmer-button-content px-6 py-2.5 text-xs lg:text-sm text-slate-800 dark:text-zinc-200 flex items-center gap-3 flex-nowrap justify-center">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#00e55b] animate-pulse" />
                  <span className="text-blue-700 dark:text-[#70ff9b] font-black">{settings.HERO_BADGE || 'جديد!'}</span>
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

        {/* Headlines with expansive scale and magnificent presence */}
        <div className="space-y-4 max-w-6xl mx-auto px-2">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] font-black text-slate-950 dark:text-white leading-[1.22] tracking-tight">
            {settings.HERO_TITLE || 'بوابتك الذكية لاحتراف'} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-[#00e55b] dark:via-[#10f068] dark:to-[#00b846] bg-clip-text text-transparent">
              {settings.HERO_TITLE_HIGHLIGHT || 'البرمجة وهندسة النظم والذكاء الاصطناعي'}
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-200 max-w-4xl mx-auto leading-relaxed font-medium pt-2">
            {settings.HERO_SUBTITLE || `${cleanPlatformName} — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.`}
          </p>
        </div>

        {/* 4 Premium Action Pillars on a Single Unified Horizontal Row */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-3 lg:gap-4 w-full mx-auto px-1 max-w-[1480px] pt-2">
          
          {/* 1. Diploma Button (Electric Cyber Neon Green Pill) */}
          <a href="#trending-diploma" className="shimmer-border-wrapper group shrink-0">
            <div className="shimmer-beam-gold" />
            <div className="shimmer-button-content px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-[13.5px] font-black text-amber-950 dark:text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] group-hover:opacity-95 flex items-center justify-center gap-2 rounded-full shadow-lg border border-amber-400 dark:border-[#00e55b]/60 dark:shadow-[0_10px_30px_rgba(0,229,91,0.45)]">
              <Flame className="w-4 h-4 text-amber-700 dark:text-black animate-bounce shrink-0" />
              <span className="whitespace-nowrap">{settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً (خصم 51%)'}</span>
            </div>
          </a>

          {/* 2. Digital Notes & Books Marketplace (Emerald Glow) */}
          <Link
            href="/books"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-[13.5px] font-black bg-emerald-100/90 text-emerald-950 border-2 border-emerald-400 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/90 transition-all rounded-full shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 backdrop-blur-md shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">{settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة)'}</span>
          </Link>

          {/* 3. Expert Instructor Button (Royal Purple Glow) */}
          <Link
            href="/instructors/join?track=expert"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-[13.5px] font-black bg-purple-100/90 text-purple-950 border-2 border-purple-400 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-500/60 hover:bg-purple-200 dark:hover:bg-purple-900/90 transition-all rounded-full shadow-md shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-105 backdrop-blur-md shrink-0"
          >
            <Video className="w-4 h-4 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_EXPERT
                ? settings.HERO_BTN_EXPERT.replace(/14\s*يوماً|14\s*يوم/g, `${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً`)
                : `انضم كـ مدرس أو دكتور (${settings.INSTRUCTOR_TRIAL_DAYS || '14'} يوماً مجاناً • 0% عمولة)`}
            </span>
          </Link>

          {/* 4. Student Instructor Button (Electric Cyber Green Glow) */}
          <Link
            href="/instructors/join?track=student"
            prefetch={true}
            className="group flex items-center justify-center gap-2 px-5 lg:px-6 py-3 lg:py-3.5 text-xs lg:text-[13.5px] font-black bg-amber-100/90 text-amber-950 border-2 border-amber-400 dark:bg-[#00e55b]/10 dark:text-[#70ff9b] dark:border-[#00e55b]/50 hover:bg-amber-200 dark:hover:bg-[#00e55b]/20 transition-all rounded-full shadow-md shadow-amber-500/10 dark:shadow-[#00e55b]/15 hover:scale-105 backdrop-blur-md shrink-0"
          >
            <GraduationCap className="w-4.5 h-4.5 text-amber-700 dark:text-[#00e55b] group-hover:scale-110 transition-transform shrink-0" />
            <span className="whitespace-nowrap">
              {settings.HERO_BTN_STUDENT
                ? settings.HERO_BTN_STUDENT.replace(/30\s*يوماً|30\s*يوم/g, `${settings.STUDENT_TRIAL_DAYS || '14'} يوماً`)
                : `اشترك كمحاضر طالب (منحة ${settings.STUDENT_TRIAL_DAYS || '14'} يوماً مجاناً)`}
            </span>
          </Link>

        </div>

        {hasAnySocial && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-12 pb-4">
            <span className="text-base text-slate-700 dark:text-zinc-300 font-black ml-2">تواصل مباشر وسريع:</span>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="محادثة واتساب مباشرة"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>واتساب الأكاديمية</span>
              </a>
            )}
            <Link
              href="/support"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-[#00e55b]/15 dark:hover:bg-[#00e55b]/25 text-amber-800 dark:text-[#70ff9b] border-2 border-amber-300 dark:border-[#00e55b]/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
              title="الدعم الفني والمساعدة"
            >
              <Headphones className="w-5 h-5 text-amber-600 dark:text-[#00e55b]" />
              <span>الدعم الفني</span>
            </Link>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 text-blue-800 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="راسلنا عبر البريد"
              >
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>جيميل</span>
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 text-indigo-800 dark:text-blue-200 border-2 border-indigo-300 dark:border-blue-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="صفحة الفيسبوك الرسمية"
              >
                <Facebook className="w-5 h-5 text-indigo-600 dark:text-blue-400" />
                <span>فيسبوك</span>
              </a>
            )}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/20 dark:hover:bg-sky-500/30 text-sky-800 dark:text-sky-200 border-2 border-sky-300 dark:border-sky-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="قناة التيليجرام"
              >
                <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>تيليجرام</span>
              </a>
            )}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-800 dark:text-red-200 border-2 border-red-300 dark:border-red-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="قناة اليوتيوب"
              >
                <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>يوتيوب</span>
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-blue-800 dark:text-indigo-200 border-2 border-blue-300 dark:border-indigo-500/50 text-sm lg:text-base font-black transition-all hover:scale-105 shadow-md"
                title="حساب لينكد إن"
              >
                <Linkedin className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
                <span>لينكد إن</span>
              </a>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

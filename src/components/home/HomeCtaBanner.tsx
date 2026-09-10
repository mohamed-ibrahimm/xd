import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
} from 'lucide-react';

interface HomeCtaBannerProps {
  platformName?: string;
}

export default function HomeCtaBanner({
  platformName = 'أكاديمية م / محمد إبراهيم',
}: HomeCtaBannerProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16 sm:my-24">
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-[#111113] to-[#0A0A0C] dark:from-[#0A0A0C] dark:via-[#111113] dark:to-[#050505] text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-slate-200/80 dark:border-[rgba(233,79,159,0.20)] backdrop-blur-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500/15 dark:bg-[rgba(233,79,159,0.14)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/15 dark:bg-[rgba(244,123,183,0.10)] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-right">
          
          {/* Visual Elements (Books & Graduation Icon) */}
          <div className="flex items-center gap-4 order-2 lg:order-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 dark:bg-white/[0.04] backdrop-blur-md border border-white/15 dark:border-white/10 flex items-center justify-center text-[#D83F8F] dark:text-[#E94F9F] shadow-xl">
              <Laptop className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-pink-500/20 dark:bg-[rgba(233,79,159,0.12)] backdrop-blur-md border border-pink-500/30 dark:border-[rgba(233,79,159,0.25)] flex items-center justify-center text-[#E94F9F] shadow-lg -mr-3 sm:-mr-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>

          {/* Central Content */}
          <div className="space-y-3 max-w-2xl order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 dark:bg-[rgba(233,79,159,0.10)] backdrop-blur-sm border border-white/15 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
              <span>انطلاقة جديدة نحو سوق العمل</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug">
              <span>جاهز لبدء </span>
              <span className="text-[#F47BB7] dark:text-[#E94F9F]">رحلتك البرمجية والاحترافية؟</span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 dark:text-[#C5C5C8] font-medium leading-relaxed max-w-xl mx-auto lg:mr-0">
              انضم إلى آلاف الطلاب الذين انطلقوا من {platformName} نحو التميز البرمجي والوظيفي بثقة واحتراف اليوم.
            </p>
          </div>

          {/* CTA Button */}
          <div className="order-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-[#080808] font-black text-xs sm:text-sm transition-all shadow-xl dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] hover:scale-105 active:scale-95 whitespace-nowrap border border-pink-600/30 dark:border-[rgba(233,79,159,0.40)]"
            >
              <span>ابدأ الآن مجاناً</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

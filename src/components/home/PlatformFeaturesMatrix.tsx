'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Video,
  BadgePercent,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface PlatformFeaturesMatrixProps {
  platformName?: string;
  whatsappUrl?: string | null;
}

export default function PlatformFeaturesMatrix({
  platformName = 'أكاديمية م / محمد إبراهيم',
  whatsappUrl,
}: PlatformFeaturesMatrixProps) {
  // 4 Focused, High-Impact Cards (Concise, Legible, Eye-Friendly)
  const coreFeatures = [
    {
      id: 'live-studio',
      title: 'أستوديو البث المباشر التفاعلي',
      description: 'شرح حي مباشر مع الطلاب بدقة 1080p، مشاركة الشاشة، كويزات حية أثناء البث، وتسجيل سحابي تلقائي للمحاضرات.',
      icon: Video,
      badge: 'بث مباشر 1080p',
      tag: 'مشاركة شاشة وكويزات لحظية',
      gradient: 'from-[#D83F8F] via-[#E94F9F] to-[#FF5CAD]',
    },
    {
      id: 'zero-commission',
      title: 'أعلى عائد مالي و 0% عمولة',
      description: 'ابدأ مجاناً لمدة 14 يوماً بدون أي اقتطاع! سحب أرباح فوري عند الطلب عبر InstaPay والمحافظ الإلكترونية دون أي رسوم خفية.',
      icon: BadgePercent,
      badge: '14 يوماً مجاناً',
      tag: 'سحب فوري بدون تأخير',
      gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    },
    {
      id: 'drm-protection',
      title: 'حماية رقمية متقدمة ضد التسريب (DRM)',
      description: 'علامة مائية ذكية متحركة تطبع اسم ورقم هاتف الطالب على الشاشة لمنع تصوير الفيديوهات أو سرقة ملفات الـ PDF.',
      icon: ShieldCheck,
      badge: 'تشفير DRM متكامل',
      tag: 'أمان وحماية بنسبة 100%',
      gradient: 'from-[#B83278] via-[#E94F9F] to-[#F47BB7]',
    },
    {
      id: 'student-grant',
      title: 'سوق المذكرات ومنحة الطلاب المتفوقين',
      description: 'نشر وبيع المذكرات والكتب الرقمية مع ميزة المعاينة المجانية، مع دعم ورعاية للطلبة المتفوقين للتدريس وتحقيق دخل مستقل.',
      icon: GraduationCap,
      badge: 'منحة ورعاية للطلاب',
      tag: 'مبيعات ودخل مستمر',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
    },
  ];

  return (
    <section id="features-matrix" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative overflow-hidden">
      
      {/* Ambient Radial Soft Glow (Desktop only) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,_rgba(233,79,159,0.05),_transparent_70%)] blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-12 sm:space-y-14">
        
        {/* =====================================================================
            1. SECTION HEADER: CONCISE & IMPACTFUL
           ===================================================================== */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
            <span>مميزات منظومة {platformName}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-[#FAFAFA] tracking-tight leading-tight">
            لماذا يختار المحاضرون والطلاب منصتنا؟
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C5C5C8] leading-relaxed font-medium">
            بيئة تعليمية متكاملة تجمع بين أقوى تقنيات البث المباشر، حماية المحتوى من السرقة، وسرعة سحب الأرباح.
          </p>
        </div>

        {/* =====================================================================
            2. EXACTLY 4 CLEAN, CLASSIC CARDS (2x2 GRID)
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {coreFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] hover:border-pink-300 dark:hover:border-[#E94F9F]/50 shadow-md hover:shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Accent Gradient Line */}
                <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${feat.gradient}`} />

                <div className="space-y-4">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} p-0.5 shadow-sm group-hover:scale-105 transition-transform`}>
                      <div className="w-full h-full bg-slate-900 dark:bg-[#050505] rounded-[14px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white dark:text-[#E94F9F]" />
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-pink-50 text-[#D83F8F] border border-pink-200/80 dark:bg-[rgba(233,79,159,0.12)] dark:text-[#E94F9F] dark:border-[rgba(233,79,159,0.25)] shadow-xs">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Concise Description */}
                  <div className="space-y-2 text-start pt-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#FAFAFA] group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C5C5C8] leading-relaxed font-normal">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight Feature Tag */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#D83F8F] dark:text-[#E94F9F]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
                    <span>{feat.tag}</span>
                  </span>
                  <ArrowLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================================
            3. CLEAN & ELEGANT CREATOR INVITATION BANNER
           ===================================================================== */}
        <div className="rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-[rgba(233,79,159,0.25)] bg-gradient-to-br from-white via-pink-50/30 to-purple-50/20 dark:from-[#111113] dark:via-[#0E0E10] dark:to-[#050505] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-start">
          
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-bold border border-pink-200 dark:border-[rgba(233,79,159,0.25)]">
              <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-[#E94F9F]" />
              <span>14 يوماً مجاناً • 0% عمولة على المبيعات</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              هل أنت محاضر أو طالب متفوق ترغب بنشر شروحاتك؟
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C5C5C8] leading-relaxed">
              ابدأ الآن بنشر كورساتك ومذكراتك مع حماية كاملة ضد التسريب وسحب أرباح فوري عبر إنستاباي.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/instructors/join?track=expert"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-[#080808] font-black text-xs sm:text-sm shadow-md transition-all text-center flex items-center justify-center gap-2 hover:scale-105"
            >
              <Video className="w-4 h-4 text-white dark:text-[#080808]" />
              <span>انضم كـ مدرس أو دكتور</span>
            </Link>

            <Link
              href="/instructors/join?track=student"
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-[#FAFAFA] font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/10 transition-all text-center flex items-center justify-center gap-2 hover:scale-105"
            >
              <GraduationCap className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
              <span>منحة المحاضر الطالب</span>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}



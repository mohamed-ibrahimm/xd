'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Laptop,
  PlaySquare,
  BookOpen,
  Award,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Flame,
  Star,
  GraduationCap,
  FileText,
  BadgePercent,
  Lock,
  Wallet,
  DollarSign,
  Crown,
  Eye,
  BarChart3,
  Send,
  Video,
  ShieldAlert,
} from 'lucide-react';

interface PlatformFeaturesMatrixProps {
  platformName?: string;
  whatsappUrl?: string | null;
}

export default function PlatformFeaturesMatrix({
  platformName = 'أكاديمية م / محمد إبراهيم',
  whatsappUrl,
}: PlatformFeaturesMatrixProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'INSTRUCTORS' | 'AUTHORS' | 'STUDENT_INSTRUCTORS'>('ALL');

  // Value Proposition Pillars tailored for Instructors & Authors
  const coreFeatures = [
    {
      id: 'live-streaming-studio',
      category: 'INSTRUCTORS',
      title: 'أستوديو البث المباشر التفاعلي ومشاركة الشاشة (Live Studio Pro)',
      description: 'اشرح مباشرة لطلابك مثل Google Meet و Zoom؛ مشاركة شاشة فائقة الدقة 1080p، كاميرا ومايك، إطلاق كويزات ومسابقات حية أثناء البث، وتسجيل سحابي تلقائي.',
      icon: Video,
      accentColor: 'from-amber-400 via-rose-500 to-purple-600',
      badge: 'أستوديو البث المباشر VIP',
      badgeClass: 'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40',
      bgGlow: 'hover:shadow-rose-500/25',
      borderGlow: 'hover:border-rose-500/60',
      tag: 'مشاركة شاشة وكويزات حية',
    },
    {
      id: 'zero-commission',
      category: 'INSTRUCTORS',
      title: '0% عمولة وأعلى عائد مالي يصل إلى 90%',
      description: 'ابدأ مجاناً لمدة 14 يوماً بدون أي عمولة مقتطعة! احتفظ بكامل أرباح مبيعات كورساتك ومذكراتك دون أي رسوم خفية أو تكاليف استضافة.',
      icon: BadgePercent,
      accentColor: 'from-amber-400 via-yellow-400 to-amber-500',
      badge: '0% عمولة - 14 يوماً مجاناً',
      badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40',
      bgGlow: 'hover:shadow-amber-500/25',
      borderGlow: 'hover:border-amber-500/60',
      tag: 'عائد ربحي استثنائي',
    },
    {
      id: 'drm-protection',
      category: 'AUTHORS',
      title: 'حماية المذكرات والفيديوهات ضد التسريب والسرقة',
      description: 'نظام تشفير رقمي متقدم (DRM) وعلامة مائية ذكية تطبع اسم ورقم هاتف الطالب المتحرك على الشاشة لمنع تصوير الشاشة أو سرقة ملفات الـ PDF.',
      icon: ShieldCheck,
      accentColor: 'from-emerald-400 via-teal-400 to-cyan-500',
      badge: 'تشفير وحماية DRM كاملة',
      badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
      bgGlow: 'hover:shadow-emerald-500/25',
      borderGlow: 'hover:border-emerald-500/60',
      tag: 'أمان رقمي 100%',
    },
    {
      id: 'instant-payouts',
      category: 'INSTRUCTORS',
      title: 'سحب أرباح فوري عبر إنستاباي وفودافون كاش',
      description: 'لا مزيد من الانتظار لشهور أو التعقيدات البنكية الدولية؛ ارباحك تطلب سحبها في أي وقت وتصلك فوراً عبر InstaPay أو المحافظ الإلكترونية.',
      icon: Wallet,
      accentColor: 'from-blue-400 via-indigo-400 to-cyan-400',
      badge: 'تحويل فوري ولحظي',
      badgeClass: 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40',
      bgGlow: 'hover:shadow-blue-500/25',
      borderGlow: 'hover:border-blue-500/60',
      tag: 'سيولة نقدية مباشرة',
    },
    {
      id: 'ai-assistant-support',
      category: 'INSTRUCTORS',
      title: 'مساعد ذكي AI يصحح ويجيب عن استفسارات الطلاب',
      description: 'تخلص من إرهاق الرد على مئات الأسئلة المتكررة يومياً؛ مساعد الذكاء الاصطناعي مدمج داخل كورسك ليشرح الأكواد ويحل مشاكل الطلاب 24/7.',
      icon: Bot,
      accentColor: 'from-purple-400 via-fuchsia-400 to-violet-500',
      badge: 'مساعد ذكي للمحاضر',
      badgeClass: 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/40',
      bgGlow: 'hover:shadow-purple-500/25',
      borderGlow: 'hover:border-purple-500/60',
      tag: 'توفير وقت المحاضر',
    },
    {
      id: 'notes-marketplace-sales',
      category: 'AUTHORS',
      title: 'سوق مذكرات رقمي مع ميزة المعاينة المجانية',
      description: 'ارفع ملخصاتك، كتبك، وبنوك الأسئلة؛ يتيح النظام للطلاب قراءة أول صفحات مجاناً لتشجيعهم على الشراء الفوري وتحقيق دخل سلبي مستمر.',
      icon: BookOpen,
      accentColor: 'from-rose-400 via-orange-400 to-amber-400',
      badge: 'دخل سلبي (Passive Income)',
      badgeClass: 'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40',
      bgGlow: 'hover:shadow-rose-500/25',
      borderGlow: 'hover:border-rose-500/60',
      tag: 'مبيعات تلقائية مستمرة',
    },
    {
      id: 'student-instructor-grant',
      category: 'STUDENT_INSTRUCTORS',
      title: 'منحة المحاضر الطالب لدعم المتفوقين في الجامعات',
      description: 'هل أنت طالب متفوق أو معيد شاب؟ نوفر لك منصة متكاملة لنشر شروحاتك ومذكراتك لزملائك مع دعم تقني واستضافة مجانية لبناء اسمك المهني.',
      icon: GraduationCap,
      accentColor: 'from-amber-400 via-orange-400 to-yellow-500',
      badge: 'منحة مجانية للطلاب',
      badgeClass: 'bg-yellow-100 text-yellow-950 border-yellow-300 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/40',
      bgGlow: 'hover:shadow-amber-500/25',
      borderGlow: 'hover:border-amber-500/60',
      tag: 'فرصة للمتفوقين',
    },
  ];

  // Creator & Publisher Focused Comparison Table
  const comparisonRows = [
    {
      feature: 'البث المباشر ومشاركة الشاشة والكويزات الحية',
      description: 'هل يمكنك الشرح المباشر ومشاركة الشاشة وإجراء مسابقات لحظية؟',
      us: 'أستوديو بث كامل مدمج (Screen Share + مسابقات Kahoot + تسجيل سحابي)',
      others: 'غير متوفر؛ الاعتماد على روابط خارجية غير محمية وسهلة التسريب',
    },
    {
      feature: 'نسبة العمولة والأرباح الصافية',
      description: 'كم يتبقى للمحاضر والمؤلف من سعر الكورس أو المذكرة؟',
      us: '0% عمولة أول 14 يوم + أرباح تصل إلى 85% - 90%',
      others: 'اقتطاع ضخم 50% إلى 70% من أرباحك + رسوم سناتر',
    },
    {
      feature: 'حماية المذكرات والكتب الرقمية من السرقة',
      description: 'حماية ملفات الـ PDF والملخصات من المشاركة والتحميل المجاني',
      us: 'تشفير DRM كامل + معاينة ذكية بدون إمكانية سرقة الملف',
      others: 'ملفات PDF عادية تُسرب في مجموعات التيليجرام فوراً',
    },
    {
      feature: 'حماية الفيديوهات من تصوير الشاشة والتسريب',
      description: 'منع سرقة المحتوى التدريبي وإعادة بيعه',
      us: 'علامة مائية ديناميكية برقم هاتف واسم الطالب المتحرك',
      others: 'فيديوهات سهلة التسجيل والتحميل ببرامج التنزيل',
    },
    {
      feature: 'سرعة وطرق سحب واستلام الأرباح',
      description: 'كيف ومتى تستلم أموال مبيعاتك؟',
      us: 'سحب فوري عند الطلب عبر InstaPay وفودافون كاش والمحافظ',
      others: 'شروط تعجيزية وتأخير 30-60 يوماً وحسابات بنكية دولية',
    },
    {
      feature: 'المساعد الذكي للرد على أسئلة الطلاب (AI Tutor)',
      description: 'تخفيف عبء المتابعة وتصحيح أكواد واستفسارات الطلاب',
      us: 'مساعد ذكاء اصطناعي مدمج يعمل 24/7 داخل كل درس',
      others: 'غير متوفر نهائياً؛ إرهاق المحاضر بالرد اليدوي على آلاف الرسائل',
    },
    {
      feature: 'لوحة تحكم تفصيلية وإحصائيات المبيعات',
      description: 'متابعة لحظية لأعداد المشتركين ونسب الإكمال والمبيعات',
      us: 'لوحة تحكم متطورة تشمل تقارير مالية وتنبيهات مبيعات فورية',
      others: 'تقارير بدائية وغامضة دون تفاصيل المشتركين الحقيقية',
    },
    {
      feature: 'إصدار شهادات التخرج المعتمدة برمز QR دولي',
      description: 'توثيق رسمي يرفع من مصداقية كورساتك ويجذب الطلاب',
      us: 'إصدار تلقائي للشهادات المشفرة برمز QR باسم المحاضر',
      others: 'شهادات يدوية أو غير قابلة للتحقق الرقمي',
    },
  ];

  const filteredFeatures = activeTab === 'ALL'
    ? coreFeatures
    : coreFeatures.filter((f) => f.category === activeTab);

  return (
    <section id="features-matrix" className="px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative overflow-hidden">
      
      {/* Dynamic Ambient Radiant Flares */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse,_rgba(245,158,11,0.15),_rgba(124,58,237,0.1)_50%,_transparent_75%)] dark:bg-[radial-gradient(ellipse,_rgba(0,229,91,0.12),_rgba(124,58,237,0.08)_50%,_transparent_75%)] blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(16,185,129,0.12),_transparent_70%)] blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* =====================================================================
            1. SECTION HEADER (High Impact Creator Proposition)
           ===================================================================== */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border border-amber-500/40 dark:border-[#00e55b]/40 text-amber-800 dark:text-[#70ff9b] text-xs sm:text-sm font-black shadow-lg shadow-amber-500/10 dark:shadow-[#00e55b]/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#00e55b] animate-pulse" />
            <span>منظومة تمكين المحاضرين وصناع المحتوى ومؤلفي المذكرات 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
            لماذا تنشر دوراتك ومذكراتك عبر{' '}
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-[#00e55b] dark:via-[#10f068] dark:to-[#00b846] bg-clip-text text-transparent">
              {platformName}
            </span>
            ؟
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-bold">
            صممنا المنصة لتمنح المدرسين والدكاترة والمؤلفين والطلاب المتفوقين بيئة احترافية تضمن أعلى عائد مالي، حماية رقمية مانعة للتسريب، وتحويلات مالية فورية عبر إنستاباي وفودافون كاش.
          </p>
        </div>

        {/* =====================================================================
            2. INTERACTIVE TARGET TABS
           ===================================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {[
            { id: 'ALL', label: 'كافة مميزات المنظومة', icon: Sparkles },
            { id: 'INSTRUCTORS', label: 'لمدرسي ودكاترة الكورسات', icon: Video },
            { id: 'AUTHORS', label: 'لناشري المذكرات والكتب', icon: FileText },
            { id: 'STUDENT_INSTRUCTORS', label: 'للطلاب المتفوقين (المحاضر الطالب)', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-xl shadow-amber-500/30 scale-105 border border-amber-400'
                    : 'bg-white/90 dark:bg-zinc-900/80 text-slate-800 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-zinc-800 hover:border-amber-500/60 shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950 dark:text-black' : 'text-amber-500 dark:text-[#00e55b]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            3. LUXURY CREATOR FEATURE CARDS GRID
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className={`group relative rounded-3xl p-7 sm:p-8 bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 shadow-xl shadow-slate-200/60 dark:shadow-black/50 hover:shadow-2xl ${feat.bgGlow} ${feat.borderGlow} flex flex-col justify-between overflow-hidden`}
              >
                {/* Top Accent Gradient Flare */}
                <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r ${feat.accentColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                
                <div className="space-y-4">
                  
                  {/* Top Bar: Icon Container + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.accentColor} p-0.5 shadow-lg group-hover:scale-110 transition-transform`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${feat.badgeClass} shadow-xs`}>
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Detailed Description */}
                  <div className="space-y-2.5 pt-1">
                    <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-[#00e55b] transition-colors leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-semibold">
                      {feat.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight Tag */}
                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-zinc-800/70 flex items-center justify-between text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    <span>{feat.tag}</span>
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#00e55b] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================================
            4. CREATOR & PUBLISHER COMPARISON MATRIX (جدول وبطاقات المقارنة)
           ===================================================================== */}
        <div className="space-y-6 pt-6">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              مقارنة المحاضرين والمؤلفين:{' '}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-[#00e55b] dark:to-[#10f068] bg-clip-text text-transparent">
                الأكاديمية مقابل السناتر والمنصات الأخرى
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-bold">
              شاهد الفارق الحقيقي في الأرباح، حماية المحتوى، وسهولة إدارة الطلاب ومبيعات المذكرات
            </p>
          </div>

          {/* =================================================================
              A. MOBILE VIEW: STACKED COMPARISON CARDS (فائقة الوضوح على الموبايل)
             ================================================================= */}
          <div className="md:hidden space-y-4">
            {comparisonRows.map((row, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-3xl bg-white dark:bg-[#120e24]/90 border border-slate-200/90 dark:border-purple-900/40 shadow-lg space-y-3.5"
              >
                {/* Feature Header */}
                <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 dark:bg-[#00e55b]/20 dark:text-[#00e55b] flex items-center justify-center text-xs font-black">
                      {idx + 1}
                    </span>
                    <h4 className="font-black text-sm text-slate-950 dark:text-zinc-100">
                      {row.feature}
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 mt-1 font-semibold pr-7">
                    {row.description}
                  </p>
                </div>

                {/* Our Platform Highlighted Card */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-[#00e55b]/[0.08] border border-amber-300 dark:border-[#00e55b]/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-800 dark:text-[#00e55b]">
                    <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500 dark:fill-[#00e55b] dark:text-[#00e55b]" />
                    <span>{platformName} (الخيار الأفضل)</span>
                  </div>
                  <div className="flex items-start gap-2 pt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 fill-emerald-500/20" />
                    <span className="text-xs font-black text-slate-950 dark:text-[#70ff9b] leading-snug">
                      {row.us}
                    </span>
                  </div>
                </div>

                {/* Other Platforms Muted Card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/50 space-y-1">
                  <div className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400">
                    السناتر والمنصات الأخرى:
                  </div>
                  <div className="flex items-start gap-2 pt-0.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-semibold leading-snug">
                      {row.others}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* =================================================================
              B. DESKTOP VIEW: LUXURY TABLE (للشاشات الكبيرة والكمبيوتر)
             ================================================================= */}
          <div className="hidden md:block rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-900/80">
                    <th className="py-5 px-6 text-sm font-black text-slate-950 dark:text-zinc-200 w-2/5">
                      المعيار والميزة المالية / التقنية
                    </th>
                    <th className="py-5 px-6 text-sm font-black text-amber-950 dark:text-[#00e55b] w-2/5 bg-amber-500/15 dark:bg-[#00e55b]/10 border-x border-amber-300 dark:border-[#00e55b]/30">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500 dark:text-[#00e55b] fill-amber-400 dark:fill-[#00e55b]" />
                        <span>{platformName}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-sm">
                          الخيار الأربح والأأمن
                        </span>
                      </div>
                    </th>
                    <th className="py-5 px-6 text-sm font-black text-slate-600 dark:text-zinc-400 w-1/5">
                      السناتر والمنصات التقليدية
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60 text-xs sm:text-sm">
                  {comparisonRows.map((row, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Criteria */}
                      <td className="py-4.5 px-6">
                        <div className="font-black text-slate-950 dark:text-zinc-100 text-sm">
                          {row.feature}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-bold">
                          {row.description}
                        </div>
                      </td>

                      {/* Our Platform Cell */}
                      <td className="py-4.5 px-6 bg-amber-500/10 dark:bg-[#00e55b]/[0.06] border-x border-amber-200 dark:border-[#00e55b]/30 font-black text-slate-950 dark:text-[#70ff9b]">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 fill-emerald-500/20" />
                          <span>{row.us}</span>
                        </div>
                      </td>

                      {/* Other Platforms Cell */}
                      <td className="py-4.5 px-6 text-slate-600 dark:text-zinc-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                          <span>{row.others}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* =====================================================================
            5. DUAL CTA: JOIN AS INSTRUCTOR OR PUBLISH NOTES
           ========================================================================= */}
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-amber-500/40 dark:border-[#00e55b]/40 bg-gradient-to-br from-slate-950 via-zinc-950 to-indigo-950 text-white shadow-2xl text-center sm:text-right flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Ambient Glow Corner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/20 dark:bg-[#00e55b]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3.5 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 dark:bg-[#00e55b]/20 dark:border-[#00e55b]/40 text-amber-300 dark:text-[#70ff9b] text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-[#00e55b] animate-bounce" />
              <span>انضم الآن واستفد من 14 يوماً مجاناً و 0% عمولة على المبيعات</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              هل أنت مدرس، دكتور، أو طالب متفوق ترغب بنشر مذكراتك وكورساتك؟
            </h3>
            
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-semibold">
              انضم إلى نخبة المحاضرين والمؤلفين وابدأ بنشر دوراتك وملخصاتك اليوم مع حماية كاملة ضد التسريب، وسحب أرباح لحظي عبر إنستاباي وفودافون كاش.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            
            {/* CTA 1: Expert Instructor */}
            <Link
              href="/instructors/join?track=expert"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] text-zinc-950 dark:text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 dark:shadow-[0_10px_35px_rgba(0,229,91,0.4)] hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4 text-zinc-950 dark:text-black" />
              <span>انضم كـ مدرس أو دكتور (0% عمولة)</span>
              <ArrowLeft className="w-4 h-4 text-zinc-950 dark:text-black" />
            </Link>

            {/* CTA 2: Student Instructor & Notes Seller */}
            <Link
              href="/instructors/join?track=student"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs sm:text-sm border border-zinc-700 hover:border-amber-400 dark:hover:border-[#00e55b] transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-400 dark:text-[#00e55b]" />
              <span>انضم كـ محاضر طالب / ناشر مذكرات</span>
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}


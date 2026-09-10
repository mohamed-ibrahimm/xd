'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Video,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Award,
  Users,
  Clock,
  Percent,
  TrendingUp,
  Smartphone,
  Check,
  Layers,
  GraduationCap,
  Building,
  DollarSign,
  Compass,
  SlidersHorizontal,
  FileCheck,
  Calendar,
  BookOpen,
  ChevronLeft,
  Info,
  FileText,
  Flame,
  Star,
} from 'lucide-react';

export default function InstructorJoinPage() {
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('track');

  const [activeTrack, setActiveTrack] = useState<'all' | 'expert' | 'student'>(
    trackParam === 'student' ? 'student' : trackParam === 'expert' ? 'expert' : 'all'
  );

  useEffect(() => {
    if (trackParam === 'student') setActiveTrack('student');
    else if (trackParam === 'expert') setActiveTrack('expert');
  }, [trackParam]);

  // Dynamic Settings from Admin Panel
  const [platformSettings, setPlatformSettings] = useState({
    monthlyPrice: '290',
    annualPrice: '1499',
    studentPrice: '120',
    studentMaxAge: '22',
    studentTrialDays: '30',
    instructorTrialDays: '14',
    commissionPercent: '0',
    joinPageTitle: '',
    joinPageSubtitle: '',
    expertCardTitle: 'انضم كـ مدرس أو دكتور جامعي',
    expertCardDesc: 'مخصص للأساتذة والمحاضرين الذين يرغبون في بناء استوديو تعليمي سحابي مستقل لدفعاتهم مع سيطرة كاملة على المحتوى والأسعار.',
    studentCardTitle: 'اشترك كـ محاضر طالب',
    studentCardDesc: 'لكل طالب بالكلية أو المدرسة يريد شرح المواد لزملائه؛ نمنحك شهر كامل مجاناً وشارة "طالب معتمد" مع باقة اشتراك مدعومة ومخفضة.',
    studentProofText: 'كارنيه، جدول دراسي، أو إثبات قيد',
  });

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/settings', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (data) {
            const map = data.settings || {};
            setPlatformSettings({
              monthlyPrice: data.instructorPriceMonthly || map.INSTRUCTOR_PRICE_MONTHLY || '290',
              annualPrice: data.instructorPriceAnnual || map.INSTRUCTOR_PRICE_ANNUAL || '1499',
              studentPrice: data.instructorPriceStudent || map.INSTRUCTOR_PRICE_STUDENT || '120',
              studentMaxAge: data.studentMaxAge || map.STUDENT_MAX_AGE || '22',
              studentTrialDays: data.studentTrialDays || map.STUDENT_TRIAL_DAYS || '30',
              instructorTrialDays: data.instructorTrialDays || map.INSTRUCTOR_TRIAL_DAYS || '14',
              commissionPercent: data.platformCommissionPercent || map.PLATFORM_COMMISSION_PERCENT || '0',
              joinPageTitle: map.JOIN_PAGE_TITLE || '',
              joinPageSubtitle: map.JOIN_PAGE_SUBTITLE || '',
              expertCardTitle: map.JOIN_EXPERT_CARD_TITLE || 'انضم كـ مدرس أو دكتور جامعي',
              expertCardDesc: map.JOIN_EXPERT_CARD_DESC || 'مخصص للأساتذة والمحاضرين الذين يرغبون في بناء استوديو تعليمي سحابي مستقل لدفعاتهم مع سيطرة كاملة على المحتوى والأسعار.',
              studentCardTitle: map.JOIN_STUDENT_CARD_TITLE || 'اشترك كـ محاضر طالب',
              studentCardDesc: map.JOIN_STUDENT_CARD_DESC || 'لكل طالب بالكلية أو المدرسة يريد شرح المواد لزملائه؛ نمنحك شهر كامل مجاناً وشارة "طالب معتمد" مع باقة اشتراك مدعومة ومخفضة.',
              studentProofText: map.JOIN_STUDENT_PROOF_TEXT || 'كارنيه، جدول دراسي، أو إثبات قيد',
            });
          }
        })
        .catch(() => {});
    };

    fetchSettings();
    window.addEventListener('platform-settings-updated', fetchSettings);
    return () => window.removeEventListener('platform-settings-updated', fetchSettings);
  }, []);

  // Dynamic Revenue Calculator
  const [studentCount, setStudentCount] = useState(80);
  const [coursePrice, setCoursePrice] = useState(350);

  const totalRevenue = studentCount * coursePrice;
  const traditionalCut = Math.round(totalRevenue * 0.40);
  const netEarnings = totalRevenue;

  const features = [
    {
      number: '01',
      title: `نموذج ${platformSettings.commissionPercent}% عمولة على المبيعات`,
      description: `تحتفظ بكامل عوائد دوراتك التدريبية بنسبة 100%. لا نقتطع أي نسبة مئوية من مبيعاتك نهائياً، فالجهد جهدك والعائد بالكامل لك.`,
      icon: Percent,
      borderCol: 'border-amber-500/30 hover:border-amber-500/60',
      iconCol: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      number: '02',
      title: 'تحصيل فوري ومباشر عبر InstaPay والمحافظ',
      description: 'يقوم الطلاب بتحويل قيمة الكورس مباشرة إلى حسابك الشخصي في إنستاباي أو فودافون كاش دون وسيط، وتتحكم بالقبول بضغطة زر واحدة.',
      icon: Smartphone,
      borderCol: 'border-purple-500/30 hover:border-purple-500/60',
      iconCol: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      number: '03',
      title: 'حماية متطورة بعلامة مائية ديناميكية',
      description: 'نظام حماية يمنع تسجيل الشاشة ويقوم بطباعة بيانات الطالب (الاسم والبريد ورقم الهاتف) كعلامة مائية متحركة ومضيئة لحماية محتواك الفكري.',
      icon: ShieldCheck,
      borderCol: 'border-amber-500/30 hover:border-amber-500/60',
      iconCol: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      number: '04',
      title: 'شهادات إتمام ذكية موثقة برمز QR',
      description: 'إمكانية تفعيل وإصدار شهادات إتمام رقمية معتمدة لكل طالب يجتاز كورسـك، مع كود استعلام وتحقق رقمي فوري يرفع من مصداقية دوراتك.',
      icon: Award,
      borderCol: 'border-indigo-500/30 hover:border-indigo-500/60',
      iconCol: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      number: '05',
      title: 'إدارة كوبونات الخصم والعروض الترويجية',
      description: 'لوحة متكاملة لإنشاء وتوليد أكواد الخصم الترويجية لطلابك، مع تحديد نسب الخصم وعدد مرات الاستخدام وتواريخ الصلاحية لزيادة سرعة الالتحاق.',
      icon: Zap,
      borderCol: 'border-amber-500/30 hover:border-amber-500/60',
      iconCol: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      number: '06',
      title: 'استوديو تدريس سحابي وإحصائيات متقدمة',
      description: 'لوحة تحكم ذكية تتيح لك متابعة تفاعل طلابك، نسب الإكمال، وتقييمات الدروس، مع إمكانية التواصل والرد على استفسارات الطلاب مباشرة.',
      icon: Layers,
      borderCol: 'border-purple-500/30 hover:border-purple-500/60',
      iconCol: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="min-h-screen pt-2 sm:pt-4 pb-14 px-3 sm:px-6 lg:px-8 relative text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-zinc-950 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO & TRACK NAVIGATION (EXACTLY MATCHING DESKTOPHERO ON HOMEPAGE)
         ========================================================================= */}
      <section className="max-w-5xl mx-auto text-center relative w-full overflow-hidden">
        
        {/* Dynamic Rotating Shimmer Badge Switcher */}
        <div className="mb-2.5 inline-block max-w-full px-1">
          <div className="inline-flex p-1 rounded-2xl sm:rounded-full bg-white/90 dark:bg-[#16122d]/90 border border-slate-200 dark:border-purple-800/80 shadow-md backdrop-blur-md gap-1 flex-col sm:flex-row justify-center w-full sm:w-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTrack('all')}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-xl sm:rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTrack === 'all'
                  ? 'bg-slate-900 text-white dark:bg-[#E94F9F] dark:text-[#080808] shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>عرض كل المسارات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTrack('expert')}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-xl sm:rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTrack === 'expert'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-white/10'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>مسار المدرسين والدكاترة ({platformSettings.instructorTrialDays} يوماً مجاناً)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTrack('student')}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-xl sm:rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTrack === 'student'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>مسار المحاضر الطالب ({platformSettings.studentTrialDays} يوماً مجاناً)</span>
            </button>
          </div>
        </div>

        {/* Glowing Soft Ambient Halo without bounding box clipping */}
        <div className="relative px-2">
          <div className="absolute -inset-6 pointer-events-none -z-10 bg-radial-gradient from-purple-600/15 via-amber-500/10 to-transparent blur-3xl" />

          <h1 className="font-black tracking-tight mb-2 max-w-4xl mx-auto">
            <span className="text-slate-900 dark:text-white block font-black text-2xl sm:text-3xl lg:text-[2.6rem] leading-[1.25] mb-2">
              {platformSettings.joinPageTitle ? (
                platformSettings.joinPageTitle
              ) : activeTrack === 'student' ? (
                'اشرح لزملائك وأطلق أول كورس تعليمي باسمك'
              ) : (
                'درّس لطلابك واحتفظ بكامل عوائد مبيعاتك مباشرة'
              )}
            </span>
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 dark:from-amber-300 dark:via-yellow-400 dark:to-amber-500 bg-clip-text text-transparent block font-black text-xl sm:text-2xl lg:text-[1.95rem] leading-snug">
              {activeTrack === 'student' ? (
                `منحة المحاضر الطالب (${platformSettings.studentTrialDays} يوماً مجاناً بالكامل)`
              ) : (
                `نموذج ${platformSettings.commissionPercent}% عمولة — الأرباح 100% لك (${platformSettings.instructorTrialDays} يوماً مجاناً)`
              )}
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-300 max-w-3xl mx-auto mb-5 leading-relaxed px-2">
          {platformSettings.joinPageSubtitle ? (
            platformSettings.joinPageSubtitle
          ) : activeTrack === 'student'
            ? `إذا كنت طالباً بالكلية أو المدرسة وتريد تقديم الشروحات والمناهج لزملائك؛ نوفر لك منحة ${platformSettings.studentTrialDays} يوماً مجاناً بالكامل مع باقة اشتراك مدعومة (${platformSettings.studentPrice} ج.م) بإثبات دراسي بسيط (${platformSettings.studentProofText}) دون الحاجة لبطاقة شخصية.`
            : 'استوديو تدريس سحابي متكامل يمنح المدرسين والدكاترة الجامعيين استقلالية تامة، مع تحويل أرباحك فورياً إلى حسابك الشخصي عبر إنستاباي والمحافظ بدون اقتطاع أي عمولة.'}
        </p>

        {/* =========================================================================
            DUAL TRACK HERO CARDS (EXACT HOMEPAGE MATCHING STYLE - FULL VIEWPORT FIT)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-right max-w-4xl mx-auto">
          
          {/* Card 1: Teachers & University Professors */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
              activeTrack === 'expert' || activeTrack === 'all'
                ? 'bg-white/95 dark:bg-[#16122d]/90 border-purple-300/90 dark:border-purple-800/80 shadow-md hover:shadow-xl backdrop-blur-md ring-1 ring-purple-500/20'
                : 'bg-slate-50/50 dark:bg-[#120e24]/50 border-slate-200 dark:border-zinc-800/70 opacity-70'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30 text-[11px] font-bold inline-flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  للمدرسين والدكاترة الجامعيين
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تفعيل فوري بدون مستندات
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {platformSettings.expertCardTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {platformSettings.expertCardDesc}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-[#1c163b]/80 border border-purple-100 dark:border-purple-900/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>الفترة التجريبية:</span>
                  <span className="text-purple-700 dark:text-purple-300 font-black">{platformSettings.instructorTrialDays} يوماً مجاناً بالكامل</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>عمولة المبيعات:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{platformSettings.commissionPercent}% (الأرباح لك 100%)</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>التحصيل المالي:</span>
                  <span className="text-slate-900 dark:text-white">InstaPay وفودافون كاش مباشرة</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>المستندات المطلوبة:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">لا يُطلب أي مستند (بدء مباشر)</span>
                </div>
              </div>
            </div>

            <Link
              href="/register?role=instructor&track=expert"
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs text-center shadow-md shadow-purple-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>بدء تجربة المدرس أو الدكتور ({platformSettings.instructorTrialDays} يوماً مجاناً)</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Student Instructors (GOLD SHINE VIP) */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between space-y-3 relative overflow-hidden group ${
              activeTrack === 'student' || activeTrack === 'all'
                ? 'bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border-2 border-amber-500/70 hover:border-amber-400 shadow-md hover:shadow-amber-500/20 backdrop-blur-md'
                : 'bg-slate-50/50 dark:bg-[#120e24]/50 border-slate-200 dark:border-zinc-800/70 opacity-70'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 text-[11px] font-black inline-flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  لطلبة الكليات والمدارس
                </span>
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  إثبات دراسي ميسر
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {platformSettings.studentCardTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {platformSettings.studentCardDesc}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/15 dark:bg-[#181222]/90 border border-amber-300 dark:border-amber-500/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>المنحة التجريبية:</span>
                  <span className="text-amber-800 dark:text-amber-400 font-black">{platformSettings.studentTrialDays} يوماً مجاناً بالكامل</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>سعر الباقة بعد التجربة:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{platformSettings.studentPrice} ج.م شهرياً</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>إثبات الدراسة المطلوب:</span>
                  <span className="text-slate-900 dark:text-white">{platformSettings.studentProofText}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span>البطاقة الشخصية:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">لا يُطلب بطاقة شخصية نهائياً</span>
                </div>
              </div>
            </div>

            <Link
              href="/register?role=instructor&track=student"
              className="w-full py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs text-center shadow-md shadow-amber-500/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>اشترك كـ محاضر طالب ({platformSettings.studentTrialDays} يوماً مجاناً)</span>
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-950" />
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. DYNAMIC LIVE REVENUE CALCULATOR
         ========================================================================= */}
      <section className="max-w-4xl mx-auto py-10 sm:py-14">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#16122d]/90 border border-slate-200 dark:border-purple-800/80 shadow-xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">حاسبة العوائد التفاعلية</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              كم ستحقق من أرباح مع نموذج {platformSettings.commissionPercent}% عمولة؟
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              حرك المؤشرات لتكتشف الفارق بين منصتنا والمنصات التقليدية التي تقتطع 30% إلى 50% من أرباحك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-200">
                  <span>عدد الطلاب المتوقع:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{studentCount} طالب</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-200">
                  <span>متوسط سعر الكورس:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{coursePrice} ج.م</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0f0b1e] border border-slate-200 dark:border-amber-500/20 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">صافي أرباحك في منصتنا (100% لك):</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {netEarnings.toLocaleString('ar-EG')} ج.م
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
                  <span>ما تخصمه المنصات الأخرى (40%):</span>
                  <span className="font-mono">-{traditionalCut.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>المبلغ الذي وفرته معنا:</span>
                  <span className="font-mono">+{traditionalCut.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VALUE PROPOSITIONS & CORE SAAS FEATURES
         ========================================================================= */}
      <section className="max-w-6xl mx-auto py-10 sm:py-12 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">المزايا التقنية للاستوديو</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            كل ما تحتاجه للتدريس والربح في منصة واحدة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto">
            بنية تحتية سحابية متقدمة مصممة خصيصاً للمحاضرين والمعلمين والدكاترة لإدارة دوراتهم بسهولة وأمان.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.number}
                className={`p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-[#16122d]/80 border border-slate-200 dark:border-purple-800/60 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md space-y-4 group`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${f.iconCol}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black font-mono text-slate-400 dark:text-zinc-600 group-hover:text-amber-500 transition-colors">
                    {f.number}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  {f.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          4. COMPARISON: OUR PLATFORM VS TRADITIONAL PLATFORMS
         ========================================================================= */}
      <section className="max-w-4xl mx-auto py-10 sm:py-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#16122d]/90 border border-slate-200 dark:border-purple-800/80 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              مقارنة بين منصتنا والمنصات التعليمية الأخرى
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              لماذا يفضل الأساتذة والطلاب التدريس عبر منصتنا السحابية المستقلة؟
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                  <th className="py-3 px-4 font-bold">الميزة</th>
                  <th className="py-3 px-4 font-black text-amber-600 dark:text-amber-400">منصتنا التعليمية</th>
                  <th className="py-3 px-4 font-bold text-slate-400 dark:text-zinc-500">المنصات التقليدية الأخرى</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                <tr>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">نسبة عمولة المبيعات</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">0% (كامل الأرباح لك)</td>
                  <td className="py-3 px-4 text-rose-500">30% إلى 50% من كل عملية بيع</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">استلام الأموال</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">لحظي ومباشر على InstaPay والمحافظ</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">شهرياً مع رسوم تحويل إضافية</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">حماية الفيديوهات</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">علامة مائية ديناميكية ببيانات الطالب</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">حماية تقليدية سهلة التسجيل</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">دعم الطلبة المحاضرين</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">منحة شهر كامل مجاناً وباقة مدعومة</td>
                  <td className="py-3 px-4 text-rose-500">لا يوجد باقات خاصة للطلاب</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">الشهادات المعتمدة</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">شهادات ذكية برمز QR للتحقق</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">شهادات صور غير قابلة للتحقق</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FINAL CALL TO ACTION
         ========================================================================= */}
      <section className="max-w-4xl mx-auto text-center py-10 sm:py-12">
        <div className="p-6 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-amber-500/10 dark:from-amber-500/20 dark:via-purple-600/20 dark:to-amber-500/20 border-2 border-amber-400/40 dark:border-amber-500/40 shadow-xl backdrop-blur-xl space-y-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 shadow-md">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              جاهز لإطلاق أول كورس تعليمي باسمك؟
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 max-w-lg mx-auto leading-relaxed px-2">
              سجل حسابك الآن في أقل من دقيقة وابدأ فترة التجربة المجانية، وشارك خبراتك وعلمك مع آلاف الطلاب.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/register?role=instructor&track=expert"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>تسجيل مدرس أو دكتور ({platformSettings.instructorTrialDays} يوماً مجاناً)</span>
            </Link>

            <Link
              href="/register?role=instructor&track=student"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-zinc-950" />
              <span>اشتراك محاضر طالب ({platformSettings.studentTrialDays} يوماً مجاناً)</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

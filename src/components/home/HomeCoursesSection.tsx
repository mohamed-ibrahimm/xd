'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice, formatDuration } from '@/lib/utils';
import {
  Clock,
  Layers,
  Star,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Code2,
  BrainCircuit,
  Palette,
  CheckCircle2,
  Zap,
  GraduationCap,
  Video,
  Flame,
  FileText,
} from 'lucide-react';

interface HomeCoursesSectionProps {
  initialCourses: any[];
  categories: any[];
}

const THEME_STYLES = [
  {
    name: 'blue',
    topBar: 'from-blue-500 via-cyan-400 to-indigo-500',
    aura: 'from-blue-500/15 via-cyan-500/5 to-transparent',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    glowBorder: 'hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.18)]',
    titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    priceColor: 'text-blue-600 dark:text-blue-400',
    btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25',
    btnDark: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/25',
    avatarRing: 'from-blue-500 to-cyan-400',
    fallbackImg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    badgeText: 'الأكثر طلباً',
  },
  {
    name: 'purple',
    topBar: 'from-purple-500 via-fuchsia-400 to-violet-600',
    aura: 'from-purple-500/15 via-fuchsia-500/5 to-transparent',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    glowBorder: 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.18)]',
    titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    priceColor: 'text-purple-600 dark:text-purple-400',
    btn: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25',
    btnDark: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-500/25',
    avatarRing: 'from-purple-500 to-pink-500',
    fallbackImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    badgeText: 'تأهيل مهني متقدم',
  },
  {
    name: 'amber',
    topBar: 'from-amber-400 via-yellow-400 to-orange-500',
    aura: 'from-amber-500/15 via-yellow-500/5 to-transparent',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    glowBorder: 'hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]',
    titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    priceColor: 'text-amber-600 dark:text-amber-400',
    btn: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/25',
    btnDark: 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 shadow-amber-500/25',
    avatarRing: 'from-amber-400 to-yellow-300',
    fallbackImg: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    badgeText: 'ذكاء اصطناعي وهندسة',
  },
  {
    name: 'emerald',
    topBar: 'from-emerald-400 via-teal-400 to-cyan-500',
    aura: 'from-emerald-500/15 via-teal-500/5 to-transparent',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    glowBorder: 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)]',
    titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
    priceColor: 'text-emerald-600 dark:text-emerald-400',
    btn: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25',
    btnDark: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25',
    avatarRing: 'from-emerald-400 to-teal-400',
    fallbackImg: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
    badgeText: 'معتمد لسوق العمل',
  },
];

export default function HomeCoursesSection({
  initialCourses = [],
  categories = [],
}: HomeCoursesSectionProps) {
  const [selectedTrack, setSelectedTrack] = useState<'ALL' | 'STUDENT' | 'EXPERT'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const studentCoursesCount = useMemo(
    () => initialCourses.filter((c) => c.instructor?.isStudentInstructor).length,
    [initialCourses]
  );
  const expertCoursesCount = useMemo(
    () => initialCourses.filter((c) => !c.instructor?.isStudentInstructor).length,
    [initialCourses]
  );

  // Filter courses based on selected track and category tab
  const filteredCourses = useMemo(() => {
    let list = initialCourses;
    if (selectedTrack === 'STUDENT') {
      list = list.filter((c) => c.instructor?.isStudentInstructor);
    } else if (selectedTrack === 'EXPERT') {
      list = list.filter((c) => !c.instructor?.isStudentInstructor);
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(
        (c) =>
          c.categoryId === selectedCategory ||
          c.category?.id === selectedCategory ||
          c.category?.slug === selectedCategory
      );
    }
    return list;
  }, [selectedTrack, selectedCategory, initialCourses]);

  const getCategoryIcon = (slug?: string) => {
    if (!slug) return BookOpen;
    if (slug.includes('ai') || slug.includes('data')) return BrainCircuit;
    if (slug.includes('ui') || slug.includes('design')) return Palette;
    return Code2;
  };

  return (
    <section id="all-courses" className="px-4 sm:px-6 lg:px-10 py-14 sm:py-20 relative scroll-mt-20">
      <div className="max-w-[1440px] mx-auto space-y-10">
        
        {/* =========================================================================
            1. SECTION HEADER (Symmetrical, High Impact)
           ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-[#00e55b]/10 border border-blue-200/80 dark:border-[#00e55b]/25 text-blue-700 dark:text-[#70ff9b] text-xs font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-[#00e55b] animate-pulse" />
            <span>
              {selectedTrack === 'STUDENT'
                ? 'شروحات مبسطة ومناهج يقدمها الطلاب المتميزون لزملائهم'
                : selectedTrack === 'EXPERT'
                ? 'دورات احترافية يقدمها كبار المدرسين والأساتذة الجامعيين'
                : 'دليل كافة مسارات وكورسات المنصة المعتمدة'}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {selectedTrack === 'STUDENT'
              ? 'كورسات وشروحات الطلاب المحاضرين'
              : selectedTrack === 'EXPERT'
              ? 'كورسات المدرسين والدكاترة الجامعيين'
              : 'جميع كورسات ومسارات المنصة'}
          </h2>
          
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            {selectedTrack === 'STUDENT'
              ? 'مناهج جامعية ومدرسية وشروحات تخصصية يقدمها طلبة الجامعات لمساعدة زملائهم على التفوق الدراسي وبناء مشاريع عملية.'
              : selectedTrack === 'EXPERT'
              ? 'برامج تدريبية وتأهيل وظيفي شامل من نخبة الخبراء والأساتذة المعتمدين لمواكبة متطلبات كبرى الشركات.'
              : 'اختر مسارك الهندسي لتتعلم بأحدث أساليب الإنتاج، مع شروحات عملية وتطبيقات واقعية ودعم هندسي متواصل.'}
          </p>
        </div>

        {/* =========================================================================
            2. TOP TRACK SWITCHER (جميع الكورسات | المكتبة والمذكرات | كورسات الطلاب | كورسات المحاضرين)
           ========================================================================= */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-1.5 max-w-4xl mx-auto rounded-full bg-slate-100/90 dark:bg-zinc-950/80 border border-slate-200/90 dark:border-zinc-800 shadow-inner">
          {/* Option 1: All Courses */}
          <button
            type="button"
            onClick={() => setSelectedTrack('ALL')}
            className={`flex-1 min-w-[120px] sm:min-w-[130px] py-2.5 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              selectedTrack === 'ALL'
                ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-white shadow-md border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-[#00e55b]" />
            <span>جميع الكورسات ({initialCourses.length})</span>
          </button>

          {/* Option 2: Digital Notes & Books Marketplace */}
          <Link
            href="/books"
            className="flex-1 min-w-[130px] sm:min-w-[140px] py-2.5 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer bg-gradient-to-r from-emerald-500/15 via-teal-500/20 to-emerald-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400 hover:scale-105 shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>المكتبة والمذكرات الرقمية</span>
          </Link>

          {/* Option 3: Student Courses */}
          <button
            type="button"
            onClick={() => setSelectedTrack('STUDENT')}
            className={`flex-1 min-w-[120px] sm:min-w-[130px] py-2.5 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              selectedTrack === 'STUDENT'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>كورسات الطلاب ({studentCoursesCount})</span>
          </button>

          {/* Option 4: Expert / Instructor Courses */}
          <button
            type="button"
            onClick={() => setSelectedTrack('EXPERT')}
            className={`flex-1 min-w-[120px] sm:min-w-[130px] py-2.5 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
              selectedTrack === 'EXPERT'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>كورسات المحاضرين ({expertCoursesCount})</span>
          </button>
        </div>

        {/* =========================================================================
            3. DYNAMIC CATEGORY FILTER TABS
           ========================================================================= */}
        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-sm'
                  : 'bg-white/90 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/90 dark:border-zinc-800'
              }`}
            >
              <span>كافة التصنيفات</span>
            </button>

            {categories.map((cat) => {
              const CatIcon = getCategoryIcon(cat.slug);
              const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
              const count = initialCourses.filter(
                (c) =>
                  (c.categoryId === cat.id || c.category?.id === cat.id || c.category?.slug === cat.slug) &&
                  (selectedTrack === 'ALL' ||
                    (selectedTrack === 'STUDENT' && c.instructor?.isStudentInstructor) ||
                    (selectedTrack === 'EXPERT' && !c.instructor?.isStudentInstructor))
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-sm'
                      : 'bg-white/90 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/90 dark:border-zinc-800'
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-zinc-950'
                      : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            4. SLEEK, WIDE & CENTERED LUXURY CARDS GRID
           ========================================================================= */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 dark:bg-[#00e55b]/15 dark:text-[#00e55b] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">لا توجد كورسات مطابقة حالياً</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {selectedTrack === 'STUDENT'
                ? 'لم يتم نشر كورسات في مسار الطلاب بعد. يمكنك التسجيل كمحاضر طالب ونشر كورس الآن!'
                : 'جرب اختيار تصنيف آخر أو إعادة ضبط الفلتر.'}
            </p>
            <button
              onClick={() => { setSelectedTrack('ALL'); setSelectedCategory('ALL'); }}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              عرض جميع الكورسات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredCourses.map((course, idx) => {
              const theme = THEME_STYLES[idx % THEME_STYLES.length];
              const CatIcon = getCategoryIcon(course.category?.slug);
              const isStudentCourse = Boolean(course.instructor?.isStudentInstructor);
              
              // Direct clean image
              const imageSrc = course.thumbnail || theme.fallbackImg;

              // Discount calculation
              const originalPrice = Math.round((course.price * 1.55) / 50) * 50;

              // Normalized description
              const cleanDescription =
                course.shortDescription &&
                course.shortDescription.length > 10 &&
                !course.shortDescription.includes('سسس')
                  ? course.shortDescription
                  : course.description &&
                    course.description.length > 10 &&
                    !course.description.includes('سسس')
                  ? course.description
                  : 'مسار تطبيقي مكثف يركز على إتقان أحدث المعايير البرمجية وبناء مشاريع واقعية.';

              return (
                <div
                  key={course.id}
                  className={`group relative flex flex-col justify-between rounded-2xl bg-white/95 dark:bg-zinc-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-zinc-800/90 ${theme.glowBorder} shadow-lg shadow-slate-900/5 dark:shadow-black/70 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden`}
                >
                  {/* 1. Dynamic Top Accent Beam */}
                  <div className={`h-1 w-full bg-gradient-to-r ${isStudentCourse ? 'from-amber-400 via-amber-300 to-yellow-500 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846]' : theme.topBar}`} />

                  {/* 2. Ambient Glow Flare */}
                  <div className={`absolute -top-20 -right-20 w-44 h-44 rounded-full bg-gradient-to-br ${theme.aura} blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none`} />

                  {/* 3. Card Content Area */}
                  <div className="p-3.5 sm:p-4 space-y-3 text-center">
                    
                    {/* Widescreen Image */}
                    <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
                      <img
                        src={imageSrc}
                        alt={course.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                      />

                      {/* Gradient vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between pointer-events-none">
                        {isStudentCourse ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 backdrop-blur-md text-zinc-950 border border-amber-300 dark:bg-[#00e55b] dark:text-black dark:border-[#10f068] flex items-center gap-1 shadow-md">
                            <GraduationCap className="w-3.5 h-3.5 text-zinc-950" />
                            <span>كورس طالب محاضر</span>
                          </span>
                        ) : course.category ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 dark:text-[#70ff9b] dark:border-[#00e55b]/40 flex items-center gap-1 shadow-md">
                            <CatIcon className="w-3.5 h-3.5 text-amber-400 dark:text-[#00e55b]" />
                            <span>{course.category.name}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-black/80 backdrop-blur-md text-sky-300 border border-sky-500/40 flex items-center gap-1 shadow-md">
                            <Code2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>مسار معتمد</span>
                          </span>
                        )}

                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 backdrop-blur-md text-white border border-emerald-500/60 flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                          <span>معتمد</span>
                        </span>
                      </div>

                      {/* Bottom Metadata bar over image */}
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-xs text-white pointer-events-none font-bold">
                        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                          <Clock className="w-3.5 h-3.5 text-amber-400 dark:text-[#00e55b]" />
                          <span className="text-white font-bold">{formatDuration(course.durationHours)}</span>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-500/30 backdrop-blur-md text-amber-200 dark:bg-[#00e55b]/20 dark:text-[#70ff9b] px-2.5 py-1 rounded-full border border-amber-400/40 dark:border-[#00e55b]/40 shadow-md">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 dark:fill-[#00e55b] dark:text-[#00e55b]" />
                          <span className="font-bold">4.9</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-white font-bold">{course._count?.sections || 2} وحدات</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-2 text-center">
                      
                      {/* Centered Micro-Badge */}
                      <div className="flex items-center justify-center gap-2 text-[11px]">
                        <span className={`px-2.5 py-0.5 rounded-full font-black border ${theme.badge} flex items-center gap-1 shadow-xs`}>
                          <Zap className="w-2.5 h-2.5" />
                          <span>{theme.badgeText}</span>
                        </span>
                        <span className="text-[10.5px] text-slate-600 dark:text-zinc-400 font-bold">
                          مشاريع واقعية لسوق العمل
                        </span>
                      </div>

                      {/* Centered Title with high contrast (No single-line cutoff dots) */}
                      <h3 className="font-black text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#00e55b] transition-colors leading-snug text-center line-clamp-2 min-h-[3rem] flex items-center justify-center">
                        {course.title}
                      </h3>
                      
                      {/* Centered Concise Description */}
                      <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed text-center max-w-sm mx-auto font-medium">
                        {cleanDescription}
                      </p>

                      {/* Centered Sleek Instructor Pill */}
                      <div className="pt-1 flex justify-center">
                        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 shadow-xs">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${isStudentCourse ? 'from-amber-400 to-yellow-300 dark:from-[#0df268] dark:to-[#00b846]' : theme.avatarRing} p-[1px] shrink-0`}>
                            <div className="w-full h-full rounded-full bg-slate-900 dark:bg-zinc-950 flex items-center justify-center text-[9px] font-black text-white">
                              {course.instructor?.officialFullName?.[0] || 'م'}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {course.instructor?.officialFullName || 'م / محمد إبراهيم'}
                          </span>
                          {isStudentCourse ? (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:bg-[#00e55b]/15 dark:text-[#70ff9b] font-black border border-amber-500/30 dark:border-[#00e55b]/30 flex items-center gap-0.5">
                              <GraduationCap className="w-2.5 h-2.5" />
                              طالب محاضر
                            </span>
                          ) : (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-black border border-indigo-500/25 flex items-center gap-0.5">
                              <Video className="w-2.5 h-2.5" />
                              مدرس / دكتور معتمد
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 4. Pricing & Full-Width Button Base */}
                  <div className="p-3.5 sm:p-4 bg-slate-50/95 dark:bg-zinc-950/85 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col items-center gap-2.5 rounded-b-2xl text-center">
                    
                    {/* Price Display */}
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400 dark:text-zinc-500 line-through font-bold">
                          {formatPrice(originalPrice)}
                        </span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-black border border-emerald-200 dark:border-emerald-500/25">
                          وفر 35%
                        </span>
                      </div>

                      <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-[#00e55b] tracking-tight drop-shadow-sm">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <Link
                      href={`/courses/${course.slug}`}
                      prefetch={true}
                      className={`w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 ${
                        isStudentCourse
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/20'
                          : `${theme.btn} dark:${theme.btnDark}`
                      }`}
                    >
                      <span>عرض الكورس والاشتراك</span>
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

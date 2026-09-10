'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Layers,
  Star,
  Flame,
  Sparkles,
  Award,
  Users,
  Percent,
  CheckCircle2,
  SlidersHorizontal,
  ArrowLeft,
  X,
  GraduationCap,
  BadgeCheck,
  Zap,
  PhoneCall,
  ChevronLeft,
  TrendingUp,
  Crown,
  Sparkle,
  Video,
  FileText,
} from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  description: string;
  shortDescription: string | null;
  categoryId: string | null;
  level: string;
  durationHours: number;
  price: number;
  compareAtPrice: number | null;
  isFree: boolean;
  status: string;
  certificateEnabled: boolean;
  hasFinalExam: boolean;
  instructor: {
    officialFullName: string;
    firstName?: string;
    lastName?: string;
    avatarUrl: string | null;
    isStudentInstructor?: boolean;
    studentUniversity?: string | null;
    studentFaculty?: string | null;
    role?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    sections: number;
    enrollments: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  orderIndex?: number;
}

interface Props {
  initialCourses: Course[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
  initialType?: string;
}

export default function CoursesCatalogClient({
  initialCourses,
  categories,
  initialCategory = '',
  initialQuery = '',
  initialType = 'all',
}: Props) {
  // State
  const [selectedType, setSelectedType] = useState<'ALL' | 'STUDENT' | 'EXPERT'>(
    initialType === 'students' ? 'STUDENT' : initialType === 'instructors' ? 'EXPERT' : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'ALL' | 'DISCOUNTED' | 'FREE' | 'PAID'>('ALL');
  const [selectedDuration, setSelectedDuration] = useState<'ALL' | 'SHORT' | 'LONG'>('ALL');
  const [onlyCertified, setOnlyCertified] = useState(false);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'RATING' | 'PRICE_LOW' | 'PRICE_HIGH'>('POPULAR');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fallback high-res tech thumbnails for spotlight courses
  const getThumbnail = (course: Course, idx: number) => {
    if (course.thumbnail && course.thumbnail.trim() && !course.thumbnail.includes('1787916336074') && !course.thumbnail.includes('1787933474229')) {
      return course.thumbnail;
    }
    const fallbacks = [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    ];
    return fallbacks[idx % fallbacks.length];
  };

  // Top Featured / Trending & Hot Deals Courses (Prioritizing flagship courses with discounts and rich content)
  const featuredCourses = useMemo(() => {
    const sorted = [...initialCourses].sort((a, b) => {
      // Prioritize active discounts
      const aDiscount = (a.compareAtPrice && a.compareAtPrice > a.price) ? (a.compareAtPrice - a.price) : 0;
      const bDiscount = (b.compareAtPrice && b.compareAtPrice > b.price) ? (b.compareAtPrice - b.price) : 0;
      if (bDiscount !== aDiscount) return bDiscount - aDiscount;

      // Prioritize enrollments
      const aEnroll = a._count?.enrollments || 0;
      const bEnroll = b._count?.enrollments || 0;
      if (bEnroll !== aEnroll) return bEnroll - aEnroll;

      // Prioritize higher price (full comprehensive diplomas)
      return b.price - a.price;
    });

    return sorted.slice(0, 3);
  }, [initialCourses]);

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchDesc = (course.description || '').toLowerCase().includes(q);
        const matchInstructor = course.instructor.officialFullName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchInstructor) return false;
      }

      // Track Filter (All / Students / Instructors)
      if (selectedType === 'STUDENT' && !course.instructor?.isStudentInstructor) {
        return false;
      }
      if (selectedType === 'EXPERT' && course.instructor?.isStudentInstructor) {
        return false;
      }

      // Category
      if (selectedCategory && course.category?.slug !== selectedCategory) {
        return false;
      }

      // Level
      if (selectedLevel !== 'ALL' && course.level !== selectedLevel) {
        return false;
      }

      // Price & Deals
      if (selectedPriceFilter === 'DISCOUNTED' && (!course.compareAtPrice || course.compareAtPrice <= course.price)) {
        return false;
      }
      if (selectedPriceFilter === 'FREE' && (!course.isFree && course.price > 0)) {
        return false;
      }
      if (selectedPriceFilter === 'PAID' && (course.isFree || course.price === 0)) {
        return false;
      }

      // Certified
      if (onlyCertified && !course.certificateEnabled) {
        return false;
      }

      // Duration
      if (selectedDuration === 'SHORT' && course.durationHours >= 15) {
        return false;
      }
      if (selectedDuration === 'LONG' && course.durationHours < 15) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'POPULAR') {
        return (b._count.enrollments || 0) - (a._count.enrollments || 0);
      }
      if (sortBy === 'PRICE_LOW') {
        return a.price - b.price;
      }
      if (sortBy === 'PRICE_HIGH') {
        return b.price - a.price;
      }
      if (sortBy === 'RATING') {
        return (b.compareAtPrice || 0) - (a.compareAtPrice || 0);
      }
      return 0;
    });
  }, [
    initialCourses,
    selectedType,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedPriceFilter,
    onlyCertified,
    selectedDuration,
    sortBy,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('ALL');
    setSelectedPriceFilter('ALL');
    setSelectedDuration('ALL');
    setOnlyCertified(false);
    setSelectedType('ALL');
    setSortBy('POPULAR');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedType !== 'ALL' ||
    selectedLevel !== 'ALL' ||
    selectedPriceFilter !== 'ALL' ||
    selectedDuration !== 'ALL' ||
    onlyCertified
  );

  return (
    <div className="relative min-h-screen py-8 px-3 sm:px-6 lg:px-10 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505] text-slate-900 dark:text-[#FAFAFA]">
      {/* Dynamic Background Mesh Orbs (Dual-Theme Compatible) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[3%] right-[10%] w-[600px] h-[600px] bg-pink-400/15 dark:bg-[rgba(233,79,159,0.06)] rounded-full blur-[150px]" />
        <div className="dynamic-drift-2 absolute bottom-[15%] left-[8%] w-[650px] h-[650px] bg-purple-400/15 dark:bg-[rgba(244,123,183,0.04)] rounded-full blur-[160px]" />
        <div className="dynamic-drift-3 absolute top-[35%] left-[20%] w-[450px] h-[450px] bg-pink-400/10 dark:bg-[rgba(233,79,159,0.04)] rounded-full blur-[130px]" />
        <div className="dynamic-drift-4 absolute bottom-[8%] right-[18%] w-[500px] h-[500px] bg-purple-400/10 dark:bg-[rgba(244,123,183,0.04)] rounded-full blur-[140px]" />
      </div>

      <div className="max-w-[1650px] w-full mx-auto space-y-10">
        
        {/* =========================================================================
            1. DYNAMIC SPOTLIGHT VIP STAGE (الكورسات الأكثر نشراً، بحثاً وضجة)
           ========================================================================= */}
        <div className="relative rounded-3xl border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] bg-white/95 dark:bg-[#111113] shadow-xl overflow-hidden backdrop-blur-2xl p-6 sm:p-10">
          
          {/* Inner Glowing Container */}
          <div className="relative z-10 text-center">
            
            {/* Ambient Internal Glow Highlights */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/15 dark:bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/20 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-cyan-500/15 dark:bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

            {/* Header Area */}
            <div className="relative z-10 max-w-4xl mx-auto space-y-3">
              
              {/* Pulsing Dynamic Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs sm:text-sm font-black shadow-xs">
                <Sparkles className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
                <span>منصة الصدارة: الكورسات الأكثر نشراً وبحثاً والضجة الأكبر في سوق العمل</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                دليل الكورسات والدبلومات الأكثر طلباً
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
                انضم إلى آلاف المتعلمين واحترف البرمجة والذكاء الاصطناعي والتصميم مع <span className="font-black text-[#D83F8F] dark:text-[#E94F9F]">المهندس محمد إبراهيم</span> عبر مسارات عملية كاملة.
              </p>

              {/* Top 3 Spotlight Key Metrics */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-1">
                <div className="px-4 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>الأكثر ضجة وإقبالاً</span>
                </div>
                <div className="px-4 py-1.5 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-black flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-500" />
                  <span>الأكثر بحثاً في 2026</span>
                </div>
                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>خصومات ذهبية حصرية</span>
                </div>
              </div>
            </div>

            {/* =========================================================
                THE 3 DAZZLING SPOTLIGHT CARDS (SLEEK & REFINED)
               ========================================================= */}
            {featuredCourses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 relative z-10 text-center">
                {featuredCourses.map((course, idx) => {
                  const discountPercent = course.compareAtPrice && course.compareAtPrice > course.price
                    ? Math.round(((course.compareAtPrice - course.price) / course.compareAtPrice) * 100)
                    : 50;

                  // Spotlight rank metadata
                  const rankConfig = idx === 0 ? {
                    label: '#1 الأكثر ضجة وطلباً',
                    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-amber-500/30',
                    borderHover: 'hover:border-amber-500/80 hover:shadow-amber-500/20',
                    icon: Flame,
                    highlightText: 'إقبال هائل هذا الأسبوع',
                  } : idx === 1 ? {
                    label: '#2 الأكثر بحثاً ورواجاً',
                    badgeBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30',
                    borderHover: 'hover:border-cyan-500/80 hover:shadow-cyan-500/20',
                    icon: Zap,
                    highlightText: 'الأعلى نمواً في سوق العمل',
                  } : {
                    label: '#3 العرض الذهبي الأقوى',
                    badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/30',
                    borderHover: 'hover:border-rose-500/80 hover:shadow-rose-500/20',
                    icon: Sparkles,
                    highlightText: 'خصم استثنائي لفترة محدودة',
                  };

                  const RankIcon = rankConfig.icon;
                  const thumb = getThumbnail(course, idx);

                  return (
                    <div
                      key={course.id}
                      className={`group relative rounded-3xl bg-white dark:bg-[#17171A] border border-slate-200/90 dark:border-[rgba(233,79,159,0.20)] hover:border-[#D83F8F] dark:hover:border-[#E94F9F] ${rankConfig.borderHover} p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1.5 backdrop-blur-xl text-center`}
                    >
                      <div className="space-y-3">
                        {/* Compact Thumbnail Container */}
                        <div className="relative h-38 sm:h-40 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
                          <img
                            src={thumb}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                          {/* Floating Rank Badge (Top-Right) */}
                          <div className="absolute top-2.5 right-2.5">
                            <span className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1 shadow-md ${rankConfig.badgeBg}`}>
                              <RankIcon className="w-3.5 h-3.5" />
                              <span>{rankConfig.label}</span>
                            </span>
                          </div>

                          {/* Floating Discount Tag (Top-Left) */}
                          {discountPercent > 0 && (
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-1 rounded-xl bg-rose-600/90 backdrop-blur-md text-white font-black text-xs flex items-center gap-1 shadow-md border border-rose-400/40 animate-pulse">
                                <Percent className="w-3 h-3" />
                                <span>وفر {discountPercent}%</span>
                              </span>
                            </div>
                          )}

                          {/* Bottom Category Bar */}
                          <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                              {course.category?.name || 'برمجة وتطوير'}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center gap-1 border border-white/10">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>4.9</span>
                            </span>
                          </div>
                        </div>

                        {/* Live Social Proof Micro-Bar */}
                        <div className="py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center justify-center gap-1.5">
                          <span>{rankConfig.highlightText}</span>
                        </div>

                        {/* Course Title Centered */}
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors leading-snug line-clamp-2 px-1">
                          {course.title}
                        </h3>

                        {/* Compact Metadata Row */}
                        <div className="flex items-center justify-center gap-2.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(course.durationHours)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            {course._count.sections} وحدات
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                            شهادة معتمدة
                          </span>
                        </div>
                      </div>

                      {/* Pricing & CTA Button */}
                      <div className="pt-3 mt-3 border-t border-slate-200/90 dark:border-purple-900/40 space-y-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {course.isFree || course.price === 0 ? 'مجاناً' : formatPrice(course.price)}
                          </span>
                          {course.compareAtPrice && course.compareAtPrice > course.price && (
                            <span className="text-xs text-slate-400 dark:text-zinc-500 line-through font-bold">
                              {formatPrice(course.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="w-full h-10 rounded-xl bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>عرض تفاصيل الكورس والعرض</span>
                          <ArrowLeft className="w-3.5 h-3.5 text-white dark:text-black" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Track Switcher Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-200/90 dark:border-purple-900/40 relative z-10">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">الأقسام:</span>

              <button
                type="button"
                onClick={() => setSelectedType('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedType === 'ALL'
                    ? 'bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-black shadow-md font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>جميع الكورسات ({initialCourses.length})</span>
              </button>

              {/* Direct Link to Books & Notes Marketplace */}
              <Link
                href="/books"
                className="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-emerald-500/15 via-teal-500/20 to-emerald-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400 hover:scale-105 shadow-sm"
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>المكتبة والمذكرات الرقمية</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedType('STUDENT')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedType === 'STUDENT'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50 scale-105'
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>كورسات الطلاب ({initialCourses.filter(c => c.instructor?.isStudentInstructor).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('EXPERT')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedType === 'EXPERT'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-400/50 scale-105'
                    : 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>كورسات المحاضرين والدكاترة ({initialCourses.filter(c => !c.instructor?.isStudentInstructor).length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. MAIN CATALOG: SIDEBAR + COURSES GRID
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* ===================== SIDEBAR ===================== */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden w-full h-12 rounded-2xl bg-white dark:bg-[#15102a] border border-slate-200 dark:border-purple-900/60 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>تصفية الكورسات المتقدمة</span>
            </button>

            {/* Sidebar Container */}
            <div className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block space-y-6`}>
              
              {/* Filter Group: Track (All / Student / Expert) */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] shadow-xl space-y-4 backdrop-blur-xl">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>مسار الكورس ونوع المحاضر</span>
                </h3>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedType('ALL')}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'ALL'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>جميع الكورسات (الكل)</span>
                    <span className="text-[11px] font-mono">{initialCourses.length}</span>
                  </button>

                  <Link
                    href="/books"
                    className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30"
                  >
                    <span className="flex items-center gap-1.5 font-black">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>المكتبة والمذكرات الرقمية</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black">DRM</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSelectedType('STUDENT')}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'STUDENT'
                        ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                        : 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>كورسات الطلاب</span>
                    </span>
                    <span className="text-[11px] font-mono">{initialCourses.filter(c => c.instructor?.isStudentInstructor).length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('EXPERT')}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                      selectedType === 'EXPERT'
                        ? 'bg-indigo-600 text-white shadow-md font-black'
                        : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>كورسات المحاضرين والدكاترة</span>
                    </span>
                    <span className="text-[11px] font-mono">{initialCourses.filter(c => !c.instructor?.isStudentInstructor).length}</span>
                  </button>
                </div>
              </div>

              {/* Filter Group: Categories */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] shadow-xl space-y-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>تصنيف المجال</span>
                  </h3>
                  {selectedCategory && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('')}
                      className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                      !selectedCategory
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>جميع المجالات والتخصصات</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-black/40 text-slate-700 dark:text-zinc-300 font-mono">
                      {initialCourses.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = initialCourses.filter((c) => c.category?.slug === cat.slug).length;
                    const isSelected = selectedCategory === cat.slug;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-black/40 text-slate-700 dark:text-zinc-300 font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Group: Level */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] shadow-xl space-y-4 backdrop-blur-xl">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>المستوى التدريبي</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ALL', label: 'الكل' },
                    { id: 'BEGINNER', label: 'مبتدئ' },
                    { id: 'INTERMEDIATE', label: 'متوسط' },
                    { id: 'ADVANCED', label: 'متقدم' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        selectedLevel === lvl.id
                          ? 'bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-black shadow-md font-bold'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group: Deals & Price */}
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] shadow-xl space-y-4 backdrop-blur-xl">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>السعر والعروض</span>
                </h3>

                <div className="space-y-1.5">
                  {[
                    { id: 'ALL', label: 'جميع الأسعار' },
                    { id: 'DISCOUNTED', label: 'عروض وتخفيضات سارية' },
                    { id: 'FREE', label: 'كورسات مجانية 100%' },
                    { id: 'PAID', label: 'دورات مدفوعة متقدمة' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPriceFilter(item.id as any)}
                      className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-right flex items-center justify-between transition-all cursor-pointer ${
                        selectedPriceFilter === item.id
                          ? 'bg-pink-50 dark:bg-[rgba(233,79,159,0.15)] text-[#D83F8F] dark:text-[#E94F9F] border border-pink-200 dark:border-[rgba(233,79,159,0.30)] shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      {selectedPriceFilter === item.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Innovation Card: AI Advisor */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-200 dark:border-indigo-700/50 shadow-xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">محتار تبدأ منين؟</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    تواصل مع فريق الاستشارات الأكاديمية لاختيار المسار التدريبي المناسب لمستواك وهدفك.
                  </p>
                </div>
                <a
                  href="https://wa.me/201012345678"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/30 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>استشارة فورية عبر الواتساب</span>
                </a>
              </div>

              {/* Innovation Card: 100% Guarantee */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2 text-center shadow-md">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <BadgeCheck className="w-4 h-4" />
                  <span>ضمان الجودة والأمان 100%</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  جميع الدورات تشمل مشاريع حقيقية لسوق العمل وشهادة إتمام معتمدة بكود تحقق رقمي.
                </p>
              </div>
            </div>
          </aside>

          {/* ===================== MAIN CATALOG ===================== */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Top Search & Filter Bar */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-xl">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن اسم الكورس، التقنية، أو المحاضر..."
                  className="w-full h-12 pr-11 pl-9 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] focus:bg-white dark:focus:bg-white/[0.08] transition-all shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort & Count Controls */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                  عرض <span className="text-amber-600 dark:text-amber-400 font-black">{filteredCourses.length}</span> دورة
                </span>

                {/* Sort Select */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-12 px-4 pl-9 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] cursor-pointer appearance-none shadow-xs"
                  >
                    <option value="POPULAR" className="bg-white dark:bg-[#120e24] text-slate-900 dark:text-white">الأكثر طلباً ورواجاً</option>
                    <option value="NEWEST" className="bg-white dark:bg-[#120e24] text-slate-900 dark:text-white">الأحدث إضافتاً</option>
                    <option value="PRICE_LOW" className="bg-white dark:bg-[#120e24] text-slate-900 dark:text-white">السعر: من الأقل للأعلى</option>
                    <option value="PRICE_HIGH" className="bg-white dark:bg-[#120e24] text-slate-900 dark:text-white">السعر: من الأعلى للأقل</option>
                  </select>
                  <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-bold">الفلاتر النشطة:</span>

                {selectedCategory && (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                    {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory('')} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {selectedLevel !== 'ALL' && (
                  <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5 font-bold">
                    مستوى: {selectedLevel}
                    <button type="button" onClick={() => setSelectedLevel('ALL')} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                {selectedPriceFilter !== 'ALL' && (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                    {selectedPriceFilter === 'DISCOUNTED' ? 'عروض وتخفيضات' : selectedPriceFilter === 'FREE' ? 'مجاني' : 'مدفوع'}
                    <button type="button" onClick={() => setSelectedPriceFilter('ALL')} className="hover:text-rose-500 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer mr-2"
                >
                  إلغاء جميع الفلاتر
                </button>
              </div>
            )}

            {/* Courses Grid - Fully Centered Typography and Card Details */}
            {filteredCourses.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-white/90 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] space-y-4 p-8 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-500">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">لم يتم العثور على كورسات مطابقة</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  جرب البحث بكلمات أخرى، أو تغيير خيارات التصفية لعرض الكورسات المتاحة.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  إعادة ضبط البحث والفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => {
                  const discountPercent = course.compareAtPrice && course.compareAtPrice > course.price
                    ? Math.round(((course.compareAtPrice - course.price) / course.compareAtPrice) * 100)
                    : null;

                  const levelLabel =
                    course.level === 'BEGINNER' ? 'مبتدئ' :
                    course.level === 'INTERMEDIATE' ? 'متوسط' :
                    course.level === 'ADVANCED' ? 'متقدم' : 'شامل لجميع المستويات';

                  const thumb = getThumbnail(course, idx);

                  return (
                    <div
                      key={course.id}
                      className="group rounded-3xl bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] hover:border-[#D83F8F] dark:hover:border-[#E94F9F] p-5 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-purple-950/50 hover:-translate-y-1.5 text-center"
                    >
                      <div className="space-y-4">
                        {/* Thumbnail & Floating Badges */}
                        <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900">
                          <img
                            src={thumb}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5">
                            {course.category && (
                              <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-xs font-bold text-white border border-white/10 shadow-xs">
                                {course.category.name}
                              </span>
                            )}

                            {discountPercent && (
                              <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-md">
                                <Percent className="w-3.5 h-3.5" />
                                وفر {discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Bottom Floating Bar */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg bg-purple-950/90 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-purple-700/60">
                              {levelLabel}
                            </span>

                            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>4.9</span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Short Description Centered */}
                        <div className="space-y-2 text-center">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors leading-snug line-clamp-2">
                            {course.title}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {course.shortDescription || course.description}
                          </p>
                        </div>

                        {/* Meta chips Centered */}
                        <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-bold">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(course.durationHours)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            {course._count.sections} وحدات
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {course._count.enrollments} طالب
                          </span>
                        </div>

                        {/* Instructor Info Centered */}
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            {course.instructor.avatarUrl ? (
                              <img
                                src={course.instructor.avatarUrl}
                                alt={course.instructor.officialFullName}
                                className="w-6 h-6 rounded-full object-cover border border-purple-500/40"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white">
                                {course.instructor.officialFullName[0]}
                              </div>
                            )}
                            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                              {course.instructor.officialFullName}
                            </span>
                          </div>

                          {course.instructor.isStudentInstructor ? (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black border border-amber-500/30 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              طالب محاضر
                            </span>
                          ) : (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/20 flex items-center gap-1">
                              <Video className="w-3 h-3 text-indigo-400" />
                              مدرس / دكتور معتمد
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA Button Centered */}
                      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-purple-900/40 space-y-3 text-center">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 block mb-0.5">
                            سعر الاشتراك في الكورس
                          </span>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xl sm:text-2xl font-black text-[#D83F8F] dark:text-[#E94F9F]">
                              {course.isFree || course.price === 0 ? 'مجاناً' : formatPrice(course.price)}
                            </span>
                            {course.compareAtPrice && course.compareAtPrice > course.price && (
                              <span className="text-xs text-slate-400 dark:text-zinc-500 line-through font-bold">
                                {formatPrice(course.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="w-full h-12 rounded-2xl bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-black font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>تفاصيل الكورس والاشتراك</span>
                          <ArrowLeft className="w-4 h-4 text-white dark:text-black" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

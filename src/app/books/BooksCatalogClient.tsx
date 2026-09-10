'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Sparkles,
  Shield,
  Star,
  CheckCircle,
  ShoppingBag,
  Eye,
  SlidersHorizontal,
  GraduationCap,
  Layers,
  FileText,
  Lock,
  Tag,
  ArrowRight,
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Crown,
  User,
  ArrowLeft,
  X,
  BookMarked,
  Sparkle,
  BadgeCheck,
  ExternalLink,
} from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  fileUrl: string;
  description: string;
  shortDescription?: string | null;
  pageCount: number;
  previewPagesCount: number;
  price: number;
  compareAtPrice?: number | null;
  isFree: boolean;
  authorName?: string | null;
  academicSubject?: string | null;
  academicLevel?: string | null;
  category: string;
  salesCount: number;
  viewsCount: number;
  rating: number;
  instructor?: {
    id: string;
    officialFullName: string;
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
    isStudentInstructor: boolean;
    studentUniversity?: string | null;
    studentFaculty?: string | null;
    role?: string;
  } | null;
}

interface Props {
  initialBooks: BookItem[];
  purchasedBookIds: string[];
  currentUser: {
    id: string;
    officialFullName: string;
    phone?: string | null;
    username: string;
  } | null;
}

export default function BooksCatalogClient({
  initialBooks,
  purchasedBookIds,
  currentUser,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'RATING' | 'NEWEST' | 'PRICE_ASC'>('POPULAR');

  const categories = useMemo(() => [
    { id: 'ALL', name: 'كافة الأقسام والمذكرات', icon: Layers, count: initialBooks.length },
    { id: 'ملخصات', name: 'ملخصات وشروحات مركزة', icon: FileText, count: initialBooks.filter(b => b.category === 'ملخصات').length },
    { id: 'كتب ومراجع', name: 'كتب ومراجع إلكترونية', icon: BookOpen, count: initialBooks.filter(b => b.category === 'كتب ومراجع').length },
    { id: 'بنك أسئلة', name: 'بنوك أسئلة وامتحانات محلولة', icon: GraduationCap, count: initialBooks.filter(b => b.category === 'بنك أسئلة').length },
  ], [initialBooks]);

  // Spotlight top 3 trending notes
  const spotlightBooks = useMemo(() => {
    return [...initialBooks].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 3);
  }, [initialBooks]);

  const filteredBooks = useMemo(() => {
    let list = initialBooks.filter((book) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(query);
        const matchAuthor = (book.authorName || '').toLowerCase().includes(query);
        const matchSubject = (book.academicSubject || '').toLowerCase().includes(query);
        const matchDesc = (book.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchAuthor && !matchSubject && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && book.category !== selectedCategory) {
        return false;
      }

      // Price
      if (priceFilter === 'FREE' && !book.isFree && book.price > 0) return false;
      if (priceFilter === 'PAID' && (book.isFree || book.price === 0)) return false;

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'RATING') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'PRICE_ASC') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'NEWEST') return b.id.localeCompare(a.id);
      return (b.salesCount || 0) - (a.salesCount || 0); // POPULAR default
    });

    return list;
  }, [initialBooks, searchQuery, selectedCategory, priceFilter, sortBy]);

  // Fallback realistic author portraits
  const getAuthorAvatar = (book: BookItem) => {
    if (book.instructor?.avatarUrl && book.instructor.avatarUrl.trim()) {
      return book.instructor.avatarUrl;
    }
    const name = book.authorName || '';
    if (name.includes('إبراهيم')) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
    if (name.includes('طارق')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
    if (name.includes('عبد الرحمن')) return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400';
    if (name.includes('أحمد')) return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';
    return null;
  };

  return (
    <div className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-10 space-y-8 sm:space-y-10">
      
      {/* =========================================================================
          1. CENTERED WORLD-CLASS HERO BANNER (Full-width, Symmetrical Glassmorphism)
         ========================================================================= */}
      <div className="relative rounded-[40px] overflow-hidden p-6 sm:p-10 md:p-12 border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] bg-white/95 dark:bg-[#111113] text-slate-900 dark:text-white shadow-xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-center">
        
        {/* Dynamic Glowing Ambiance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-amber-500/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-16 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-16 left-10 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs sm:text-sm font-black shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F] animate-pulse" />
            <span>سوق ومكتبة المذكرات والمراجع الرقمية المشفرة</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[58px] font-black text-slate-900 dark:text-white leading-[1.18] tracking-tight">
            ملخصات دراسية، كتب تخصصية، <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#D83F8F] via-[#FF5CAD] to-[#B83278] dark:from-[#E94F9F] dark:via-[#FF5CAD] dark:to-[#E94F9F] bg-clip-text text-transparent">
              وبنوك أسئلة باحترافية كاملة
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-normal">
            تصفح واشترِ أقوى المذكرات والكتب المعدة بواسطة نخبة المحاضرين والطلاب المتفوقين، واقرأها من أي جهاز مع حماية مشددة بنظام DRM ومعاينة مجانية لأولى الصفحات.
          </p>

          {/* 4 Centerpiece Value Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 text-xs sm:text-sm font-bold text-zinc-200">
            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 shadow-md backdrop-blur-md">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>حماية رقمية مشفرة 100% DRM</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-amber-500/40 text-amber-300 flex items-center gap-2 shadow-md backdrop-blur-md">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>معاينة مجانية لكافة المذكرات</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-blue-500/40 text-blue-300 flex items-center gap-2 shadow-md backdrop-blur-md">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>حفظ دائم في مكتبتك الخاصة</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-purple-500/40 text-purple-300 flex items-center gap-2 shadow-md backdrop-blur-md">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>تقييم 4.9/5 من آلاف الطلاب</span>
            </div>
          </div>

          {/* Direct CTA Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <a
              href="#catalog-grid"
              className="px-6 py-3 rounded-full bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-white dark:text-black" />
              <span>تصفح كافة المذكرات والكتب المتاحة</span>
              <ArrowLeft className="w-4 h-4 text-white dark:text-black" />
            </a>

            <Link
              href="/instructors/join?track=expert"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-black text-xs sm:text-sm border border-white/20 hover:border-white/40 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>انشر مذكراتك واربح 85%</span>
            </Link>
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. SPOTLIGHT: TOP 3 BEST-SELLING & TRENDING NOTES (قسم الأقوى مبيعاً)
         ========================================================================= */}
      {spotlightBooks.length > 0 && !searchQuery.trim() && selectedCategory === 'ALL' && priceFilter === 'ALL' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white dark:text-black flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                <Flame className="w-5 h-5 text-white dark:text-black animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  المذكرات الأكثر طلباً ومبيعاً هذا الأسبوع
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  المذكرات الأعلى تقييماً وإقبالاً من طلاب الجامعات والمهندسين
                </p>
              </div>
            </div>

            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 self-start sm:self-auto">
              إقبال استثنائي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spotlightBooks.map((book, idx) => {
              const isPurchased = purchasedBookIds.includes(book.id);
              const authorAvatar = getAuthorAvatar(book);
              const badgeColors = idx === 0
                ? 'from-amber-500 to-yellow-400 text-white dark:text-black'
                : idx === 1
                ? 'from-emerald-500 to-teal-400 text-white dark:text-black'
                : 'from-purple-600 to-indigo-500 text-white';

              return (
                <div
                  key={book.id}
                  className="group relative rounded-3xl bg-white dark:bg-[#120d26] border-2 border-amber-500/40 hover:border-amber-400 shadow-xl hover:shadow-2xl hover:shadow-amber-500/15 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Rank Flag */}
                  <div className="absolute top-3.5 right-3.5 z-20">
                    <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${badgeColors} text-[11px] font-black shadow-lg flex items-center gap-1`}>
                      <Crown className="w-3.5 h-3.5" />
                      <span>#{idx + 1} الأكثر مبيعاً</span>
                    </span>
                  </div>

                  {/* Cover Header */}
                  <div className="relative h-48 sm:h-52 w-full bg-slate-950 overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950 to-indigo-950">
                        <BookOpen className="w-14 h-14 text-amber-400" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs font-bold text-white">
                      <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[11px]">
                        {book.pageCount} صفحة
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white dark:text-black font-black text-[11px]">
                        معاينة {book.previewPagesCount} صفحات
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Category & Subject Tag */}
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 text-[10.5px]">
                          {book.category}
                        </span>
                        <span className="text-zinc-500 text-[11px] font-mono">
                          {book.salesCount} طالب اشترى
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-amber-500 transition-colors">
                        {book.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {book.shortDescription || book.description}
                      </p>
                    </div>

                    {/* INSTRUCTOR AVATAR & NAME (The requested visual feature) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shrink-0 shadow-md">
                          <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center text-xs font-black text-amber-300">
                            {authorAvatar ? (
                              <img src={authorAvatar} alt={book.authorName || ''} className="w-full h-full object-cover" />
                            ) : (
                              <span>{book.authorName?.[0] || 'م'}</span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 text-right">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                            {book.authorName || 'المحاضر المعتمد'}
                          </span>
                          <span className="text-[10px] text-zinc-500 block truncate">
                            {book.academicSubject || 'عضو هيئة التدريس'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{book.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        {book.isFree || book.price === 0 ? (
                          <span className="text-base sm:text-lg font-black text-emerald-500 font-mono">مجاناً </span>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-slate-900 dark:text-amber-400 font-mono">
                              {book.price} ج.م
                            </span>
                            {book.compareAtPrice && (
                              <span className="text-xs line-through text-zinc-400 font-mono">
                                {book.compareAtPrice}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/books/${book.slug}`}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-amber-500 hover:text-white dark:text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-xs"
                          title="عرض تفاصيل المذكرة والقارئ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة وقراءة</span>
                        </Link>

                        {isPurchased ? (
                          <Link
                            href={`/books/${book.slug}`}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>مكتبتك</span>
                          </Link>
                        ) : book.isFree ? (
                          <Link
                            href={`/books/${book.slug}`}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>قراءة الآن</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout?bookId=${book.id}`}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white dark:text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            <span>شراء</span>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. SEARCH, LIVE CATEGORIES & SORTING CONTROLS
         ========================================================================= */}
      <div id="catalog-grid" className="space-y-6 pt-4 scroll-mt-24">
        
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المذكرة، المحاضر، المادة الدراسية (مثال: هندسة البرمجيات، هياكل البيانات، الرياضيات)..."
              className="w-full pl-10 pr-11 py-4 rounded-2xl bg-white dark:bg-[#130e28] border-2 border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-500 transition-all shadow-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort & Price Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            
            {/* Price Filter Pill Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#130e28] p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <button
                type="button"
                onClick={() => setPriceFilter('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  priceFilter === 'ALL'
                    ? 'bg-amber-500 text-white dark:text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setPriceFilter('PAID')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  priceFilter === 'PAID'
                    ? 'bg-amber-500 text-white dark:text-black shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                مدفوعة 
              </button>
              <button
                type="button"
                onClick={() => setPriceFilter('FREE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  priceFilter === 'FREE'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-white'
                }`}
              >
                مجانية 
              </button>
            </div>

            {/* Sorting Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-[#130e28] border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:border-amber-500 cursor-pointer shadow-xs"
            >
              <option value="POPULAR">الأكثر مبيعاً ورواجاً</option>
              <option value="RATING">الأعلى تقييماً</option>
              <option value="NEWEST">الأحدث نزولاً</option>
              <option value="PRICE_ASC">السعر: من الأقل للأعلى</option>
            </select>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white dark:text-black font-black border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-[#130e28] border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  isSelected ? 'bg-zinc-950/20 text-white dark:text-black' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. MAIN EXPANSIVE BOOKS CATALOG GRID (With Instructor Avatar & 3D Cover)
         ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-3.5">
          <span className="flex items-center gap-2 text-slate-800 dark:text-zinc-200">
            <BookMarked className="w-4 h-4 text-amber-500" />
            <span>عرض <strong>{filteredBooks.length}</strong> مذكرة وكتاب دراسي</span>
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>كافة الملفات محمية بنظام الـ DRM</span>
          </span>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredBooks.map((book) => {
              const isPurchased = purchasedBookIds.includes(book.id);
              const discount = book.compareAtPrice && book.compareAtPrice > book.price
                ? Math.round(((book.compareAtPrice - book.price) / book.compareAtPrice) * 100)
                : null;
              const authorAvatar = getAuthorAvatar(book);

              return (
                <div
                  key={book.id}
                  className="group relative flex flex-col rounded-[28px] bg-white dark:bg-[#110d24] border border-slate-200 dark:border-zinc-800/90 hover:border-amber-500/60 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden justify-between"
                >
                  {/* Cover Section with Realistic 3D Spine and Shine */}
                  <div className="relative h-52 sm:h-56 w-full bg-slate-950 overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950 text-white">
                        <BookOpen className="w-14 h-14 text-amber-400" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Category Pill Top-Right */}
                    <div className="absolute top-3.5 right-3.5">
                      <span className="text-[10.5px] font-black px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-400 border border-amber-500/40 shadow-xs">
                        {book.category}
                      </span>
                    </div>

                    {/* Discount Badge Top-Left */}
                    {discount && (
                      <div className="absolute top-3.5 left-3.5">
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-md">
                          خصم {discount}%
                        </span>
                      </div>
                    )}

                    {/* Bottom Stats: Pages & Preview Limit */}
                    <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-xs font-bold text-white">
                      <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-xs font-mono text-[11px] border border-white/10">
                        {book.pageCount} صفحة
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white dark:text-black font-black text-[11px] shadow-sm">
                        معاينة {book.previewPagesCount} صفحات
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-2.5">
                      {/* Subject / Level */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold">
                        <span className="text-amber-600 dark:text-amber-400 font-black">{book.academicSubject || 'تخصص هندسي'}</span>
                        <span className="text-zinc-500 text-[10.5px]">{book.academicLevel}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {book.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {book.shortDescription || book.description}
                      </p>
                    </div>

                    {/* INSTRUCTOR AVATAR & NAME (The requested visual feature) */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-[1.5px] shrink-0 shadow-xs">
                          <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center text-[11px] font-black text-amber-300">
                            {authorAvatar ? (
                              <img src={authorAvatar} alt={book.authorName || ''} className="w-full h-full object-cover" />
                            ) : (
                              <span>{book.authorName?.[0] || 'م'}</span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 text-right">
                          <span className="text-xs font-black text-slate-800 dark:text-zinc-200 truncate block">
                            {book.authorName || 'المحاضر المعتمد'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{book.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {/* Price */}
                      <div>
                        {book.isFree || book.price === 0 ? (
                          <span className="text-base font-black text-emerald-500 font-mono">
                            مجاناً 
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-900 dark:text-amber-400 font-mono">
                              {book.price} ج.م
                            </span>
                            {book.compareAtPrice && (
                              <span className="text-xs line-through text-zinc-400 font-mono">
                                {book.compareAtPrice}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* CTAs */}
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/books/${book.slug}`}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-white dark:text-black hover:bg-amber-500 transition-all font-bold text-xs flex items-center gap-1"
                          title="عرض تفاصيل المذكرة والقارئ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">معاينة وقراءة</span>
                        </Link>

                        {isPurchased ? (
                          <Link
                            href={`/books/${book.slug}`}
                            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>مكتبتك</span>
                          </Link>
                        ) : book.isFree ? (
                          <Link
                            href={`/books/${book.slug}`}
                            className="px-3.5 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-md"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>قراءة</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout?bookId=${book.id}`}
                            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-white dark:text-black font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>شراء</span>
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-14 text-center rounded-[32px] bg-white dark:bg-[#120d28] border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-3xl">
              
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              لا توجد مذكرات مطابقة لخيارات البحث
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              جرب تغيير كلمات البحث أو اختيار تصنيف مختلف من القائمة أعلاه.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setPriceFilter('ALL');
              }}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 text-white dark:text-black font-black text-xs shadow-md cursor-pointer"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. PUBLISHER REVENUE INVITATION (كن ناشراً معتمداً)
         ========================================================================= */}
      <div className="relative rounded-[36px] overflow-hidden p-8 sm:p-12 border border-purple-500/30 bg-slate-950 dark:bg-gradient-to-r dark:from-[#110c26] dark:via-[#1a1238] dark:to-[#110c26] text-white shadow-2xl text-center sm:text-right flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>برنامج شراكة المحتوى والمذكرات</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
            هل أنت محاضر متميز أو طالب متفوق؟ انشر مذكراتك واربح 85%!
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
            ارفع كتبك ومذكراتك وملخصاتك الآن، وتمتع بحماية مشددة ضد التحميل والنسخ (DRM Shield) مع استلام أرباحك دورياً وبناء جمهورك الطلابي والمهني.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href="/instructor/books/new"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-white dark:text-black" />
            <span>نشر مذكرة جديدة الآن</span>
          </Link>

          <Link
            href="/instructors/join?track=expert"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs sm:text-sm border border-white/20 transition-all text-center"
          >
            <span>شروط الانضمام كـ ناشر</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

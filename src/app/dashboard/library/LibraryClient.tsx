'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Shield,
  Star,
  CheckCircle,
  Eye,
  Search,
  ArrowRight,
  Layers,
  FileText
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
  price: number;
  isFree: boolean;
  authorName?: string | null;
  academicSubject?: string | null;
  academicLevel?: string | null;
  category: string;
  rating: number;
  purchasedAt?: string;
  instructor?: {
    id: string;
    officialFullName: string;
    firstName: string;
  };
}

interface Props {
  purchasedBooks: BookItem[];
  freeBooks: BookItem[];
  currentUser: {
    id: string;
    officialFullName: string;
    phone?: string | null;
    username: string;
  };
}

export default function LibraryClient({
  purchasedBooks,
  freeBooks,
  currentUser,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PURCHASED' | 'FREE'>('PURCHASED');

  const displayedBooks = (activeTab === 'PURCHASED' ? purchasedBooks : freeBooks).filter((book) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      (book.authorName || '').toLowerCase().includes(q) ||
      (book.academicSubject || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>حساب الطالب المعتمد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            مكتبتي الرقمية (المذكرات والكتب)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            جميع المذكرات والكتب المشترك بها جاهزة للقراءة الآمنة في أي وقت.
          </p>
        </div>

        <Link
          href="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <BookOpen className="w-4 h-4" />
          <span>تصفح سوق المذكرات</span>
        </Link>
      </div>

      {/* 2. CONTROLS: TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('PURCHASED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PURCHASED'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المذكرات المشتراة ({purchasedBooks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FREE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'FREE'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المذكرات المجانية المتاحة ({freeBooks.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في مكتبتي..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* 3. BOOKS GRID */}
      {displayedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedBooks.map((book) => (
            <div
              key={book.id}
              className="group relative flex flex-col rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950 text-white">
                    <BookOpen className="w-10 h-10 text-amber-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    مفعلة
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 left-3 text-[11px] font-bold text-white flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-black/70">
                    {book.pageCount} صفحة
                  </span>
                  <span className="text-amber-400">{book.category}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                    {book.academicSubject || 'عام'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                    {book.shortDescription || book.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-slate-600 dark:text-zinc-400">
                    {book.authorName || 'المحاضر'}
                  </span>
                  <Link
                    href={`/books/${book.slug}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>فتح وقراءة</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
           
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {activeTab === 'PURCHASED' ? 'لم تقم بشراء أي مذكرات بعد' : 'لا توجد مذكرات مجانية مطابقة'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            تصفح سوق المذكرات الآن واختر من بين عشرات المراجع والملخصات الدراسية المعتمدة.
          </p>
          <div className="pt-2">
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs"
            >
              <span>تصفح سوق المذكرات</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

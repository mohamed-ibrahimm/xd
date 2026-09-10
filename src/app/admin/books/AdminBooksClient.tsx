'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Search,
  BookOpen,
  DollarSign,
  User,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';

interface Props {
  initialBooks: any[];
}

export default function AdminBooksClient({ initialBooks }: Props) {
  const [books, setBooks] = useState<any[]>(initialBooks);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stats calculation
  const pendingCount = books.filter((b) => b.status === 'PENDING_REVIEW').length;
  const publishedCount = books.filter((b) => b.status === 'PUBLISHED').length;
  const rejectedCount = books.filter((b) => b.status === 'REJECTED').length;

  const handleUpdateStatus = async (bookId: string, newStatus: string) => {
    setActionLoadingId(bookId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/books', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookId, status: newStatus }),
      });
      const data = await res.json();

      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: newStatus } : b))
        );
        setMessage({
          type: 'success',
          text: newStatus === 'PUBLISHED'
            ? 'تم اعتماد ونشر المذكرة بنجاح في المكتبة العامة!'
            : 'تم تحديث حالة المذكرة إلى مرفوضة.'
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تحديث حالة المذكرة' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالخادم' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (bookId: string, title: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف مذكرة "${title}" نهائياً من النظام؟`)) return;

    setActionLoadingId(bookId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/books?id=${bookId}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        setMessage({ type: 'success', text: `تم حذف مذكرة "${title}" بنجاح.` });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل حذف المذكرة' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesTab = activeTab === 'ALL' || book.status === activeTab;
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      book.title?.toLowerCase().includes(q) ||
      book.authorName?.toLowerCase().includes(q) ||
      book.academicSubject?.toLowerCase().includes(q) ||
      book.instructor?.officialFullName?.toLowerCase().includes(q) ||
      book.instructor?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة الإدارة • مركز مراجعة واعتماد المذكرات والكتب الرقمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            قائمة مراجعة واعتماد المذكرات (DRM Shield)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            راجع المذكرات المرفوعة من المحاضرين، اعتمد نشرها في المكتبة، أو ارفضها مع إدارة الأسعار ونظام الحماية.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/instructor/books/new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>نشر مذكرة جديدة</span>
          </Link>
        </div>
      </div>

      {/* 2. Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-md ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('PENDING_REVIEW')}
          className={`p-5 rounded-3xl border shadow-sm space-y-2 cursor-pointer transition-all ${
            activeTab === 'PENDING_REVIEW'
              ? 'bg-amber-500/15 border-amber-500 shadow-amber-500/10'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
            <span>بانتظار المراجعة</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {pendingCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('PUBLISHED')}
          className={`p-5 rounded-3xl border shadow-sm space-y-2 cursor-pointer transition-all ${
            activeTab === 'PUBLISHED'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-emerald-500/10'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <span>معتمدة ومنشورة</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {publishedCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('REJECTED')}
          className={`p-5 rounded-3xl border shadow-sm space-y-2 cursor-pointer transition-all ${
            activeTab === 'REJECTED'
              ? 'bg-rose-500/15 border-rose-500 shadow-rose-500/10'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold">
            <span>مذكرات مرفوضة</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {rejectedCount}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-5 rounded-3xl border shadow-sm space-y-2 cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'bg-purple-500/15 border-purple-500 shadow-purple-500/10'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-bold">
            <span>إجمالي المذكرات</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {books.length}
          </div>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-[#E94F9F] dark:text-[#080808] font-black shadow-md shadow-pink-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            الكل ({books.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING_REVIEW')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING_REVIEW'
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>بانتظار الاعتماد ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PUBLISHED')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PUBLISHED'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المنشورة بالمكتبة ({publishedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REJECTED')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REJECTED'
                ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>المرفوضة ({rejectedCount})</span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعنوان، المحاضر، أو المادة..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 5. Books Review Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3">
          <FileText className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">لا توجد مذكرات في هذا القسم</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {searchQuery ? 'لم يتم العثور على نتائج تطابق بحثك.' : 'لا توجد مذكرات حالياً تحت هذا التصنيف.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isLoading = actionLoadingId === book.id;

            return (
              <div
                key={book.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Status Badge & Category */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      {book.category || 'ملخصات'} • {book.pageCount} صفحة
                    </span>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                        book.status === 'PUBLISHED'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : book.status === 'PENDING_REVIEW'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {book.status === 'PUBLISHED'
                        ? 'منشورة ومعتمدة'
                        : book.status === 'PENDING_REVIEW'
                        ? 'قيد المراجعة والاعتماد'
                        : 'مرفوضة'}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      <span>بواسطة: {book.authorName || book.instructor?.officialFullName || 'محاضر'}</span>
                    </p>
                  </div>

                  {/* Academic Info */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-300 flex items-center justify-between">
                    <span>المادة: <strong>{book.academicSubject || 'عام'}</strong></span>
                    <span>المستوى: <strong>{book.academicLevel || 'كافة المستويات'}</strong></span>
                  </div>

                  {/* Price & Purchases */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                      {book.isFree || book.price === 0 ? 'مجانية' : `${book.price} ج.م`}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {book.purchases?.length || book.salesCount || 0} عملية شراء وقراءة
                    </span>
                  </div>
                </div>

                {/* 6. Review & Approval Action Buttons */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    {/* Approve Button */}
                    <button
                      type="button"
                      disabled={isLoading || book.status === 'PUBLISHED'}
                      onClick={() => handleUpdateStatus(book.id, 'PUBLISHED')}
                      className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{book.status === 'PUBLISHED' ? 'معتمدة بالفعل' : 'اعتماد ونشر بالمكتبة'}</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      type="button"
                      disabled={isLoading || book.status === 'REJECTED'}
                      onClick={() => handleUpdateStatus(book.id, 'REJECTED')}
                      className="py-2.5 px-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer"
                      title="رفض النشر"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* DRM Preview Link */}
                    <Link
                      href={`/books/${book.slug}`}
                      target="_blank"
                      className="flex-1 py-2 rounded-2xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-800 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>معاينة في قارئ DRM</span>
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleDelete(book.id, book.title)}
                      className="p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

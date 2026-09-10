'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDuration, formatDate } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  ExternalLink,
  Search,
  Users,
  Layers,
  Video
} from 'lucide-react';

interface AdminCoursesClientProps {
  initialCourses: any[];
}

export default function AdminCoursesClient({ initialCourses }: AdminCoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Course Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    price: 1000,
    durationHours: 25,
    level: 'ALL',
  });
  const [modalError, setModalError] = useState<string | null>(null);

  const handleDeleteCourse = async () => {
    if (!deletingCourse || isDeleting) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/courses?id=${deletingCourse.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
        setMessage({ type: 'success', text: data.message || 'تم حذف الكورس بنجاح.' });
        setDeletingCourse(null);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل حذف الكورس' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالخادم' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) {
      setModalError('يرجى كتابة عنوان الكورس أولاً');
      return;
    }
    if (isCreating) return;

    setIsCreating(true);
    setMessage(null);
    setModalError(null);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCourse),
      });

      const data = await res.json();
      if (res.ok && data.course) {
        setCourses((prev) => [
          {
            ...data.course,
            instructor: data.course.instructor || { officialFullName: 'الإدارة' },
            category: null,
            _count: data.course._count || { sections: 1, enrollments: 0 },
            sections: data.course.sections || [],
          },
          ...prev,
        ]);
        setMessage({ type: 'success', text: 'تم إنشاء ونشر الكورس بنجاح!' });
        setShowAddModal(false);
        setModalError(null);
        setNewCourse({
          title: '',
          shortDescription: '',
          description: '',
          thumbnail: '',
          price: 1000,
          durationHours: 25,
          level: 'ALL',
        });
        router.refresh();
      } else {
        const err = data.error || 'فشل إنشاء الكورس';
        setModalError(err);
        setMessage({ type: 'error', text: err });
      }
    } catch (e) {
      const err = 'حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة ثانية';
      setModalError(err);
      setMessage({ type: 'error', text: err });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = c.title?.toLowerCase().includes(q);
    const matchInstructor = c.instructor?.officialFullName?.toLowerCase().includes(q);
    const matchCategory = c.category?.name?.toLowerCase().includes(q);
    return matchTitle || matchInstructor || matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            إدارة الكورسات والمقررات التدريبية (لوحة الإدارة)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            إضافة دورات جديدة، حذف الكورسات غير المرغوبة، ومتابعة الطلاب والمحتوى
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-primary-900/30 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كورس جديد</span>
          </button>
          <div className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-primary-950 border border-indigo-200 dark:border-primary-800 text-indigo-700 dark:text-primary-300 text-xs font-bold">
            إجمالي الكورسات: {courses.length}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
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
          <button onClick={() => setMessage(null)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الكورس، المحاضر، أو التصنيف..."
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500 shadow-sm"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 font-bold">
                <th className="p-4">الكورس</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">المحاضر</th>
                <th className="p-4">السعر</th>
                <th className="p-4">الطلاب المشتركين</th>
                <th className="p-4">الوحدات والدروس</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 dark:text-zinc-500">
                    لا توجد كورسات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <Link href={`/courses/${c.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {c.title}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">{c.category?.name || '-'}</td>
                    <td className="p-4 text-slate-700 dark:text-zinc-300 font-medium">{c.instructor?.officialFullName || 'الإدارة'}</td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-primary-300 font-mono">{formatPrice(c.price)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{c._count?.enrollments || 0} طالب</td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">{c._count?.sections || 0} وحدات</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                        {c.status === 'PUBLISHED' ? 'منشور ونشط' : 'مسودة'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/instructor/courses/${c.id}/curriculum`}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
                          title="إدارة الفيديوهات والمنهج التعليمي"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>المنهج والفيديوهات </span>
                        </Link>

                        <Link
                          href={`/courses/${c.slug}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-surface-raised dark:hover:bg-surface-card text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title="معاينة صفحة الكورس"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setDeletingCourse(c)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center gap-1"
                          title="حذف الكورس"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111113] border border-rose-300 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد حذف الكورس (صلاحية الإدارة) </h3>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">إجراء لا يمكن التراجع عنه</span>
                </div>
              </div>
              <button
                onClick={() => !isDeleting && setDeletingCourse(null)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-white/[0.04] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <p>
                هل أنت متأكد من رغبتك في حذف الكورس التالي نهائياً من المنصة: <br />
                <strong className="text-slate-900 dark:text-white text-sm block mt-1">"{deletingCourse.title}"</strong>
              </p>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] pt-1">
                سيتم مسح كافة الأقسام، الدروس، الفيديوهات، والاختبارات التقييمية المسجلة تحته.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCourse(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                إلغاء وتراجع
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCourse}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/50 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'جاري الحذف...' : 'نعم، احذف الكورس'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span>إضافة كورس جديد (Admin)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{modalError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">عنوان الكورس *</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="مثال: هندسة البرمجيات والتطبيقات السحابية"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">نبذة تسويقية قصيرة</label>
                <input
                  type="text"
                  value={newCourse.shortDescription}
                  onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                  placeholder="نبذة مختصرة للكورس"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">الوصف التفصيلي (اختياري)</label>
                <textarea
                  rows={3}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="تفاصيل محتوى الكورس (يمكن تركه فارغاً وسيتم وضع وصف افتراضي)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">الساعات</label>
                  <input
                    type="number"
                    value={newCourse.durationHours}
                    onChange={(e) => setNewCourse({ ...newCourse, durationHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">المستوى</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="BEGINNER">مبتدئ</option>
                    <option value="INTERMEDIATE">متوسط</option>
                    <option value="ADVANCED">متقدم</option>
                    <option value="ALL">كافة المستويات</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-raised text-xs font-bold text-slate-700 dark:text-zinc-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'جاري الإنشاء...' : 'نشر الكورس'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
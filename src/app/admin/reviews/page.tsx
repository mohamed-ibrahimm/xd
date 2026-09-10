'use client';

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, ShieldCheck, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    courseId: '',
    rating: 5,
    comment: '',
    reviewerName: '',
  });

  const loadData = async () => {
    try {
      const [revRes, crsRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/courses'),
      ]);
      const revData = await revRes.json();
      const crsData = await crsRes.json();
      setReviews(revData.reviews || []);
      setCourses(crsData.courses || []);
      if (crsData.courses?.length > 0 && !formData.courseId) {
        setFormData((prev) => ({ ...prev, courseId: crsData.courses[0].id }));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.comment.trim()) {
      setError('يرجى اختيار الكورس وكتابة نص التقييم');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل إضافة التقييم');
      } else {
        setMessage('تمت إضافة التقييم للكورس بنجاح! ');
        setFormData({ ...formData, comment: '', reviewerName: '' });
        loadData();
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟')) return;

    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {}
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto py-20 text-center text-xs text-zinc-400">جاري تحميل إدارة التقييمات...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            إدارة التقييمات والمراجعات (Course Ratings & Reviews)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            إضافة تقييمات يدوية للكورسات، مراجعة آراء الطلاب، وتعديل أو حذف التقييمات من قاعدة البيانات.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Review Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-500" />
          إضافة تقييم يدوي جديد لكورس (Manual Course Rating)
        </h3>

        <form onSubmit={handleAddReview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">اختر الكورس المستهدف</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">عدد النجوم (التقييم)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value={5}> (5 نجوم - ممتاز)</option>
                <option value={4}> (4 نجوم - جيد جداً)</option>
                <option value={3}> (3 نجوم - جيد)</option>
                <option value={2}> (نجمتان)</option>
                <option value={1}> (نجمة واحدة)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نص التقييم والمراجعة</label>
            <textarea
              rows={2}
              required
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="اكتب انطباع الطالب أو المراجعة المكتوبة حول الشرح والتطبيقات العملية..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'جاري الحفظ...' : 'إضافة التقييم للكورس'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Reviews List */}
      <div className="rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border overflow-hidden shadow-xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>التقييمات الحالية في المنصة ({reviews.length})</span>
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 text-center py-8">لا توجد تقييمات مسجلة حالياً.</p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {r.user?.officialFullName || `${r.user?.firstName || 'طالب'} ${r.user?.lastName || ''}`}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-500">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-300">{r.comment}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteReview(r.id)}
                  className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 dark:text-rose-400 transition-colors shrink-0 cursor-pointer"
                  title="حذف التقييم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

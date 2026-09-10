'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Save, ShieldCheck, Layout, Type, Megaphone, HelpCircle } from 'lucide-react';

export default function MagicContentEditorPage() {
  const router = useRouter();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setContent(data.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        setMessage('تم حفظ كافة نصوص وبنرات الموقع بنجاح! تم التحديث فورياً دون لمس الكود ');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: content }));
        }
        router.refresh();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (e) {
      setMessage('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-xs text-zinc-400">جاري تحميل محرر الموقع السحري...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام الإدارة اللحظية للواجهات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            محرر الموقع السحري (Magic Content Editor)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            عدل أي نص أو عنوان أو بنر ترويجي أو أزرار في الموقع بالكامل بنقرة واحدة ودون الحاجة لتعديل الكود البرمجي.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner Bar Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-purple-900/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
              <Megaphone className="w-4 h-4" />
              <span>شريط الإعلانات والبنر الترويجي العلوي</span>
            </div>
            <select
              value={content.BANNER_ENABLED || 'true'}
              onChange={(e) => handleChange('BANNER_ENABLED', e.target.value)}
              className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="true">مفعل في أعلى الموقع</option>
              <option value="false">معطل (مخفي)</option>
            </select>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نص البنر الترويجي</label>
              <input
                type="text"
                value={content.BANNER_TEXT || 'خصم استثنائي 50% لفترة محدودة على جميع المسارات والدبلومات الهندسية '}
                onChange={(e) => handleChange('BANNER_TEXT', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-500 dark:text-amber-400">
            <Layout className="w-4 h-4" />
            <span>نصوص الواجهة الرئيسية (Hero Section)</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">الشارة الترحيبية (Badge)</label>
              <input
                type="text"
                value={content.HERO_BADGE || 'أكاديمية تدريبية هندسية معتمدة'}
                onChange={(e) => handleChange('HERO_BADGE', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">العنوان الرئيسي العريض (Hero Title)</label>
              <input
                type="text"
                value={content.HERO_TITLE || 'بناء وتأهيل الكوادر الهندسية والبرمجية لسوق العمل'}
                onChange={(e) => handleChange('HERO_TITLE', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">الوصف التفصيلي (Hero Subtitle)</label>
              <textarea
                rows={3}
                value={content.HERO_SUBTITLE || 'منهج عملي مكثف يركز على مشاريع الإنتاج الحقيقية، مع اختبارات تقييمية ومتابعة دورية وشهادات معتمدة.'}
                onChange={(e) => handleChange('HERO_SUBTITLE', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نص الزر الأساسي (Primary CTA)</label>
                <input
                  type="text"
                  value={content.HERO_CTA_PRIMARY || 'تصفح دليل الكورسات'}
                  onChange={(e) => handleChange('HERO_CTA_PRIMARY', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نص الزر الثانوي (Secondary CTA)</label>
                <input
                  type="text"
                  value={content.HERO_CTA_SECONDARY || 'الدبلومات الشاملة'}
                  onChange={(e) => handleChange('HERO_CTA_SECONDARY', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <Type className="w-4 h-4" />
            <span>الدبلومة الأكثر طلباً والترويج الرئيسي</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">عنوان شارة التميز</label>
              <input
                type="text"
                value={content.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً في سوق العمل '}
                onChange={(e) => handleChange('FEATURED_DIPLOMA_BADGE', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Slug الدبلومة المستهدفة</label>
              <input
                type="text"
                value={content.FEATURED_DIPLOMA_SLUG || 'nextjs-fullstack-diploma'}
                onChange={(e) => handleChange('FEATURED_DIPLOMA_SLUG', e.target.value)}
                placeholder="nextjs-fullstack-diploma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">نصوص الفوتر وحقوق الملكية</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نبذة الفوتر (Footer Tagline)</label>
              <textarea
                rows={2}
                value={content.PLATFORM_TAGLINE || 'المنصة العربية الأولى المتخصصة في بناء وتأهيل الكوادر البرمجية والهندسية لسوق العمل بأعلى المعايير الاحترافية ومشاريع الإنتاج الفعلية.'}
                onChange={(e) => handleChange('PLATFORM_TAGLINE', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">حقوق الملكية والنشر</label>
              <input
                type="text"
                value={content.COPYRIGHT_TEXT || 'جميع الحقوق محفوظة © 2026 أكاديمية قِمَم للتعليم الهندسي'}
                onChange={(e) => handleChange('COPYRIGHT_TEXT', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs shadow-xl shadow-amber-950/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري حفظ التعديلات السحرية...' : 'حفظ التعديلات اللحظية في الموقع'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

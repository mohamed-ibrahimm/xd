'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Settings,
  Save,
  ShieldCheck,
  CreditCard,
  Mail,
  Bot,
  Smartphone,
  MessageCircle,
  Facebook,
  Send,
  Youtube,
  Linkedin,
  Tag,
  DollarSign,
  GraduationCap,
  Building,
  Type,
  FileText,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  Megaphone,
  CheckCircle2,
  Lock,
  Globe,
  HelpCircle,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'all' | 'pricing' | 'content' | 'contacts' | 'payments' | 'workflow'>(
    (requestedTab as any) || 'pricing'
  );

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetch('/api/admin/settings', {
      credentials: 'include',
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || {}))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessageType('success');
        setMessage('تم حفظ وتحديث كافة أسعار الباقات ونصوص المنصة والإعدادات بنجاح!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('platform-settings-updated', { detail: settings }));
          localStorage.setItem('platform_name', settings.PLATFORM_NAME || '');
        }
        router.refresh();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessageType('error');
        setMessage(data.error || 'فشل حفظ الإعدادات، يرجى التحقق من الصلاحيات.');
      }
    } catch (e) {
      setMessageType('error');
      setMessage('حدث خطأ في الاتصال بالخادم، يرجى المحاولة ثانية.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-zinc-400">جاري تحميل إعدادات المنصة والأسعار...</div>;
  }

  const tabs = [
    { id: 'pricing', label: 'أسعار باقات واشتراكات المحاضرين', icon: DollarSign, badge: 'SaaS' },
    { id: 'content', label: 'التحكم بكلام ونصوص صفحات المنصة (CMS)', icon: Type, badge: 'محرر' },
    { id: 'contacts', label: 'الهوية والسوشيال وقنوات التواصل', icon: MessageCircle },
    { id: 'payments', label: 'حسابات الدفع (InstaPay وفودافون كاش)', icon: CreditCard },
    { id: 'workflow', label: 'مسار التعلم والحماية والعلامة المائية', icon: ShieldCheck },
    { id: 'all', label: 'عرض كافة الإعدادات', icon: Layers },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>لوحة التحكم الشاملة لإدارة المنصة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            إعدادات المنصة وأسعار الباقات ومحرر النصوص
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            تحكم كامل بأسعار باقات المدرسين والطلبة، وتعديل أي كلمة أو عنوان يظهر في أي صفحة على المنصة لحظياً.
          </p>
        </div>

        {/* Quick Top Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          messageType === 'success'
            ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/70 border-rose-800 text-rose-300'
        }`}>
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-surface dark:hover:bg-surface-raised dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* =========================================================================
            TAB 1: PRICING & SUBSCRIPTION PACKAGES
           ========================================================================= */}
        {(activeTab === 'pricing' || activeTab === 'all') && (
          <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-indigo-900/50 space-y-6 animate-in fade-in shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                <DollarSign className="w-5 h-5" />
                <span>التحكم في أسعار باقات واشتراكات استوديو المحاضرين (SaaS Pricing)</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                تطبق الأسعار فورياً في صفحة الانضمام والاستوديو وبوابة الدفع
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Regular Monthly Price */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>سعر الباقة الشهرية للمدرسين والدكاترة (ج.م) *</span>
                  <span className="text-[10px] text-indigo-400">شهرياً</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={settings.INSTRUCTOR_PRICE_MONTHLY ?? '290'}
                    onChange={(e) => handleChange('INSTRUCTOR_PRICE_MONTHLY', e.target.value)}
                    placeholder="290"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">ج.م / شهر</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  قيمة التجديد الشهري للمدرس أو الدكتور الجامعي (الافتراضي: 290 ج.م)
                </p>
              </div>

              {/* Regular Annual Price */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-indigo-500/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>سعر الباقة السنوية للمدرسين والدكاترة (ج.م) *</span>
                  <span className="text-[10px] text-emerald-400 font-bold">وفر شهرين</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={settings.INSTRUCTOR_PRICE_ANNUAL ?? '1499'}
                    onChange={(e) => handleChange('INSTRUCTOR_PRICE_ANNUAL', e.target.value)}
                    placeholder="1499"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-indigo-500/50 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">ج.م / سنة</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  سعر الاشتراك السنوي الكامل (الافتراضي: 1,499 ج.م أو 2,900 ج.م)
                </p>
              </div>

              {/* Student Plan Price */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-amber-500/40 space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>سعر باقة المحاضر الطالب المدعومة (ج.م) *</span>
                  <span className="text-[10px] text-amber-400 font-bold">منحة مخفضة</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={settings.INSTRUCTOR_PRICE_STUDENT ?? '120'}
                    onChange={(e) => handleChange('INSTRUCTOR_PRICE_STUDENT', e.target.value)}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-amber-500/50 text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">ج.م / شهر</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  السعر المدعوم لطلبة الجامعات والمدارس بعد انتهاء الشهر المجاني (الافتراضي: 120 ج.م)
                </p>
              </div>

              {/* Student Maximum Age */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>الحد الأقصى لسن باقة المحاضر الطالب (سنة) *</span>
                  <span className="text-[10px] text-zinc-400">شرط العمر</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="16"
                    max="35"
                    value={settings.STUDENT_MAX_AGE ?? '22'}
                    onChange={(e) => handleChange('STUDENT_MAX_AGE', e.target.value)}
                    placeholder="22"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">سنة</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  أي مستخدم يتجاوز هذا السن يُمنع من تفعيل باقة الطالب ويُلزم بالباقة العادية
                </p>
              </div>

              {/* Student Free Trial Duration */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>أيام التجربة المجانية للطالب (أيام) *</span>
                  <span className="text-[10px] text-emerald-400 font-bold">منحة مجانية</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.STUDENT_TRIAL_DAYS ?? '30'}
                    onChange={(e) => handleChange('STUDENT_TRIAL_DAYS', e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">يوم</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  فترة التجربة الكاملة للطالب فور تسجيله وتوثيق دراسته (الافتراضي: 30 يوماً)
                </p>
              </div>

              {/* Regular Instructor Free Trial Duration */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>أيام التجربة المجانية للمدرس والدكتور (أيام) *</span>
                  <span className="text-[10px] text-indigo-400">تجربة عادية</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.INSTRUCTOR_TRIAL_DAYS ?? '14'}
                    onChange={(e) => handleChange('INSTRUCTOR_TRIAL_DAYS', e.target.value)}
                    placeholder="14"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">يوم</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  فترة التجربة الأولية لكبار المدرسين والدكاترة (الافتراضي: 14 يوماً)
                </p>
              </div>

              {/* Platform Commission Percent */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-2">
                <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>عمولة المنصة على مبيعات المحاضرين (%) *</span>
                  <span className="text-[10px] text-emerald-400 font-bold">0% نموذج قمم</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={settings.PLATFORM_COMMISSION_PERCENT ?? '0'}
                    onChange={(e) => handleChange('PLATFORM_COMMISSION_PERCENT', e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  النسبة المقتطعة من مبيعات كورسات المحاضر (موصى بها: 0% كأقوى ميزة تنافسية)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: CMS - CONTROL ALL PAGE TEXTS & HEADLINES
           ========================================================================= */}
        {(activeTab === 'content' || activeTab === 'all') && (
          <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-purple-900/50 space-y-6 animate-in fade-in shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
                <Type className="w-5 h-5" />
                <span>التحكم في كلام ونصوص أي صفحة في المنصة (Platform Pages CMS)</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                أي نص تدخله هنا يظهر فورياً في واجهة المنصة للزوار والطلاب
              </span>
            </div>

            {/* Sub-section A: Homepage & Hero Section Texts */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-4">
              <span className="text-xs font-black text-indigo-300 block flex items-center gap-2">
                <Compass className="w-4 h-4" />
                نصوص الصفحة الرئيسية (Hero Section & Homepage)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    العنوان الرئيسي في الصفحة الأولى (Main Hero Headline)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ابدأ رحلتك التعليمية واحتراف البرمجة والذكاء الاصطناعي"
                    value={settings.HERO_TITLE || ''}
                    onChange={(e) => handleChange('HERO_TITLE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">اتركه فارغاً لاستخدام العنوان التلقائي الافتراضي</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    النص الوصفي تحت العنوان الرئيسي (Hero Subtitle)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="منصة تعليمية متكاملة تقدم دورات احترافية ودبلومات شاملة مع كبار الخبراء والأساتذة..."
                    value={settings.HERO_SUBTITLE || ''}
                    onChange={(e) => handleChange('HERO_SUBTITLE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر الدبلومة المميزة بالهيرو (البادج والتخفيض)
                  </label>
                  <input
                    type="text"
                    value={settings.FEATURED_DIPLOMA_BADGE || 'الدبلومة الأكثر طلباً (خصم 51%)'}
                    onChange={(e) => handleChange('FEATURED_DIPLOMA_BADGE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر سوق ومكتبة المذكرات بالهيرو (عروض وخصومات)
                  </label>
                  <input
                    type="text"
                    value={settings.HERO_BTN_BOOKS || 'سوق المذكرات والكتب (خصم 50% ومعاينة مجانية)'}
                    onChange={(e) => handleChange('HERO_BTN_BOOKS', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر المدرس أو الدكتور الجامعي بالهيرو
                  </label>
                  <input
                    type="text"
                    value={settings.HERO_BTN_EXPERT || 'انضم كـ مدرس أو دكتور (14 يوماً مجاناً • 0% عمولة)'}
                    onChange={(e) => handleChange('HERO_BTN_EXPERT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر المحاضر الطالب بالهيرو
                  </label>
                  <input
                    type="text"
                    value={settings.HERO_BTN_STUDENT || 'اشترك كمحاضر طالب (منحة 30 يوماً مجاناً)'}
                    onChange={(e) => handleChange('HERO_BTN_STUDENT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Promotional Top Banner */}
                <div className="sm:col-span-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>نص شريط الإعلانات الترويجي في أعلى الموقع (Announcement Bar)</span>
                    </label>
                    <select
                      value={settings.BANNER_ENABLED || 'true'}
                      onChange={(e) => handleChange('BANNER_ENABLED', e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-border text-[11px] text-slate-900 dark:text-white"
                    >
                      <option value="true">مفعل (يظهر بأعلى الموقع)</option>
                      <option value="false">معطل (مخفي)</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="مثال: خصم 30% لفترة محدودة على جميع الدبلومات البرمجية! كود: PRO30"
                    value={settings.BANNER_TEXT || ''}
                    onChange={(e) => handleChange('BANNER_TEXT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Sub-section B: Instructors Join Page Texts (/instructors/join) */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-4">
              <span className="text-xs font-black text-amber-300 block flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                نصوص صفحة انضمام المحاضرين والباقات (/instructors/join)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    عنوان كارت المدرس والدكتور الجامعي
                  </label>
                  <input
                    type="text"
                    value={settings.JOIN_EXPERT_CARD_TITLE || 'انضم كـ مدرس أو دكتور جامعي'}
                    onChange={(e) => handleChange('JOIN_EXPERT_CARD_TITLE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    عنوان كارت المحاضر الطالب
                  </label>
                  <input
                    type="text"
                    value={settings.JOIN_STUDENT_CARD_TITLE || 'اشترك كـ محاضر طالب'}
                    onChange={(e) => handleChange('JOIN_STUDENT_CARD_TITLE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص وصف كارت المدرس والدكتور
                  </label>
                  <textarea
                    rows={2}
                    value={settings.JOIN_EXPERT_CARD_DESC || 'مخصص للأساتذة والمحاضرين الذين يرغبون في بناء استوديو تعليمي سحابي مستقل لدفعاتهم مع سيطرة كاملة على المحتوى والأسعار.'}
                    onChange={(e) => handleChange('JOIN_EXPERT_CARD_DESC', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص وصف كارت المحاضر الطالب
                  </label>
                  <textarea
                    rows={2}
                    value={settings.JOIN_STUDENT_CARD_DESC || 'لكل طالب بالكلية أو المدرسة يريد شرح المواد لزملائه؛ نمنحك شهر كامل مجاناً وشارة "طالب معتمد" مع باقة اشتراك مدعومة ومخفضة.'}
                    onChange={(e) => handleChange('JOIN_STUDENT_CARD_DESC', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص شروط إثبات الدراسة الميسرة للطالب
                  </label>
                  <input
                    type="text"
                    value={settings.JOIN_STUDENT_PROOF_TEXT || 'كارنيه كلية أو مدرسة، جدول المحاضرات أو الحصص، أو إثبات قيد للعام الحالي دون الحاجة لبطاقة شخصية'}
                    onChange={(e) => handleChange('JOIN_STUDENT_PROOF_TEXT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Sub-section C: Navigation & Footer Texts */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-surface-raised border border-slate-200 dark:border-border space-y-4">
              <span className="text-xs font-black text-cyan-300 block flex items-center gap-2">
                <Layers className="w-4 h-4" />
                نصوص الهيدر العلوي والفوتر (Header & Footer)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر المدرس في شريط الهيدر
                  </label>
                  <input
                    type="text"
                    value={settings.NAV_EXPERT_BTN_TEXT || 'مدرس أو دكتور جامعي'}
                    onChange={(e) => handleChange('NAV_EXPERT_BTN_TEXT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص زر الطالب في شريط الهيدر
                  </label>
                  <input
                    type="text"
                    value={settings.NAV_STUDENT_BTN_TEXT || 'محاضر طالب'}
                    onChange={(e) => handleChange('NAV_STUDENT_BTN_TEXT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نص حقوق الملكية في أسفل الموقع (Footer Copyright)
                  </label>
                  <input
                    type="text"
                    placeholder="جميع الحقوق محفوظة © أكاديمية م / محمد إبراهيم"
                    value={settings.FOOTER_COPYRIGHT || ''}
                    onChange={(e) => handleChange('FOOTER_COPYRIGHT', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: IDENTITY & SOCIAL CHANNELS
           ========================================================================= */}
        {(activeTab === 'contacts' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in">
            {/* Identity */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-400" />
                <span>الهوية والبيانات العامة للمنصة</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم المنصة الرسمي</label>
                  <input
                    type="text"
                    value={settings.PLATFORM_NAME || ''}
                    onChange={(e) => handleChange('PLATFORM_NAME', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">الشعار التسويقي (Tagline)</label>
                  <input
                    type="text"
                    value={settings.PLATFORM_TAGLINE || ''}
                    onChange={(e) => handleChange('PLATFORM_TAGLINE', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Contact & Social Media Channels */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-cyan-900/40 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>قنوات التواصل السريع وروابط السوشيال ميديا (تظهر فورياً في واجهة الموقع)</span>
                </div>
                <span className="text-[10px] text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08] w-fit">
                  الخانة الفارغة تختفي تلقائياً من الواجهة
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                أدخل أرقامك وحساباتك لتظهر كأيقونات تواصل مباشر للزوار والطلاب في واجهة الموقع (Hero Section) وشريط التواصل وأسفل الموقع.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>رقم الواتساب للتواصل المباشر (WhatsApp)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 01555791568"
                    value={settings.WHATSAPP_NUMBER || ''}
                    onChange={(e) => handleChange('WHATSAPP_NUMBER', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-emerald-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">يفتح محادثة واتساب فورية مباشرة مع الزائر</span>
                </div>

                {/* Email / Gmail */}
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>البريد الإلكتروني / الجيميل (Gmail / Email)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="مثال: mehac196@gmail.com"
                    value={settings.CONTACT_EMAIL || ''}
                    onChange={(e) => handleChange('CONTACT_EMAIL', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-rose-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">يفتح إرسال بريد إلكتروني مباشر</span>
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5" />
                    <span>رابط صفحة أو حساب الفيسبوك (Facebook URL)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://facebook.com/mohammmedibrahim"
                    value={settings.FACEBOOK_URL || ''}
                    onChange={(e) => handleChange('FACEBOOK_URL', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-blue-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Telegram */}
                <div>
                  <label className="block text-xs font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>رابط قناة أو حساب التليجرام (Telegram)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://t.me/yourchannel"
                    value={settings.TELEGRAM_URL || ''}
                    onChange={(e) => handleChange('TELEGRAM_URL', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-sky-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>رابط قناة اليوتيوب (YouTube)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://youtube.com/@yourchannel"
                    value={settings.YOUTUBE_URL || ''}
                    onChange={(e) => handleChange('YOUTUBE_URL', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-red-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>رابط حساب لينكد إن (LinkedIn)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: https://linkedin.com/in/yourprofile"
                    value={settings.LINKEDIN_URL || ''}
                    onChange={(e) => handleChange('LINKEDIN_URL', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-indigo-900/40 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PAYMENT ACCOUNTS (INSTAPAY, VODAFONE CASH, GATEWAYS)
           ========================================================================= */}
        {(activeTab === 'payments' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in">
            {/* InstaPay Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-purple-900/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <CreditCard className="w-4 h-4" />
                <span>إعدادات إنستاباي (InstaPay IPN)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">عنوان الدفع (InstaPay Account)</label>
                  <input
                    type="text"
                    value={settings.INSTAPAY_ACCOUNT || ''}
                    onChange={(e) => handleChange('INSTAPAY_ACCOUNT', e.target.value)}
                    placeholder="qimam.edu@instapay"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">الاسم المعتمد في التحويل</label>
                  <input
                    type="text"
                    value={settings.INSTAPAY_NAME || ''}
                    onChange={(e) => handleChange('INSTAPAY_NAME', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">تعليمات التحويل للطلاب</label>
                <textarea
                  rows={2}
                  value={settings.INSTAPAY_INSTRUCTIONS || ''}
                  onChange={(e) => handleChange('INSTAPAY_INSTRUCTIONS', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Vodafone Cash Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-rose-900/40 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <Smartphone className="w-4 h-4" />
                <span>إعدادات فودافون كاش (Vodafone Cash)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">رقم محفظة فودافون كاش</label>
                  <input
                    type="text"
                    value={settings.VODAFONE_CASH_NUMBER || ''}
                    onChange={(e) => handleChange('VODAFONE_CASH_NUMBER', e.target.value)}
                    placeholder="01012345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">اسم صاحب المحفظة</label>
                  <input
                    type="text"
                    value={settings.VODAFONE_CASH_NAME || ''}
                    onChange={(e) => handleChange('VODAFONE_CASH_NAME', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">تعليمات التحويل للطلاب</label>
                <textarea
                  rows={2}
                  value={settings.VODAFONE_CASH_INSTRUCTIONS || ''}
                  onChange={(e) => handleChange('VODAFONE_CASH_INSTRUCTIONS', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: LEARNING WORKFLOW, SECURITY & WATERMARK
           ========================================================================= */}
        {(activeTab === 'workflow' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in">
            {/* Learning Workflow & Forced Review Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-amber-900/40 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <span>مسار التعلم والتقييم الإجباري</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    التقييم الإجباري بعد الفيديو الثاني
                  </label>
                  <select
                    value={settings.FORCE_REVIEW_SECOND_LESSON || 'true'}
                    onChange={(e) => handleChange('FORCE_REVIEW_SECOND_LESSON', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="true">مفعل (إلزام الطالب بتقييم الكورس بعد إنهاء الدرس الثاني)</option>
                    <option value="false">معطل (اختياري للطالب)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    إلزامية اجتياز الواجب/الكويز قبل الدرس التالي
                  </label>
                  <select
                    value={settings.TASK_PASS_REQUIRED || 'true'}
                    onChange={(e) => handleChange('TASK_PASS_REQUIRED', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="true">مفعل (يجب تحقيق نسبة النجاح للانتقال للدرس التالي)</option>
                    <option value="false">معطل (السماح بالمتابعة)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Watermark & AI Settings */}
            <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">العلامة المائية والذكاء الاصطناعي</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">العلامة المائية على مشغل الفيديو</label>
                  <select
                    value={settings.WATERMARK_ENABLED || 'true'}
                    onChange={(e) => handleChange('WATERMARK_ENABLED', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="true">مفعلة (إظهار اسم الطالب ورقم هاتفه المشفر على الفيديو)</option>
                    <option value="false">معطلة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    نسبة المشاهدة لاحتساب الدرس مكتملاً (%)
                  </label>
                  <select
                    value={settings.LESSON_COMPLETION_THRESHOLD || '80'}
                    onChange={(e) => handleChange('LESSON_COMPLETION_THRESHOLD', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  >
                    <option value="80">80% من مدة الفيديو</option>
                    <option value="90">90% من مدة الفيديو</option>
                    <option value="100">100% (مشاهدة كاملة)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            يتم تطبيق كافة التغييرات فورياً عبر جميع صفحات المنصة.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات الآن'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
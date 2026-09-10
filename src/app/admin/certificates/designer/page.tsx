'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, Save, RefreshCw, Eye, ShieldCheck, Check, Sparkles, GraduationCap } from 'lucide-react';

export default function CertificateDesignerPage() {
  const [templateName, setTemplateName] = useState('القالب الملكي المعتمد لأكاديمية قِمَم');
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [accentColor, setAccentColor] = useState('#fbbf24');
  const [orientation, setOrientation] = useState('LANDSCAPE');

  const [fields, setFields] = useState({
    showLogo: true,
    showQrCode: true,
    showStudentName: true,
    showCourseTitle: true,
    showInstructorName: true,
    showCompletionDate: true,
    showGrade: true,
    showTotalHours: true,
    showCertificateNumber: true,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleField = (key: keyof typeof fields) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          primaryColor,
          accentColor,
          orientation,
          fieldsConfig: fields,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <Link href="/admin" className="text-xs text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white mb-1 block">
            ← العودة للوحة تحكم الإدارة
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            مصمم قوالب الشهادات التفاعلي (Certificate Designer)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            خصص مظهر وهوية الشهادات المعتمدة والمتغيرات الديناميكية مع معاينة حية فورية
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : savedSuccess ? 'تم الحفظ بنجاح! ' : 'حفظ ونشر القالب'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Designer Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">إعدادات القالب</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">اسم القالب</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">اللون الرئيسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-zinc-400">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">لون التمييز (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-zinc-400">{accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Variables Switchers */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">الحقول والمتغيرات الديناميكية</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">تحكم بالعناصر المعروضة داخل الشهادة:</p>

            <div className="space-y-2 pt-2 text-xs">
              {Object.entries({
                showLogo: 'شعار الأكاديمية (Logo)',
                showQrCode: 'رمز الاستجابة السريعة (QR Code)',
                showStudentName: 'اسم الطالب الرسمي {{student_name}}',
                showCourseTitle: 'عنوان الكورس/الدبلومة {{course_name}}',
                showInstructorName: 'اسم المحاضر {{instructor_name}}',
                showCompletionDate: 'تاريخ الإتمام {{completion_date}}',
                showGrade: 'التقدير والدرجة {{grade}}',
                showTotalHours: 'إجمالي الساعات {{total_hours}}',
                showCertificateNumber: 'رقم الشهادة {{certificate_id}}',
              }).map(([key, label]) => {
                const isEnabled = fields[key as keyof typeof fields];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleField(key as keyof typeof fields)}
                    className={`w-full p-2.5 px-3 rounded-xl border text-right flex items-center justify-between transition-colors cursor-pointer ${
                      isEnabled
                        ? 'bg-pink-50 border-pink-400 text-pink-900 font-bold dark:bg-primary-950/50 dark:border-primary-700 dark:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-surface-raised dark:border-border dark:text-zinc-500'
                    }`}
                  >
                    <span>{label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isEnabled ? 'bg-primary-600 border-primary-400' : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isEnabled && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Visual Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
              <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              المعاينة الحية التفاعلية
            </span>
            <span>الأبعاد: قياسي A4 Landscape</span>
          </div>

          {/* Certificate Live Canvas */}
          <div
            className="p-8 sm:p-12 rounded-3xl bg-[#0d0c15] border-4 shadow-2xl relative overflow-hidden space-y-6"
            style={{ borderColor: accentColor }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              {fields.showLogo && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl p-[2px]"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                  >
                    <div className="w-full h-full bg-[#09090b] rounded-[10px] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">أكاديمية قِمَم التعليمية</h3>
                    <p className="text-[10px]" style={{ color: accentColor }}>Qimam Academy</p>
                  </div>
                </div>
              )}

              {fields.showCertificateNumber && (
                <div className="text-left font-mono text-[10px]">
                  <span className="text-zinc-500 block">Certificate ID:</span>
                  <span className="font-bold px-2 py-0.5 rounded border" style={{ color: accentColor, borderColor: accentColor }}>
                    QIMAM-CERT-2026-PREVIEW
                  </span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="text-center space-y-3 py-2">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                شهادة إتمام معتمدة • Certificate of Completion
              </p>
              <p className="text-[11px] text-zinc-400">تشهد إدارة الأكاديمية بأن الطالب:</p>

              {fields.showStudentName && (
                <h2 className="text-2xl sm:text-3xl font-black text-white py-1">
                  أحمد مصطفى كامل إبراهيم
                </h2>
              )}

              <p className="text-xs text-zinc-300">قد أتم بنجاح كافة متطلبات الدورة التدريبية لمقرر:</p>

              {fields.showCourseTitle && (
                <div className="p-2.5 px-5 rounded-xl bg-surface-card border inline-block" style={{ borderColor: primaryColor }}>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    دبلوم تطوير تطبيقات الويب الشاملة بـ Next.js و TypeScript
                  </h3>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-zinc-400">
                {fields.showTotalHours && (
                  <span>إجمالي الساعات: <strong className="text-white">35 ساعة</strong></span>
                )}
                {fields.showGrade && (
                  <span>التقدير: <strong style={{ color: accentColor }}>امتياز (98%)</strong></span>
                )}
                {fields.showCompletionDate && (
                  <span>تاريخ المنح: <strong className="text-white">27 أغسطس 2026</strong></span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs">
              {fields.showQrCode && (
                <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center text-[10px] font-mono text-black">
                  [ QR Code ]
                </div>
              )}

              <div className="flex items-center gap-6 text-center text-[10px]">
                {fields.showInstructorName && (
                  <div>
                    <p className="italic font-bold" style={{ color: accentColor }}>م. محمد طارق</p>
                    <p className="text-zinc-500">المحاضر المعتمد</p>
                  </div>
                )}
                <div>
                  <p className="italic font-bold" style={{ color: accentColor }}>د. عبد الرحمن خالد</p>
                  <p className="text-zinc-500">رئيس مجلس الإدارة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminManualAccessPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    userIdentifier: '',
    courseId: '',
    diplomaId: '',
    duration: 'PERMANENT',
    customDays: '',
    reason: '',
  });

  const loadData = async () => {
    try {
      const [grantsRes, coursesRes] = await Promise.all([
        fetch('/api/admin/manual-access'),
        fetch('/api/admin/courses'),
      ]);
      const grantsData = await grantsRes.json();
      setGrants(grantsData.grants || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load courses/diplomas for dropdown
    fetch('/api/admin/courses')
      .then((r) => r.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => {});
  }, []);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/manual-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('تم منح حق الوصول بنجاح وتفعيل المحتوى للطالب!');
        setFormData({
          userIdentifier: '',
          courseId: '',
          diplomaId: '',
          duration: 'PERMANENT',
          customDays: '',
          reason: '',
        });
        loadData();
      } else {
        setMessage(data.error || 'فشلت العملية');
      }
    } catch (e) {
      setMessage('حدث خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            منح وتمديد الوصول اليدوي للمقررات (Manual Access)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            البحث عن الطلاب ومنح وصول مجاني دائم أو مؤقت (1 يوم، 7 أيام، 30 يوم، أو مخصص) مع تسجيل أمني في سجل التدقيق
          </p>
        </div>
      </div>

      {/* Grant Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          منح وصول جديد لطالب
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleGrantAccess} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              اسم المستخدم أو البريد الإلكتروني للطالب *
            </label>
            <input
              type="text"
              required
              value={formData.userIdentifier}
              onChange={(e) => setFormData({ ...formData, userIdentifier: e.target.value })}
              placeholder="student@qimam.edu أو ahmed_mostafa"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              المقرر التدريبي المطلوب منح الوصول إليه *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="">-- اختر الكورس --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">مدة الصلاحية</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="PERMANENT">دائم مدى الحياة (Permanent)</option>
              <option value="DAYS_1">يوم واحد (24 ساعة تجريبي)</option>
              <option value="DAYS_7">7 أيام (أسبوع)</option>
              <option value="DAYS_30">30 يوماً (شهر)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">السبب / الملاحظات</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="مثال: منحة تدريبية للمتفوقين أو اشتراك ترويجي خاص"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-primary-900/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{saving ? 'جاري المنح...' : 'منح حق الوصول فوراً'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grants History Table */}
      <div className="rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 font-bold">
                <th className="p-4">الطالب</th>
                <th className="p-4">المقرر</th>
                <th className="p-4">المدة الممنوحة</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4">المسؤول الذي منح الوصول</th>
                <th className="p-4">السبب</th>
                <th className="p-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {grants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-zinc-500">
                    لا توجد عمليات منح وصول يدوي سابقة
                  </td>
                </tr>
              ) : (
                grants.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{g.user.officialFullName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{g.user.email}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{g.course?.title || g.diploma?.title}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-bold">
                        {g.accessDuration === 'PERMANENT' ? 'دائم مدى الحياة' : `${g.daysCount} أيام`}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">{g.expiresAt ? formatDate(g.expiresAt) : 'بدون انتهاء'}</td>
                    <td className="p-4 text-slate-700 dark:text-zinc-300">{g.grantedBy.officialFullName}</td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">{g.reason || '-'}</td>
                    <td className="p-4 text-slate-500 dark:text-zinc-500">{formatDate(g.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  Calendar,
  X
} from 'lucide-react';

export default function AdminStudentVerificationsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ title: string; url: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/student-verifications');
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(userId);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/student-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', text: data.message });
        setStudents((prev) =>
          prev.map((s) =>
            s.id === userId
              ? {
                  ...s,
                  studentVerificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                }
              : s
          )
        );
      } else {
        setFeedback({ type: 'error', text: data.error || 'فشل تنفيذ الإجراء' });
      }
    } catch (e) {
      setFeedback({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setActionLoading(null);
    }
  };

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return null;
    const b = new Date(dateStr);
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.officialFullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.studentUniversity || '').toLowerCase().includes(q) ||
      (s.studentFaculty || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[11px] font-black inline-flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            منحة تمكين الشباب وطلبة الجامعات (سن 23 سنة فأقل)
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">طلبات توثيق الطلاب المحاضرين (منحة الـ 30 يوماً مجاناً)</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            راجع إثبات القيد وكارنيه الكلية وتأكد من شرط السن (23 سنة فأقل) لاعتماد باقة الطالب المخفضة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-white">
            إجمالي الطلبات: {students.length}
          </span>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الطالب، الجامعة، الكلية أو البريد الإلكتروني..."
          className="w-full px-4 py-3 pr-10 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 shadow-md"
        />
        <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
            <tr>
              <th className="p-4">الطالب</th>
              <th className="p-4">الجامعة والكلية</th>
              <th className="p-4">العمر والفرقة</th>
              <th className="p-4">إثبات القيد والكارنيه</th>
              <th className="p-4">الحالة الحالية</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  جاري تحميل الطلبات...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-zinc-500">
                  لا توجد أي طلبات توثيق طلابية مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const age = calculateAge(s.studentBirthDate);
                const isAgeCompliant = age !== null && age <= 23;

                return (
                  <tr key={s.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {s.officialFullName || `${s.firstName} ${s.lastName}`}
                      </div>
                      <div className="text-slate-500 dark:text-zinc-500 font-mono text-[11px]">{s.email}</div>
                      {s.phone && <div className="text-slate-500 dark:text-zinc-500 font-mono text-[11px]">{s.phone}</div>}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-zinc-200">{s.studentUniversity || 'غير محدد'}</div>
                      <div className="text-slate-500 dark:text-zinc-400 text-[11px]">{s.studentFaculty || '-'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 dark:text-white font-mono text-sm">{age ?? '-'} سنة</span>
                        {age !== null && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isAgeCompliant ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {isAgeCompliant ? 'مستوفي (<=23)' : 'تجاوز السن'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">{s.studentStudyYear || '-'}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {s.studentIdCardUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImage({
                                title: `مستند إثبات الدراسة: ${s.officialFullName || s.firstName}`,
                                url: s.studentIdCardUrl,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>معاينة إثبات الدراسة</span>
                          </button>
                        )}
                        {s.studentNationalIdUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedImage({
                                title: `بطاقة الرقم القومي: ${s.officialFullName || s.firstName}`,
                                url: s.studentNationalIdUrl,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>البطاقة</span>
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          s.studentVerificationStatus === 'APPROVED'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                            : s.studentVerificationStatus === 'REJECTED'
                            ? 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                            : 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {s.studentVerificationStatus === 'APPROVED'
                          ? 'طالب معتمد '
                          : s.studentVerificationStatus === 'REJECTED'
                          ? 'مرفوض '
                          : 'بانتظار المراجعة '}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {s.studentVerificationStatus !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={actionLoading === s.id}
                            onClick={() => handleAction(s.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                          >
                            قبول وتفعيل 30 يوماً
                          </button>
                        )}
                        {s.studentVerificationStatus !== 'REJECTED' && (
                          <button
                            type="button"
                            disabled={actionLoading === s.id}
                            onClick={() => handleAction(s.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-zinc-800 dark:hover:bg-rose-900/60 text-slate-700 hover:text-rose-700 dark:text-zinc-300 dark:hover:text-rose-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-bold disabled:opacity-50 transition-all cursor-pointer"
                          >
                            رفض
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Image Preview Modal (PORTAL) */}
      {selectedImage && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl p-5 space-y-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedImage.title}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg bg-slate-100 dark:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2">
              <img
                src={selectedImage.url}
                alt="Document Preview"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

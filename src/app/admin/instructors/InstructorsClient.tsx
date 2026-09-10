'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  Users,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface InstructorsClientProps {
  admin: any;
  instructors: any[];
  initialPendingSubscriptions: any[];
}

export default function InstructorsClient({
  admin,
  instructors: initialInstructors,
  initialPendingSubscriptions,
}: InstructorsClientProps) {
  const [instructors, setInstructors] = useState<any[]>(initialInstructors);
  const [pendingSubs, setPendingSubs] = useState<any[]>(initialPendingSubscriptions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  // Manual Extend Modal State
  const [extendingInstructor, setExtendingInstructor] = useState<any | null>(null);
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [isExtending, setIsExtending] = useState(false);

  const handleApproveSubscription = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE_SUBSCRIPTION',
          paymentId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPendingSubs((prev) => prev.filter((p) => p.id !== paymentId));
        setMessage({ type: 'success', text: 'تم تأكيد وتفعيل اشتراك المحاضر بنجاح وإشعاره!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تفعيل الاشتراك' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالخادم' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubscription = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT_SUBSCRIPTION',
          paymentId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPendingSubs((prev) => prev.filter((p) => p.id !== paymentId));
        setMessage({ type: 'success', text: 'تم رفض طلب الاشتراك.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل رفض الطلب' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالخادم' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendingInstructor || isExtending) return;
    setIsExtending(true);
    try {
      const res = await fetch('/api/admin/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MANUAL_UPDATE',
          instructorId: extendingInstructor.id,
          durationMonths: extendMonths,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInstructors((prev) =>
          prev.map((inst) =>
            inst.id === extendingInstructor.id
              ? {
                  ...inst,
                  instructorStatus: 'ACTIVE',
                  subscriptionState: {
                    ...inst.subscriptionState,
                    active: true,
                    status: 'ACTIVE',
                    daysRemaining: extendMonths * 30,
                    canAcceptOrders: true,
                  },
                }
              : inst
          )
        );
        setMessage({ type: 'success', text: `تم تمديد اشتراك المحاضر لمدة ${extendMonths} شهر بنجاح!` });
        setExtendingInstructor(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تمديد الاشتراك' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء التمديد' });
    } finally {
      setIsExtending(false);
    }
  };

  const filteredInstructors = instructors.filter((inst) => {
    const nameMatch =
      inst.officialFullName?.toLowerCase().includes(search.toLowerCase()) ||
      inst.email?.toLowerCase().includes(search.toLowerCase()) ||
      inst.phone?.includes(search);
    if (!nameMatch) return false;

    if (statusFilter === 'ALL') return true;
    return inst.subscriptionState.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header & Nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              لوحة التحكم
            </Link>
            <span>/</span>
            <span className="text-primary-600 dark:text-primary-400 font-bold">إدارة المحاضرين والاشتراكات السحابية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            المحاضرون والاشتراكات (SaaS Subscriptions)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            متابعة الفترات التجريبية (14 يوماً)، اعتماد إيصالات تجديد الاشتراكات، وحسابات الدفع المباشر لكل محاضر
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-raised dark:hover:bg-surface-card border border-slate-300 dark:border-border text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
        >
          ← العودة للوحة الإدارة
        </Link>
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

      {/* PENDING SUBSCRIPTIONS RENEWAL BOX */}
      {pendingSubs.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              طلبات تجديد اشتراكات المحاضرين المعلقة ({pendingSubs.length})
            </h2>
            <span className="text-xs text-amber-700 dark:text-amber-400/80 font-bold">راجع الإيصال واعتمد تفعيل الحساب فورياً</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSubs.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl bg-white dark:bg-surface border border-slate-200 dark:border-border shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.instructor?.officialFullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{sub.instructor?.email} • {sub.instructor?.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-primary-950 border border-indigo-200 dark:border-primary-800 text-indigo-700 dark:text-primary-300 text-xs font-black">
                    {formatPrice(sub.amount)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">الباقة المطلوبة:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sub.plan === 'ANNUAL' ? 'سنوي (12 شهر)' : 'شهري (1 شهر)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">وسيلة الدفع:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sub.paymentMethod === 'INSTAPAY' ? 'إنستاباي' : 'فودافون كاش'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">رقم المعاملة:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{sub.transactionId || 'غير محدد'}</span>
                  </div>
                  {sub.screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => setViewingScreenshot(sub.screenshotUrl)}
                      className="text-primary-600 dark:text-primary-400 hover:underline font-bold block pt-1"
                    >
                      عرض صورة إيصال التحويل 
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={processingId === sub.id}
                    onClick={() => handleApproveSubscription(sub.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
                  >
                    تأكيد وتفعيل الاشتراك
                  </button>
                  <button
                    type="button"
                    disabled={processingId === sub.id}
                    onClick={() => handleRejectSubscription(sub.id)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs disabled:opacity-50 transition-all"
                  >
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-surface border border-slate-200 dark:border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المحاضر أو البريد أو الهاتف..."
            className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'TRIAL', label: 'تجريبي (14 يوم)' },
            { id: 'ACTIVE', label: 'نشط مدفوع' },
            { id: 'EXPIRED', label: 'منتهي' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-surface-raised dark:text-zinc-400 dark:hover:text-white border border-slate-200 dark:border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instructors Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
            <tr>
              <th className="p-3.5">المحاضر</th>
              <th className="p-3.5">الكورسات</th>
              <th className="p-3.5">حسابات استلام الأرباح المباشرة</th>
              <th className="p-3.5">حالة الاشتراك السحابي</th>
              <th className="p-3.5">المدة المتبقية</th>
              <th className="p-3.5 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {filteredInstructors.map((inst) => {
              const sub = inst.subscriptionState;
              return (
                <tr key={inst.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                  <td className="p-3.5">
                    <div className="font-black text-slate-900 dark:text-white text-sm">{inst.officialFullName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">{inst.email}</div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">{inst.phone || 'بدون هاتف'}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-slate-800 dark:text-white">
                      {inst._count?.instructedCourses || 0} كورس
                    </span>
                  </td>
                  <td className="p-3.5 space-y-1">
                    {inst.instapayAddress ? (
                      <div className="text-[11px] text-purple-700 dark:text-purple-300 font-mono">
                        إنستاباي: <span className="font-bold text-slate-900 dark:text-white">{inst.instapayAddress}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">إنستاباي: الافتراضي (المنصة)</div>
                    )}
                    {inst.vodafoneCashNumber ? (
                      <div className="text-[11px] text-rose-700 dark:text-rose-300 font-mono">
                        كاش: <span className="font-bold text-slate-900 dark:text-white">{inst.vodafoneCashNumber}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">كاش: الافتراضي (المنصة)</div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        sub.status === 'ADMIN'
                          ? 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300'
                          : sub.status === 'ACTIVE'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                          : sub.status === 'TRIAL'
                          ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {sub.status === 'ADMIN'
                        ? 'مشرف رئيسي (دائم)'
                        : sub.status === 'ACTIVE'
                        ? 'مشترك نشط'
                        : sub.status === 'TRIAL'
                        ? 'فترة تجريبية (14 يوم)'
                        : 'منتهي الصلاحية'}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold">
                    {sub.status === 'ADMIN' ? (
                      <span className="text-slate-400 dark:text-zinc-500">غير محدود</span>
                    ) : sub.status === 'EXPIRED' ? (
                      <span className="text-rose-600 dark:text-rose-400">انتهى</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">{sub.daysRemaining} يوم متبقي</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {inst.role !== 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => setExtendingInstructor(inst)}
                        className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-[11px] shadow-sm transition-all"
                      >
                        تمديد أو تفعيل
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MANUAL EXTEND MODAL */}
      {extendingInstructor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                تمديد اشتراك المحاضر يدوياً
              </h3>
              <button onClick={() => setExtendingInstructor(null)} className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              تحديد مدة التمديد لحساب المحاضر:{' '}
              <span className="font-bold text-slate-900 dark:text-white">{extendingInstructor.officialFullName}</span>
            </p>

            <form onSubmit={handleManualExtend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-600 dark:text-zinc-400">اختر مدة التمديد:</label>
                <select
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                >
                  <option value={1}>شهر واحد (30 يوماً)</option>
                  <option value={3}>3 أشهر (90 يوماً)</option>
                  <option value={6}>6 أشهر (180 يوماً)</option>
                  <option value={12}>سنة كاملة (365 يوماً)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setExtendingInstructor(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-raised border border-slate-300 dark:border-border text-slate-700 dark:text-zinc-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isExtending}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isExtending ? 'جاري التمديد...' : 'تأكيد التمديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCREENSHOT MODAL */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-white dark:bg-surface border border-slate-200 dark:border-border p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إيصال تحويل اشتراك المحاضر</span>
              <button onClick={() => setViewingScreenshot(null)} className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl">
              <img src={viewingScreenshot} alt="إيصال التحويل" className="w-full h-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

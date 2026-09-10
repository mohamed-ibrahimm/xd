'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  User,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  X
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedScreenshot(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleAction = async (paymentId: string, action: 'APPROVE' | 'REJECT', notes?: string) => {
    setProcessingId(paymentId);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          action,
          adminNotes: notes || (action === 'APPROVE' ? 'تم تأكيد التحويل المالي من الإدارة' : 'لم يتم تأكيد وصول المبلغ'),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'تمت العملية بنجاح' });
        loadPayments();
      } else {
        setMessage({ type: 'error', text: data.error || 'فشلت معالجة الطلب' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.user?.officialFullName?.toLowerCase().includes(q);
      const matchEmail = p.user?.email?.toLowerCase().includes(q);
      const matchTxn = p.transactionId?.toLowerCase().includes(q);
      const matchOrder = p.order?.orderNumber?.toLowerCase().includes(q);
      const matchPhone = p.senderPhone?.toLowerCase().includes(q);
      return matchName || matchEmail || matchTxn || matchOrder || matchPhone;
    }
    return true;
  });

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>تدقيق وإدارة المدفوعات والتحويلات المالية</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
            مراجعة إيصالات InstaPay وفودافون كاش وتأكيد أو رفض المعاملات لفتح المقررات
          </p>
        </div>

        <button
          type="button"
          onClick={loadPayments}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="truncate">{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 shrink-0 text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-100 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800">
          {[
            { id: 'PENDING', label: 'المعلقة (بانتظار التأكيد)', count: pendingCount },
            { id: 'APPROVED', label: 'المعتمدة', count: approvedCount },
            { id: 'REJECTED', label: 'المرفوضة', count: rejectedCount },
            { id: 'ALL', label: 'الكل', count: payments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                selectedStatus === tab.id
                  ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`mr-1 px-1.5 py-0.2 rounded-md text-[10px] ${
                selectedStatus === tab.id ? 'bg-zinc-950/20 text-zinc-950' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم المعاملة، الاسم، الهاتف..."
            className="w-full md:w-80 pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">جاري تحميل وتحديث سجل التحويلات...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2">
          <CreditCard className="w-10 h-10 mx-auto text-slate-400 dark:text-zinc-600" />
          <h3 className="text-base font-black text-slate-800 dark:text-zinc-200">لا توجد معاملات مطابقة</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500">لم يتم العثور على أي تحويل مالي في الفلتر الحالي.</p>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (Clean, spacious, uncompressed) */}
          <div className="block lg:hidden space-y-4">
            {filteredPayments.map((p) => {
              const isPending = p.status === 'PENDING';
              const isApproved = p.status === 'APPROVED';
              const isRejected = p.status === 'REJECTED';
              const itemTitle = p.order?.course?.title || p.order?.diploma?.title || 'مقرر تعليمي';

              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 p-4 space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Top: Order & Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white block">
                        {p.order?.orderNumber || p.id}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                        {formatDate(p.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        isApproved
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : isPending
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {isApproved ? 'معتمد ومفعل' : isPending ? 'بانتظار المراجعة' : 'مرفوض'}
                    </span>
                  </div>

                  {/* Middle Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Student Info */}
                    <div className="space-y-1 col-span-2 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                        <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{p.user?.officialFullName || p.user?.username || 'طالب جديد'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.user?.email}</span>
                      </div>
                      {p.senderPhone && (
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>هاتف التحويل: {p.senderPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Course Item */}
                    <div className="col-span-2 flex items-center gap-2 text-slate-800 dark:text-zinc-200">
                      <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="font-bold truncate">{itemTitle}</span>
                    </div>

                    {/* Amount */}
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">المبلغ المطلوب</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                        {formatPrice(p.amount)}
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">وسيلة الدفع</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                        {p.paymentMethod === 'INSTAPAY'
                          ? 'إنستاباي (InstaPay)'
                          : p.paymentMethod === 'VODAFONE_CASH'
                          ? 'فودافون كاش'
                          : 'كوبون 100%'}
                      </span>
                    </div>
                  </div>

                  {/* Transaction ID if exists */}
                  {p.transactionId && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-lg flex items-center justify-between">
                      <span>رقم المعاملة (TXN):</span>
                      <span className="font-black text-slate-900 dark:text-zinc-200">{p.transactionId}</span>
                    </div>
                  )}

                  {/* Proof Screenshot Button */}
                  {p.screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedScreenshot(p.screenshotUrl)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة إيصال التحويل المالي</span>
                    </button>
                  )}

                  {/* Action Buttons */}
                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        disabled={processingId === p.id}
                        onClick={() => handleAction(p.id, 'APPROVE')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>قبول وتفعيل</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingId === p.id}
                        onClick={() => {
                          const reason = prompt('يرجى كتابة سبب رفض المعاملة:');
                          if (reason !== null) handleAction(p.id, 'REJECT', reason);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض المعاملة</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 dark:text-zinc-500 text-center border-t border-slate-100 dark:border-zinc-800/80 pt-2 font-bold">
                      {p.adminNotes || 'تمت معالجة هذه المعاملة بنجاح'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (Full columns, high-density) */}
          <div className="hidden lg:block rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 font-black">
                    <th className="p-4">رقم الطلب / المعاملة</th>
                    <th className="p-4">الطالب</th>
                    <th className="p-4">المقرر المطلوب</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">وسيلة الدفع</th>
                    <th className="p-4">إيصال الدفع</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredPayments.map((p) => {
                    const isPending = p.status === 'PENDING';
                    const isApproved = p.status === 'APPROVED';
                    const isRejected = p.status === 'REJECTED';
                    const itemTitle = p.order?.course?.title || p.order?.diploma?.title || '-';

                    return (
                      <tr key={p.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                        <td className="p-4 space-y-0.5">
                          <span className="font-mono font-black text-slate-900 dark:text-white block">{p.order?.orderNumber}</span>
                          {p.transactionId && (
                            <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 block">
                              TXN: {p.transactionId}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">{formatDate(p.createdAt)}</span>
                        </td>

                        <td className="p-4 space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">{p.user?.officialFullName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">{p.user?.email}</span>
                          {p.senderPhone && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-mono">{p.senderPhone}</span>
                          )}
                        </td>

                        <td className="p-4 max-w-xs truncate text-slate-700 dark:text-zinc-300 font-bold">
                          {itemTitle}
                        </td>

                        <td className="p-4 font-black text-amber-600 dark:text-amber-400 text-sm font-mono">
                          {formatPrice(p.amount)}
                        </td>

                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-slate-700 dark:text-zinc-300 text-[11px]">
                            {p.paymentMethod === 'INSTAPAY'
                              ? 'إنستاباي'
                              : p.paymentMethod === 'VODAFONE_CASH'
                              ? 'فودافون كاش'
                              : 'كوبون 100%'}
                          </span>
                        </td>

                        <td className="p-4">
                          {p.screenshotUrl ? (
                            <button
                              type="button"
                              onClick={() => setSelectedScreenshot(p.screenshotUrl)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>معاينة الإيصال</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-600 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isApproved
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : isPending
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {isApproved ? 'معتمد ومفعل' : isPending ? 'بانتظار المراجعة' : 'مرفوض'}
                          </span>
                        </td>

                        <td className="p-4">
                          {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                disabled={processingId === p.id}
                                onClick={() => handleAction(p.id, 'APPROVE')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-emerald-600/20 cursor-pointer"
                                title="تأكيد التحويل وفتح الكورس فوراً"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>قبول وتفعيل</span>
                              </button>

                              <button
                                type="button"
                                disabled={processingId === p.id}
                                onClick={() => {
                                  const reason = prompt('يرجى كتابة سبب رفض المعاملة:');
                                  if (reason !== null) handleAction(p.id, 'REJECT', reason);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center gap-1 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                                title="رفض المعاملة"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>رفض</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 dark:text-zinc-500 text-center block font-bold">
                              {p.adminNotes || 'تم اتخاذ إجراء'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Screenshot Preview Modal (Portal to body so it never clips or offsets) */}
      {mounted && selectedScreenshot && createPortal(
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full max-h-[90vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col cursor-default animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 shrink-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">صورة إيصال التحويل المالي</h3>
              <button
                type="button"
                onClick={() => setSelectedScreenshot(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl bg-slate-950 flex items-center justify-center p-2 min-h-48 max-h-[60vh]">
              <img
                src={selectedScreenshot}
                alt="Proof Screenshot"
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-between items-center pt-1 shrink-0 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">اضغط في أي مكان خارجي أو Esc للإغلاق</span>
              <button
                type="button"
                onClick={() => setSelectedScreenshot(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUploadInput from '@/components/FileUploadInput';
import { formatPrice, formatDuration } from '@/lib/utils';
import InstructorSidebarClient, { InstructorTabType } from '@/components/instructor/InstructorSidebarClient';
import StudentVerificationModal from '@/components/instructor/StudentVerificationModal';
import InstructorSubscriptionModal from '@/components/instructor/InstructorSubscriptionModal';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Plus,
  PlayCircle,
  Clock,
  TrendingUp,
  MessageSquare,
  Trash2,
  AlertTriangle,
  X,
  ExternalLink,
  CheckCircle2,
  CreditCard,
  Tag,
  Receipt,
  Sparkles,
  Copy,
  Check,
  Star,
  ShieldCheck,
  Wallet,
  ArrowLeft,
  ArrowRight,
  Eye,
  RefreshCw,
  FileText,
  CheckCircle,
  ArrowUpRight,
  BarChart3,
  SlidersHorizontal,
  Video,
  Monitor,
  Hand,
  Radio,
  Play,
} from 'lucide-react';

interface InstructorClientProps {
  user: any;
  initialCourses: any[];
  initialBooks?: any[];
  totalStudents: number;
  subscriptionState: any;
  initialCoupons: any[];
  initialPayments: any[];
  platformSettings: Record<string, string>;
}

export default function InstructorClient({
  user,
  initialCourses,
  initialBooks,
  totalStudents,
  subscriptionState,
  initialCoupons,
  initialPayments,
  platformSettings,
}: InstructorClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InstructorTabType>('overview');
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [books, setBooks] = useState<any[]>(initialBooks || []);
  const [coupons, setCoupons] = useState<any[]>(initialCoupons || []);
  const [payments, setPayments] = useState<any[]>(initialPayments || []);
  const [editingPrices, setEditingPrices] = useState<{ [id: string]: { price: number; compareAtPrice?: number; status?: string; isFree?: boolean } }>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const [platformPricing, setPlatformPricing] = useState({
    monthlyPrice: 290,
    annualPrice: 1499,
    studentPrice: 120,
    studentMaxAge: 22,
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setPlatformPricing({
            monthlyPrice: Number(data.instructorPriceMonthly) || 290,
            annualPrice: Number(data.instructorPriceAnnual) || 1499,
            studentPrice: Number(data.instructorPriceStudent) || 120,
            studentMaxAge: Number(data.studentMaxAge) || 22,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowRenewModal(false);
        setDeletingCourse(null);
        setViewingScreenshot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Course Delete State
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Student Verification Modal State
  const [showStudentVerifModal, setShowStudentVerifModal] = useState(false);

  // New Course Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    price: 900,
    durationHours: 20,
    level: 'BEGINNER',
  });

  // Payment Settings Form State
  const [paymentSettings, setPaymentSettings] = useState({
    instapayAddress: user.instapayAddress || '',
    instapayName: user.instapayName || user.officialFullName || '',
    vodafoneCashNumber: user.vodafoneCashNumber || '',
    paymentInstructions: user.paymentInstructions || '',
    phone: user.phone || '',
  });
  const [isSavingPayments, setIsSavingPayments] = useState(false);

  // Coupon Creation Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxUses: 100,
    validUntil: '',
  });
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  // Order Approval State
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);

  // Subscription Renewal Modal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewPlan, setRenewPlan] = useState<'MONTHLY' | 'ANNUAL' | 'STUDENT_PRO' | 'LIVE_STUDIO_PRO'>('LIVE_STUDIO_PRO');
  const [renewMethod, setRenewMethod] = useState<'INSTAPAY' | 'VODAFONE_CASH'>('INSTAPAY');
  const [renewTxId, setRenewTxId] = useState('');
  const [renewScreenshot, setRenewScreenshot] = useState('');
  const [isSubmittingRenew, setIsSubmittingRenew] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const userAge = user?.studentBirthDate ? (() => {
    const b = new Date(user.studentBirthDate);
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  })() : null;

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

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });
      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => [
          {
            ...data.course,
            instructor: { officialFullName: user.officialFullName },
            _count: { sections: 0, enrollments: 0 },
            sections: [],
          },
          ...prev,
        ]);
        setMessage({ type: 'success', text: 'تم إنشاء الكورس الجديد بنجاح!' });
        setShowAddModal(false);
        setModalError(null);
        setNewCourse({
          title: '',
          shortDescription: '',
          description: '',
          thumbnail: '',
          price: 900,
          durationHours: 20,
          level: 'BEGINNER',
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

  const handleSaveCoursePrice = async (courseId: string) => {
    const editData = editingPrices[courseId];
    if (!editData) return;
    setSavingPriceId(courseId);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courseId,
          price: editData.price,
          status: editData.status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...data.course } : c)));
        setMessage({ type: 'success', text: 'تم تحديث سعر وحالة الكورس بنجاح!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تحديث سعر الكورس' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ السعر' });
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleSaveBookPrice = async (bookId: string) => {
    const editData = editingPrices[bookId];
    if (!editData) return;
    setSavingPriceId(bookId);
    try {
      const res = await fetch('/api/instructor/books', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookId,
          price: editData.price,
          compareAtPrice: editData.compareAtPrice,
          isFree: editData.isFree,
          status: editData.status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, ...data.book } : b)));
        setMessage({ type: 'success', text: 'تم تحديث سعر وحالة المذكرة بنجاح!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تحديث سعر المذكرة' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ السعر' });
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayments(true);
    setMessage(null);
    try {
      const res = await fetch('/api/instructor/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'تم حفظ وتحديث بيانات استلام أرباحك بنجاح! سيتم توجيه تحويلات الطلاب إلى حساباتك مباشرة.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل حفظ الإعدادات' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإعدادات' });
    } finally {
      setIsSavingPayments(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    setIsCreatingCoupon(true);
    setMessage(null);
    try {
      const res = await fetch('/api/instructor/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons((prev) => [data.coupon, ...prev]);
        setMessage({ type: 'success', text: 'تم إنشاء كود الخصم بنجاح! يمكنك الآن نشره لطلابك.' });
        setNewCoupon({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          maxUses: 100,
          validUntil: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل إنشاء الكوبون' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إنشاء الكوبون' });
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الكوبون؟')) return;
    try {
      const res = await fetch(`/api/instructor/coupons?id=${couponId}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        setMessage({ type: 'success', text: 'تم حذف الكوبون بنجاح' });
      }
    } catch (e) {}
  };

  const handleOrderAction = async (paymentId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingPaymentId(paymentId);
    try {
      const res = await fetch('/api/instructor/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : p))
        );
        setMessage({
          type: 'success',
          text: action === 'APPROVE' ? 'تم تأكيد الإيصال وتفعيل الكورس للطالب فورياً!' : 'تم رفض الإيصال وإشعار الطالب.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل تنفيذ الإجراء' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء معالجة الطلب' });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleSubmitRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRenew(true);
    try {
      const res = await fetch('/api/instructor/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: renewPlan,
          paymentMethod: renewMethod,
          transactionId: renewTxId,
          screenshotUrl: renewScreenshot,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'تم إرسال طلب تجديد الاشتراك بنجاح للإدارة!' });
        setShowRenewModal(false);
        setRenewTxId('');
        setRenewScreenshot('');
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل إرسال طلب التجديد' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء إرسال الطلب' });
    } finally {
      setIsSubmittingRenew(false);
    }
  };

  // Subscription Banner Computation
  const isTrial = subscriptionState?.status === 'TRIAL';
  const isExpired = subscriptionState?.status === 'EXPIRED';
  const isActivePaid = subscriptionState?.status === 'ACTIVE';

  const totalEarnedRevenue = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPaymentsCount = payments.filter((p) => p.status === 'PENDING').length;
  const totalLessonsCount = courses.reduce((acc, c) => {
    return acc + (c.sections || []).reduce((sAcc: number, s: any) => sAcc + (s.lessons?.length || 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#06040d] flex flex-col lg:flex-row text-slate-900 dark:text-zinc-100 font-[family-name:var(--font-cairo)] relative">
      {/* Dynamic Ambient Mesh in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[5%] right-[15%] w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="dynamic-drift-2 absolute bottom-[10%] right-[40%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="dynamic-drift-3 absolute top-[35%] left-[5%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="dynamic-drift-4 absolute bottom-[25%] left-[25%] w-[480px] h-[480px] bg-emerald-500/10 rounded-full blur-[125px]" />
      </div>

      {/* 1. Permanent SaaS Sidebar on Desktop + Mobile Drawer */}
      <InstructorSidebarClient
        instructorName={user.officialFullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'محاضر قمم'}
        instructorEmail={user.email}
        subscriptionPlan={user.subscriptionPlan || 'FREE_TRIAL'}
        coursesCount={courses.length}
        pendingOrdersCount={pendingPaymentsCount}
        couponsCount={coupons.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewCourseClick={() => {
          if (isExpired) {
            setMessage({ type: 'error', text: 'انتهت الفترة التجريبية، يرجى تجديد الاشتراك أولاً لإضافة دورات جديدة' });
            return;
          }
          setModalError(null);
          setShowAddModal(true);
        }}
        publicProfileSlug={user.username || user.id}
      />

      {/* 2. Main Studio View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-16 relative z-10 space-y-6 overflow-x-hidden">
          {/* Studio Top Control Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#0e0a1f]/90 border border-slate-200/90 dark:border-purple-900/40 shadow-xl backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <Link href="/" className="hover:text-amber-500 transition-colors">الرئيسية</Link>
                <span>/</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">استوديو المحاضر السحابي</span>
                <span>/</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeTab === 'overview' && 'نظرة عامة والتحليلات'}
                  {activeTab === 'courses' && 'دوراتي التدريبية'}
                  {activeTab === 'pricing' && 'تعديل أسعار الكورسات والكتب'}
                  {activeTab === 'orders' && 'طلبات وإيصالات الطلاب'}
                  {activeTab === 'payments' && 'بيانات استلام أرباحي'}
                  {activeTab === 'coupons' && 'كوبونات الخصم'}
                  {activeTab === 'subscription' && 'باقة اشتراك الاستوديو'}
                  {activeTab === 'live' && 'أستوديو البث المباشر (VIP Live Studio)'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-amber-500" />
                <span>أكاديمية المحاضر: {user.officialFullName}</span>
                {user.isStudentInstructor && user.studentVerificationStatus === 'APPROVED' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                    طالب معتمد 
                  </span>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
              {/* 1. Live Broadcast Studio Button */}
              <Link
                href="/live/instant-room"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer active:scale-95"
              >
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>بث مباشر فوري (Live HD)</span>
              </Link>

              {/* 2. Add Course Button */}
              <button
                type="button"
                onClick={() => {
                  if (isExpired) {
                    setMessage({ type: 'error', text: 'انتهت الفترة التجريبية، يرجى تجديد الاشتراك أولاً لإضافة دورات جديدة' });
                    return;
                  }
                  setModalError(null);
                  setShowAddModal(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-zinc-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة كورس</span>
              </button>

              {/* 3. Add Book / Note Button */}
              <Link
                href="/instructor/books/new"
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
              >
                <BookOpen className="w-4 h-4" />
                <span>نشر مذكرة</span>
              </Link>
            </div>
          </div>

        {/* Subscription Status Callout Banner */}
        {user.role !== 'ADMIN' && (
          <div
            className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
              isExpired
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 shadow-rose-950/10 text-rose-900 dark:text-rose-200'
                : isTrial
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-500/40 shadow-amber-950/10 text-amber-900 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 shadow-emerald-950/10 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isExpired
                    ? 'bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400'
                    : isTrial
                    ? 'bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isExpired ? <AlertTriangle className="w-5 h-5" /> : isTrial ? <Clock className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {isExpired
                      ? 'انتهت الفترة التجريبية وتوقفت مبيعات كورساتك مؤقتاً'
                      : isTrial
                      ? `أنت الآن في الفترة التجريبية المجانية (متبقي ${subscriptionState?.daysRemaining || 0} يوم)`
                      : `اشتراكك السحابي نشط (متبقي ${subscriptionState?.daysRemaining || 0} يوم)`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      isExpired
                        ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300'
                        : isTrial
                        ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-600 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {isExpired ? 'اشتراك منتهي' : isTrial ? '14 يوماً مجاناً' : 'مشترك معتمد'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  {isExpired
                    ? 'يرجى تجديد اشتراكك (الشهري أو السنوي) لإعادة فتح استقبال طلبات الطلاب على كورساتك فورياً.'
                    : isTrial
                    ? 'يمكنك خلال هذه الفترة رفع دوراتك وتعيين حسابات InstaPay وفودافون كاش لطلابك مجاناً.'
                    : 'جميع كورساتك نشطة وتستقبل طلبات الشراء ويتم تحويل مبالغ الطلاب على حساباتك مباشرة.'}
                </p>
              </div>
            </div>

            <Link
              href="/instructor/plans"
              className={`px-5 py-2.5 rounded-xl font-black text-xs shrink-0 shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer ${
                isExpired
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-950/50'
                  : isTrial
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-amber-950/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white border border-emerald-700 dark:border-zinc-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{isExpired ? 'تجديد الاشتراك الآن' : 'ترقية أو تجديد الباقة'}</span>
            </Link>
          </div>
        )}

        {/* Alert Messages */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-md ${
              message.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-700 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 0: OVERVIEW (نظرة عامة والتحليلات) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* VIP LIVE BROADCAST STUDIO HERO CARD */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50/70 to-purple-50 dark:from-[#180f33] dark:via-[#241347] dark:to-[#120a26] border-2 border-rose-200 dark:border-rose-500/40 shadow-xl shadow-rose-500/5 dark:shadow-purple-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-black uppercase">
                      VIP Live Studio
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      أستوديو البث المباشر ومشاركة الشاشة (Google Meet Style)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                    اشرح لطلابك لحظياً بدقة 1080p، شارك شاشتك، واطلق مسابقات وكويزات تفاعلية حية (Kahoot Mode).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      navigator.clipboard.writeText(`${window.location.origin}/live/instant-room`);
                      setMessage({ type: 'success', text: 'تم نسخ رابط دعوة الطلاب لغرفة البث المباشر!' });
                    }
                  }}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/10 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ رابط الطلاب</span>
                </button>

                <Link
                  href="/live/instant-room"
                  className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-white" />
                  <span>بدء البث الآن</span>
                </Link>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Students */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold">إجمالي الطلاب المسجلين</span>
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {totalStudents} <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">طالب</span>
                </p>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <span>عبر {courses.length} دورة تدريبية</span>
                </div>
              </div>

              {/* Stat 2: Active Courses */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold">الدورات التدريبية</span>
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {courses.length} <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">دورة</span>
                </p>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <span>تتضمن {totalLessonsCount} درساً ومحاضرة</span>
                </div>
              </div>

              {/* Stat 3: Direct Revenue */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold">أرباحك المباشرة المحققة</span>
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                  {formatPrice(totalEarnedRevenue)}
                </p>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400/90 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تحويلات مباشرة لحسابك 100%</span>
                </div>
              </div>

              {/* Stat 4: SaaS Plan */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 backdrop-blur-xl space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold">اشتراك استوديو المحاضر</span>
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isExpired ? 'منتهي' : isTrial ? `${subscriptionState?.daysRemaining || 0} يوم` : 'نشط معتمد'}
                </p>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>{isTrial ? 'فترة تجريبية مجانية' : 'باقة SaaS Pro'}</span>
                  <Link
                    href="/instructor/plans"
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    {isExpired ? 'تجديد الآن' : 'ترقية/تجديد'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Fast Action Shortcuts (6 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* Shortcut 1: Live Studio */}
              <Link
                href="/live/instant-room"
                className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">غرفة البث المباشر</span>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold block">مشاركة شاشة HD</span>
                </div>
                <Radio className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform animate-pulse" />
              </Link>

              {/* Shortcut 2: Add Course */}
              <button
                type="button"
                onClick={() => {
                  if (isExpired) {
                    setMessage({ type: 'error', text: 'انتهت الفترة التجريبية، يرجى تجديد الاشتراك أولاً لإضافة دورات جديدة' });
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">إضافة كورس جديد</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">رفع فيديوهات ومناهج</span>
                </div>
                <Plus className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
              </button>

              {/* Shortcut 3: Publish Book */}
              <Link
                href="/instructor/books/new"
                className="p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">نشر مذكرة / كتاب</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">تشفير DRM كامل</span>
                </div>
                <BookOpen className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              </Link>

              {/* Shortcut 4: Orders */}
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    طلبات الطلاب {pendingPaymentsCount > 0 && `(${pendingPaymentsCount})`}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">مراجعة الإيصالات</span>
                </div>
                <Receipt className="w-5 h-5 text-slate-600 dark:text-zinc-400 group-hover:scale-110 transition-transform" />
              </button>

              {/* Shortcut 5: Payouts */}
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">استلام الأرباح</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">InstaPay وفودافون</span>
                </div>
                <CreditCard className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </button>

              {/* Shortcut 6: Coupons */}
              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className="p-4 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-right transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">كوبونات الخصم</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">{coupons.length} كوبون نشط</span>
                </div>
                <Tag className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Pending Student Orders Callout (if any) */}
            {pendingPaymentsCount > 0 && (
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      يوجد لديك {pendingPaymentsCount} طلب تحويل معلق بانتظار مراجعتك وتأكيدك!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      قام الطلاب برفع إيصالات التحويل بانتظار اعتمادك ليتم فتح محتوى الكورس لهم تلقائياً.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shrink-0 transition-all cursor-pointer"
                >
                  مراجعة الطلبات الآن
                </button>
              </div>
            )}

            {/* Recent Student Payments & Courses Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders Box */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">أحدث طلبات وتحويلات الطلاب</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>عرض الكل ({payments.length})</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-xs">
                    لا توجد طلبات دفع مسجلة حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payments.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate">
                            {p.user?.officialFullName || p.user?.firstName || 'طالب'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {p.order?.course?.title || 'كورس'}
                          </p>
                        </div>
                        <div className="text-left shrink-0 space-y-0.5">
                          <span className="font-black text-amber-600 dark:text-amber-400 font-mono block">
                            {formatPrice(p.amount)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block text-center ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                          }`}>
                            {p.status === 'APPROVED' ? 'مقبول' : p.status === 'REJECTED' ? 'مرفوض' : 'معلق'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Courses Overview Box */}
              <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl shadow-slate-900/5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">دوراتك التدريبية</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>إدارة الكورسات ({courses.length})</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-xs">
                    لم تقم بإضافة أي كورسات بعد. اضغط على إضافة كورس للبدء.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {courses.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate">{c.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {c._count?.sections || 0} وحدات • {c._count?.enrollments || 0} مشترك
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-black text-slate-900 dark:text-white font-mono">
                            {formatPrice(c.price)}
                          </span>
                          <Link
                            href={`/instructor/courses/${c.id}/curriculum`}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold text-[11px] transition-colors"
                          >
                            تعديل المنهاج
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* TAB 1: COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-white/90 dark:from-surface dark:to-surface border border-blue-500/30 shadow-lg shadow-blue-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">الدورات التدريبية النشطة</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{courses.length}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-500/15 via-fuchsia-500/5 to-white/90 dark:from-surface dark:to-surface border border-purple-500/30 shadow-lg shadow-purple-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">إجمالي الطلاب في دوراتك</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{totalStudents} طالب</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-white/90 dark:from-surface dark:to-surface border border-emerald-500/30 shadow-lg shadow-emerald-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">التقييم العام للمحاضر</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight flex items-center gap-1.5">
                <span>4.9 / 5.0</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
              </p>
            </div>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">الدورات التي تقدمها ({courses.length})</h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400">يمكنك إدارة المنهج، رفع الفيديوهات، ومتابعة الطلاب</span>
            </div>

            {courses.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد لديك دورات حالياً</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">قم بإضافة أول دورة تدريبية لك في الأكاديمية خلال فترتك التجريبية</p>
                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setShowAddModal(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-zinc-950 font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة كورس جديد</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-6 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            {course.status === 'PUBLISHED' ? 'منشور للطلاب' : 'مسودة'}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{course.title}</h3>
                        </div>
                        <span className="text-base font-black text-primary-600 dark:text-primary-400 font-mono shrink-0">
                          {formatPrice(course.price)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>{course._count?.sections || 0} وحدات تعليمية</span>
                        <span>{course._count?.enrollments || 0} طالب مشترك</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <Link
                        href={`/instructor/courses/${course.id}/curriculum`}
                        className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-center text-xs font-bold shadow-md shadow-primary-600/20 transition-all"
                      >
                        إدارة المحتوى والدروس والفيديوهات
                      </Link>

                      <Link
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="معاينة الكورس كما يراه الطالب"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeletingCourse(course)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="حذف الكورس"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PRICING & DISCOUNTS MANAGER (تعديل أسعار الكورسات والكتب) */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>مركز التحكم السريع في الأسعار والعروض</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  إدارة وتعديل أسعار الكورسات والمذكرات الرقمية
                </h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  عدّل أسعار دوراتك وكتبك لحظياً، حدد نسب التخفيض، وفعّل المذكرات المجانية بضغطة زر واحدة.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/instructor/books/new"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر مذكرة جديدة</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة كورس</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1. COURSES PRICING SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>تسعير الكورسات التدريبية ({courses.length})</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                احفظ السعر الجديد ليظهر للطلاب فوراً
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500">
                لا توجد كورسات مضافة بعد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => {
                  const currentEdit = editingPrices[course.id] || {
                    price: course.price,
                    status: course.status || 'PUBLISHED',
                  };
                  const isSaving = savingPriceId === course.id;

                  return (
                    <div
                      key={course.id}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            currentEdit.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                              : 'bg-zinc-500/15 text-zinc-400'
                          }`}>
                            {currentEdit.status === 'PUBLISHED' ? 'منشور للطلاب' : 'مسودة غير منشورة'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {course._count?.sections || 0} وحدات • {course._count?.enrollments || 0} طالب
                          </p>
                        </div>

                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono shrink-0">
                          {formatPrice(course.price)}
                        </span>
                      </div>

                      {/* Pricing Inputs */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                            السعر الجديد (ج.م):
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currentEdit.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditingPrices((prev) => ({
                                ...prev,
                                [course.id]: { ...currentEdit, price: val },
                              }));
                            }}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-black font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                            حالة النشر:
                          </label>
                          <select
                            value={currentEdit.status}
                            onChange={(e) => {
                              setEditingPrices((prev) => ({
                                ...prev,
                                [course.id]: { ...currentEdit, status: e.target.value },
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                          >
                            <option value="PUBLISHED">منشور للبيع</option>
                            <option value="DRAFT">مسودة (إخفاء)</option>
                          </select>
                        </div>
                      </div>

                      {/* Save Action */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveCoursePrice(course.id)}
                          disabled={isSaving}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-center"
                        >
                          {isSaving ? 'جاري الحفظ...' : 'حفظ السعر الجديد'}
                        </button>

                        <Link
                          href={`/instructor/courses/${course.id}/curriculum`}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
                        >
                          المنهاج
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. BOOKS & DIGITAL NOTES PRICING SECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span>تسعير وعروض المذكرات والكتب الرقمية ({books.length})</span>
              </h3>
              <Link
                href="/instructor/books"
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                إدارة كافة المذكرات
              </Link>
            </div>

            {books.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center space-y-3">
                <FileText className="w-10 h-10 text-purple-400 mx-auto" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white">لم تنشر أي مذكرات رقمية بعد</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  ارفع مذكراتك المحمية بنظام DRM وحدد سعرها واربح 85% من المبيعات فورياً.
                </p>
                <Link
                  href="/instructor/books/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 text-white font-black text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر مذكرة جديدة الآن</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => {
                  const currentEdit = editingPrices[book.id] || {
                    price: book.price || 0,
                    compareAtPrice: book.compareAtPrice || 0,
                    isFree: !!book.isFree,
                    status: book.status || 'PUBLISHED',
                  };
                  const isSaving = savingPriceId === book.id;

                  return (
                    <div
                      key={book.id}
                      className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300">
                            {book.category || 'ملخصات'} • {book.pageCount} صفحة
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {book.purchases?.length || book.salesCount || 0} عملية شراء وقراءة
                          </p>
                        </div>

                        <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono shrink-0">
                          {book.isFree || book.price === 0 ? 'مجاناً' : `${book.price} ج.م`}
                        </span>
                      </div>

                      {/* Pricing Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                            مجانية / مدفوعة:
                          </label>
                          <select
                            value={currentEdit.isFree ? 'FREE' : 'PAID'}
                            onChange={(e) => {
                              const isFree = e.target.value === 'FREE';
                              setEditingPrices((prev) => ({
                                ...prev,
                                [book.id]: {
                                  ...currentEdit,
                                  isFree,
                                  price: isFree ? 0 : (currentEdit.price || 35),
                                },
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                          >
                            <option value="PAID">مدفوعة</option>
                            <option value="FREE">مجانية بالكامل</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                            السعر (ج.م):
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={currentEdit.isFree}
                            value={currentEdit.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditingPrices((prev) => ({
                                ...prev,
                                [book.id]: { ...currentEdit, price: val },
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-black font-mono focus:outline-none focus:border-purple-500 disabled:opacity-40"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                            السعر قبل الخصم:
                          </label>
                          <input
                            type="number"
                            min="0"
                            disabled={currentEdit.isFree}
                            value={currentEdit.compareAtPrice || ''}
                            placeholder="اختياري"
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setEditingPrices((prev) => ({
                                ...prev,
                                [book.id]: { ...currentEdit, compareAtPrice: val },
                              }));
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-purple-500 disabled:opacity-40"
                          />
                        </div>
                      </div>

                      {/* Save Action */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveBookPrice(book.id)}
                          disabled={isSaving}
                          className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-center"
                        >
                          {isSaving ? 'جاري الحفظ...' : 'حفظ تسعير المذكرة'}
                        </button>

                        <Link
                          href={`/books/${book.slug}`}
                          target="_blank"
                          className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
                        >
                          معاينة
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: DIRECT PAYMENT SETTINGS */}
      {activeTab === 'payments' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 space-y-6 max-w-3xl shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              إعدادات استلام أموالك مباشرة من الطلاب
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              عند قيام أي طالب بشراء كورساتك، ستظهر له هذه البيانات في صفحة الدفع ليقوم بالتحويل لحساباتك فورياً دون وسيط.
            </p>
          </div>

          <form onSubmit={handleSavePaymentSettings} className="space-y-5">
            {/* InstaPay Setup */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 space-y-4">
              <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                بيانات حساب إنستاباي (InstaPay IPN):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">عنوان الدفع اللحظي (IPA / إنستاباي):</label>
                  <input
                    type="text"
                    value={paymentSettings.instapayAddress}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, instapayAddress: e.target.value })}
                    placeholder="مثال: coach.ali@instapay"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">اسم صاحب الحساب المعتمد:</label>
                  <input
                    type="text"
                    value={paymentSettings.instapayName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, instapayName: e.target.value })}
                    placeholder="الاسم كما يظهر بتطبيق البنك / إنستاباي"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Vodafone Cash Setup */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 space-y-4">
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                رقم محفظة فودافون كاش / المحافظ الذكية:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">رقم المحفظة لتحويل الطلاب:</label>
                  <input
                    type="tel"
                    value={paymentSettings.vodafoneCashNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, vodafoneCashNumber: e.target.value })}
                    placeholder="مثال: 01012345678"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">رقم الواتساب للتواصل والدعم:</label>
                  <input
                    type="tel"
                    value={paymentSettings.phone}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, phone: e.target.value })}
                    placeholder="مثال: 01555791568"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Custom Payment Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">تعليمات التحويل التي ستظهر للطالب عند الدفع:</label>
              <textarea
                rows={3}
                value={paymentSettings.paymentInstructions}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentInstructions: e.target.value })}
                placeholder="مثال: يرجى كتابة اسمك في وصف التحويل ورفع لقطة الشاشة ورقم العملية لتفعيل الكورس فورياً."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPayments}
              className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-black text-xs shadow-lg shadow-primary-600/30 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              {isSavingPayments ? 'جاري حفظ الإعدادات...' : 'حفظ بيانات استلام الأرباح'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: STUDENT ORDERS & APPROVALS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">طلبات التحويل وإيصالات الطلاب ({payments.length})</h2>
            <span className="text-xs text-slate-500 dark:text-zinc-400">راجع إيصال الطالب واضغط على تأكيد لفتح الكورس له فورياً</span>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 text-center space-y-3 shadow-sm">
              <Receipt className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">لا توجد طلبات انضمام حالياً</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">ستظهر هنا أي طلبات دفع جديدة من الطلاب لكورساتك</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
                  <tr>
                    <th className="p-3.5">الطالب</th>
                    <th className="p-3.5">الكورس</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">وسيلة الدفع</th>
                    <th className="p-3.5">رقم المعاملة والإيصال</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{p.user?.officialFullName || p.user?.firstName}</div>
                        <div className="text-[11px] text-zinc-500 font-normal">{p.user?.email}</div>
                      </td>
                      <td className="p-3.5 text-zinc-300 font-medium">{p.order?.course?.title || 'كورس'}</td>
                      <td className="p-3.5 font-black text-emerald-400">{formatPrice(p.amount)}</td>
                      <td className="p-3.5 text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-surface-raised border border-border text-[10px] font-bold">
                          {p.paymentMethod === 'INSTAPAY' ? 'إنستاباي' : 'فودافون كاش'}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <div className="font-mono text-[11px]">{p.transactionId || 'بدون رقم معاملة'}</div>
                        {p.screenshotUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingScreenshot(p.screenshotUrl)}
                            className="text-[11px] text-amber-500 hover:text-amber-400 font-bold mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>معاينة الإيصال</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-950 border-rose-800 text-rose-300'
                              : 'bg-amber-950 border-amber-800 text-amber-300'
                          }`}
                        >
                          {p.status === 'APPROVED' ? 'تم التفعيل' : p.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {p.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              disabled={processingPaymentId === p.id}
                              onClick={() => handleOrderAction(p.id, 'APPROVE')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm disabled:opacity-50 transition-all"
                            >
                              تأكيد وفتح الكورس
                            </button>
                            <button
                              type="button"
                              disabled={processingPaymentId === p.id}
                              onClick={() => handleOrderAction(p.id, 'REJECT')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px] transition-all"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500">تم حسم الطلب</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SUBSCRIPTION (باقة اشتراك الاستوديو) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6 max-w-4xl">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-purple-900/40 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-500">نظام الاشتراكات السحابية للمحاضرين</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>تفاصيل باقة اشتراك استوديو المحاضر (SaaS)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  امتلك أكاديميتك الخاصة دون أي نسبة استقطاع من مبيعاتك مع أحدث تقنيات التعليم الرقمي.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRenewModal(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                {isExpired ? 'تجديد الاشتراك الآن' : 'ترقية أو تجديد الباقة'}
              </button>
            </div>

            {/* Current Status Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">نوع الباقة الحالية</span>
                <p className="text-base font-black text-slate-900 dark:text-white">
                  {user.subscriptionPlan === 'FREE_TRIAL' ? 'فترة تجريبية مجانية (14 يوماً)' : user.subscriptionPlan || 'باقة المحاضر Pro'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">حالة الحساب</span>
                <p className={`text-base font-black ${
                  isExpired ? 'text-rose-500' : isTrial ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {isExpired ? 'منتهي الصلاحية' : isTrial ? `تجريبي (متبقي ${subscriptionState?.daysRemaining || 0} يوم)` : 'نشط ومعتمد'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold">نسبة عمولة المنصة</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  0% (أرباحك 100% لك)
                </p>
              </div>
            </div>

            {/* Included Features */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">ما تتضمنه باقة المحاضر المحترف:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>استقبال تحويلات الطلاب على InstaPay وفودافون كاش بدون وسيط</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>رفع الفيديوهات السحابية وحمايتها ضد التحميل والتسجيل</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>بنك أسئلة واختبارات تفاعلية وتصحيح تلقائي وإصدار شهادات</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-100 dark:border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>إنشاء كوبونات وأكواد خصم ترويجية غير محدودة لكورساتك</span>
                </div>
              </div>
            </div>

            {/* Rule Note: Age 22 vs Normal Subscription */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black text-white block">قواعد وضوابط الاشتراكات:</span>
                <p className="text-zinc-300 leading-relaxed">
                  إذا كان عمر المحاضر <strong>أكبر من 22 سنة</strong>، فإنه يشترك في <strong>الباقة العادية للمحاضر</strong> (الاشتراك الشهري 290 ج.م أو السنوي 2,900 ج.م). أما <strong>باقة المحاضر الطالب (120 ج.م)</strong> فهي منحة مخصصة لطلبة الجامعات حتى سن 22 سنة فقط بموجب إثبات قيد بكارنيه الكلية للعام الدراسي الحالي.
                </p>
              </div>
            </div>

            {/* Plans Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Plan 1: Regular Monthly */}
              <div className="p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">الباقة العادية - شهرياً</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{platformPricing.monthlyPrice}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">ج.م / شهرياً</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    الباقة الأساسية لكافة المحاضرين، الدكاترة، والخبراء من أي سن مع تجديد مرن شهر بشهر.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRenewPlan('MONTHLY');
                    setShowRenewModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
                >
                  اختيار الباقة الشهرية ({platformPricing.monthlyPrice} ج.م)
                </button>
              </div>

              {/* Plan 2: Regular Annual */}
              <div className="p-5 rounded-2xl border-2 border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 space-y-3 flex flex-col justify-between relative">
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black">
                  الأكثر توفيراً (وفر شهرين)
                </span>
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">الباقة العادية - سنوياً</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{platformPricing.annualPrice.toLocaleString('en-US')}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">ج.م / سنوياً</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    استقرار كامل لمدة 12 شهراً لكافة المحاضرين مع خصم شهرين ودعم فني مخصص.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRenewPlan('ANNUAL');
                    setShowRenewModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                >
                  اختيار الباقة السنوية (وفر شهرين)
                </button>
              </div>

              {/* Plan 3: Student Plan */}
              <div className="p-5 rounded-2xl border-2 border-purple-800/60 bg-purple-950/20 space-y-3 flex flex-col justify-between relative">
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-black">
                  سن {platformPricing.studentMaxAge} فأقل فقط
                </span>
                <div className="space-y-2 pt-3">
                  <span className="text-xs font-bold text-purple-300">باقة المحاضر الطالب (مدعومة)</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-purple-300 font-mono">{platformPricing.studentPrice}</span>
                    <span className="text-xs text-zinc-400 font-bold">ج.م / شهرياً</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    منحة مدعومة لطلبة الجامعات والمدارس لشرح المناهج لزملائهم (بإثبات الكارنيه أو الجدول الدراسي).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (userAge !== null && userAge > platformPricing.studentMaxAge) {
                      setMessage({
                        type: 'error',
                        text: `عمرك المسجل (${userAge} سنة) يتجاوز الحد الأقصى لباقة الطلاب (${platformPricing.studentMaxAge} سنة). يرجى اختيار إحدى باقات المحاضر العادية.`
                      });
                      return;
                    }
                    if (!user.isStudentInstructor || user.studentVerificationStatus !== 'APPROVED') {
                      setShowStudentVerifModal(true);
                      return;
                    }
                    setRenewPlan('STUDENT_PRO');
                    setShowRenewModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  {user.isStudentInstructor && user.studentVerificationStatus === 'APPROVED'
                    ? `اختيار باقة الطالب (${platformPricing.studentPrice} ج.م)`
                    : `إثبات الدراسة لباقة الطالب (${platformPricing.studentPrice} ج.م)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <span>إنشاء كود خصم ترويجي جديد لطلابك</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                الكوبونات التي تنشئها هنا تُطبق حصرياً على كورساتك الخاصة وتمنح طلابك تخفيضاً فورياً عند الشراء.
              </p>
            </div>

            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">كود الخصم (مثال: PRO20):</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="PRO20"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-mono font-black uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">نسبة الخصم (%):</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newCoupon.discountValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-black font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">أقصى عدد استخدامات:</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) || 100 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs font-black font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isCreatingCoupon}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingCoupon ? 'جاري الإنشاء...' : 'إضافة وتفعيل الكوبون'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              كوبونات الخصم النشطة ({coupons.length})
            </h3>
            {coupons.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                لم تقم بإنشاء أي كوبونات حتى الآن. استخدم النموذج أعلاه لإضافة أول كود خصم.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-black text-sm">
                        {c.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              navigator.clipboard.writeText(c.code);
                              setMessage({ type: 'success', text: `تم نسخ كود الكوبون: ${c.code}` });
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-amber-500 transition-colors"
                          title="نسخ الكود"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                          title="حذف الكوبون"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>نسبة الخصم: <strong className="text-slate-900 dark:text-white font-black">{c.discountValue}%</strong></span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        الاستخدام: {c._count?.usages || c.usedCount || 0} / {c.maxUses}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        {/* =====================================================================
            TAB 9: LIVE STUDIO & GOOGLE MEET SUITE (أستوديو البث المباشر)
           ===================================================================== */}
        {activeTab === 'live' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#180f33] via-[#1f123d] to-[#120a26] border-2 border-purple-500/40 shadow-2xl relative overflow-hidden space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>قاعات البث المباشر التفاعلية (Google Meet & Zoom Suite)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black">
                      VIP PRO
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    أستوديو الشرح التفاعلي ومشاركة الشاشة والكويزات الحية
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                    اشرح لطلابك مباشرة مع مشاركة الشاشة بدقة 1080p، إطلاق كويزات تفاعلية فورية ومسابقات Kahoot، فتح المايك للطلاب، والتسجيل السحابي التلقائي.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Link
                    href="/live/instant-room"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-zinc-950" />
                    <span>بدء بث مباشر فوري الآن (Launch Studio)</span>
                  </Link>
                </div>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 relative z-10 border-t border-purple-500/20">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="text-amber-400 text-xs font-black flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Screen Share HD</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">مشاركة شاشة 1080p 60fps لكافة التطبيقات</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="text-amber-400 text-xs font-black flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>كويزات حية Kahoot</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">أسئلة لحظية مع عداد زمني ولوحة شرف</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="text-amber-400 text-xs font-black flex items-center gap-1">
                    <Hand className="w-3.5 h-3.5" />
                    <span>طلب المايك للطلاب</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">نقاش صوتي مباشر ورفع اليد للأسئلة</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 space-y-1">
                  <div className="text-amber-400 text-xs font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>حماية مائية DRM</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">علامة مائية برقم الطالب تمنع التسريب</div>
                </div>
              </div>
            </div>

            {/* Scheduled Live Sessions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span>جلسات البث المباشر وورش العمل المجدولة</span>
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <div className="space-y-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                        جاهز للبث
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        جلسة البث المباشر والمراجعة التفاعلية الشاملة
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      غرفة بث دائمة مجهزة بمشاركة الشاشة، كويزات تفاعلية، وشات مدمج مع الطلاب.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(`${window.location.origin}/live/instant-room`);
                          setMessage({ type: 'success', text: 'تم نسخ رابط دعوة الطلاب لغرفة البث المباشر!' });
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ رابط الطلاب</span>
                    </button>

                    <Link
                      href="/live/instant-room"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>دخول الأستوديو</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* LUXURY INSTRUCTOR SAAS SUBSCRIPTION & RENEWAL MODAL */}
      {showRenewModal && mounted && createPortal(
        <InstructorSubscriptionModal
          isOpen={showRenewModal}
          onClose={() => setShowRenewModal(false)}
          user={user}
          platformPricing={platformPricing}
          platformSettings={platformSettings}
          onSuccess={(msg) => {
            setMessage({ type: 'success', text: msg });
            router.refresh();
          }}
          onError={(err) => {
            setMessage({ type: 'error', text: err });
          }}
          onOpenStudentVerification={() => {
            setShowRenewModal(false);
            setShowStudentVerifModal(true);
          }}
        />,
        document.body
      )}

      {/* SCREENSHOT MODAL */}
      {viewingScreenshot && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">إيصال تحويل الطالب</span>
              <button onClick={() => setViewingScreenshot(null)} className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl">
              <img src={viewingScreenshot} alt="إيصال التحويل" className="w-full h-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* NEW COURSE MODAL */}
      {showAddModal && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary-500" />
                  إنشاء كورس تدريبي جديد
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">ستتمكن بعد الإنشاء من إضافة الفيديوهات والاختبارات والمرفقات</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-bold">عنوان الكورس:</label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="مثال: دبلومة تطوير الواجهات الأمامية بـ React و Next.js"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-bold">وصف تسويقي مختصر:</label>
                <input
                  type="text"
                  value={newCourse.shortDescription}
                  onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                  placeholder="جملة موجزة تشرح الفائدة الكبرى من الكورس"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-bold">صورة الغلاف (Thumbnail):</label>
                <FileUploadInput
                  label="صورة الغلاف (Thumbnail)"
                  accept="image/*"
                  currentValue={newCourse.thumbnail}
                  onUploadComplete={(url: string) => setNewCourse((prev) => ({ ...prev, thumbnail: url }))}
                  folder="thumbnails"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-bold">سعر الكورس (ج.م):</label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-bold">المدة المتوقعة (ساعات):</label>
                  <input
                    type="number"
                    min="1"
                    value={newCourse.durationHours}
                    onChange={(e) => setNewCourse({ ...newCourse, durationHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-black shadow-md disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
                >
                  {isCreating ? 'جاري الإنشاء...' : 'إنشاء الكورس الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* COURSE DELETE CONFIRMATION MODAL */}
      {deletingCourse && mounted && createPortal(
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#111113] border border-rose-200 dark:border-rose-900/50 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد حذف الكورس</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف كورس <span className="text-slate-900 dark:text-white font-bold">"{deletingCourse.title}"</span>؟
                سيتم حذف كافة الدروس والملفات والاختبارات المرتبطة به.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCourse}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف الكورس'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* STUDENT INSTRUCTOR VERIFICATION MODAL */}
      <StudentVerificationModal
        isOpen={showStudentVerifModal}
        onClose={() => setShowStudentVerifModal(false)}
        currentUser={user}
        onSuccess={() => {
          setMessage({
            type: 'success',
            text: 'تم إرسال طلب التوثيق وتفعيل شهر مجاناً (30 يوماً) في استوديو الأكاديمية بنجاح!',
          });
          router.refresh();
        }}
      />
    </div>
  );
}

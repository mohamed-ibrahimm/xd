import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Users,
  CreditCard,
  BookOpen,
  Award,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  User,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  let studentsCount = 0;
  let coursesCount = 0;
  let diplomasCount = 0;
  let pendingPaymentsCount = 0;
  let approvedPayments: any[] = [];
  let recentOrders: any[] = [];
  let recentAudits: any[] = [];

  try {
    const res = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.diploma.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({ where: { status: 'APPROVED' }, select: { amount: true } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { officialFullName: true, email: true } },
          course: { select: { title: true } },
          diploma: { select: { title: true } },
          payment: true,
        }
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { officialFullName: true } } }
      })
    ]);
    studentsCount = res[0];
    coursesCount = res[1];
    diplomasCount = res[2];
    pendingPaymentsCount = res[3];
    approvedPayments = res[4];
    recentOrders = res[5];
    recentAudits = res[6];
  } catch (e) {
    console.error('Failed to fetch admin overview stats:', e);
  }

  const totalRevenue = approvedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">نظرة عامة والتحليلات الأكاديمية</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">متابعة فورية للمبيعات، الطلاب، المدفوعات، وسير المنصة</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {pendingPaymentsCount > 0 && (
            <Link
              href="/admin/payments"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-orange-500/20 border border-amber-400/80 text-amber-900 dark:text-amber-300 text-xs font-black flex items-center gap-2 animate-pulse shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>يوجد ({pendingPaymentsCount}) مدفوعات معلقة</span>
            </Link>
          )}
          <Link
            href="/profile"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-amber-500/40 bg-white/80 dark:bg-white/5 hover:bg-amber-500/10 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="تعديل الملف الشخصي والصورة"
          >
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>تعديل بياناتي وصورتي</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid - Multi-Color Frosted Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-white/90 dark:from-emerald-950/40 dark:to-surface border border-emerald-500/30 shadow-lg shadow-emerald-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">إجمالي الإيرادات</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatPrice(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            مدفوعات مؤكدة ومعتمدة
          </span>
        </div>

        {/* Students Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-white/90 dark:from-indigo-950/40 dark:to-surface border border-blue-500/30 shadow-lg shadow-blue-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">الطلاب المسجلين</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{studentsCount}</p>
          <span className="text-[11px] text-blue-700 dark:text-zinc-400 font-bold">حسابات نشطة بالمنصة</span>
        </div>

        {/* Courses & Diplomas Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-purple-500/15 via-fuchsia-500/5 to-white/90 dark:from-purple-950/40 dark:to-surface border border-purple-500/30 shadow-lg shadow-purple-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">الكورسات والدبلومات</span>
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{coursesCount + diplomasCount}</p>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">{coursesCount} كورس • {diplomasCount} دبلومة</span>
        </div>

        {/* Pending Review Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/5 to-white/90 dark:from-amber-950/40 dark:to-surface border border-amber-500/30 shadow-lg shadow-amber-900/5 backdrop-blur-xl space-y-2 hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">بانتظار المراجعة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{pendingPaymentsCount}</p>
          {pendingPaymentsCount > 0 ? (
            <Link href="/admin/payments" className="text-[11px] text-amber-700 dark:text-amber-400 font-black hover:underline block">
              الانتقال للمراجعة ←
            </Link>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">لا توجد طلبات معلقة</span>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">أحدث طلبات الاشتراك والمدفوعات</h3>
          <Link href="/admin/payments" className="text-xs text-primary-400 hover:underline">
            عرض كافة العمليات
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold">
                <th className="pb-3 pr-2">رقم الطلب</th>
                <th className="pb-3">الطالب</th>
                <th className="pb-3">المقرر التدريبي</th>
                <th className="pb-3">المبلغ</th>
                <th className="pb-3">وسيلة الدفع</th>
                <th className="pb-3">الحالة</th>
                <th className="pb-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {recentOrders.map((order) => {
                const isApproved = order.payment?.status === 'APPROVED' || order.status === 'COMPLETED';
                const isPending = order.payment?.status === 'PENDING';

                return (
                  <tr key={order.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="py-3 pr-2 font-mono font-bold text-slate-700 dark:text-zinc-300">{order.orderNumber}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{order.user.officialFullName}</td>
                    <td className="py-3 text-slate-800 dark:text-zinc-300 font-medium">{order.course?.title || order.diploma?.title}</td>
                    <td className="py-3 font-bold text-[#D83F8F] dark:text-primary-300">{formatPrice(order.finalAmount)}</td>
                    <td className="py-3 text-slate-600 dark:text-zinc-400">
                      {order.payment?.paymentMethod === 'INSTAPAY'
                        ? 'إنستاباي'
                        : order.payment?.paymentMethod === 'VODAFONE_CASH'
                        ? 'فودافون كاش'
                        : 'كوبون 100%'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {isApproved ? 'معتمد' : isPending ? 'معلق' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-zinc-500">{formatDate(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
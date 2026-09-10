import React from 'react';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmailLogsPage() {
  let emails: any[] = [];
  try {
    emails = await prisma.emailLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  } catch (e) {
    console.error('Failed to fetch email logs:', e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            سجلات البريد الإلكتروني وإشعارات أولياء الأمور
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            متابعة الرسائل الصادرة، إشعارات نتائج الاختبارات المرسلة لأولياء الأمور، ورسائل تفعيل الحسابات
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 font-bold">
                <th className="p-4">المستلم</th>
                <th className="p-4">عنوان الرسالة</th>
                <th className="p-4">نوع القالب</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-zinc-500">
                    لا توجد رسائل مسجلة بعد
                  </td>
                </tr>
              ) : (
                emails.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{e.recipientName || e.recipientEmail}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{e.recipientEmail}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-zinc-200">{e.subject}</td>
                    <td className="p-4 font-mono text-[10px] text-primary-600 dark:text-primary-300">{e.templateType}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          e.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {e.status === 'SENT' ? 'تم الإرسال بنجاح' : 'فشل'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-zinc-500">{formatDate(e.sentAt)}</td>
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
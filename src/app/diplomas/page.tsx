import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Award, Layers, Clock, CheckCircle2, ArrowLeft, ShieldCheck, Sparkles, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DiplomasPage() {
  let diplomas: any[] = [];
  try {
    diplomas = await prisma.diploma.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        diplomaCourses: {
          orderBy: { orderIndex: 'asc' },
          include: {
            course: {
              select: { id: true, title: true, durationHours: true, price: true }
            }
          }
        },
        _count: { select: { enrollments: true } }
      }
    });
  } catch (e) {
    console.error('Failed to fetch diplomas:', e);
  }

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505] text-slate-900 dark:text-white font-[family-name:var(--font-cairo)]">
      {/* Dynamic Background Mesh Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[5%] right-[15%] w-[550px] h-[550px] bg-pink-500/10 dark:bg-[rgba(233,79,159,0.06)] rounded-full blur-[140px]" />
        <div className="dynamic-drift-2 absolute bottom-[15%] left-[15%] w-[550px] h-[550px] bg-purple-500/10 dark:bg-[rgba(244,123,183,0.05)] rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>المسارات الشاملة المعتمدة لسوق العمل</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
            الدبلومات المهنية المتكاملة
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            دبلومات مكثفة تجمع أهم الكورسات التخصصية لإعدادك لسوق العمل وتوفير أكثر من 50% مقارنة بشراء الكورسات منفردة، مع شهادة تخرج معتمدة بكود تحقق رقمي.
          </p>
        </div>

        {/* Diplomas List */}
        <div className="space-y-8">
          {diplomas.map((diploma: any) => {
            const coursesDuration = diploma.diplomaCourses.reduce((sum: number, dc: any) => sum + (dc.course?.durationHours || 0), 0);
            const totalHours = coursesDuration > 0 ? coursesDuration : (diploma.durationHours || 0);
            const totalOriginalPrice = diploma.compareAtPrice || diploma.diplomaCourses.reduce((sum: number, dc: any) => sum + (dc.course?.price || 0), 0);
            const savings = Math.max(0, totalOriginalPrice - diploma.price);
            const discountPercent = totalOriginalPrice > diploma.price ? Math.round(((totalOriginalPrice - diploma.price) / totalOriginalPrice) * 100) : 0;

            return (
              <div
                key={diploma.id}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.20)] hover:border-[#D83F8F] dark:hover:border-[#E94F9F] shadow-xl transition-all grid grid-cols-1 lg:grid-cols-3 gap-8 backdrop-blur-xl"
              >
                {/* Left Column (Details) */}
                <div className="lg:col-span-2 space-y-6 text-start">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.12)] text-[#D83F8F] dark:text-[#E94F9F] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      دبلومة مهنية كبرى
                    </span>
                    {diploma.category && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#17171A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 font-bold">
                        {diploma.category.name}
                      </span>
                    )}
                    <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1 pr-2 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                      {formatDuration(totalHours)} تدريب مكثف
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {diploma.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
                      {diploma.description}
                    </p>
                  </div>

                  {/* Included Courses Grid */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-white/10 space-y-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
                      <span>الكورسات المتضمنة في هذه الدبلومة ({diploma.diplomaCourses.length} دورات):</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {diploma.diplomaCourses.map((dc: any, i: number) => (
                        <div
                          key={dc.id}
                          className="p-2.5 px-3 rounded-xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-md bg-pink-50 dark:bg-[rgba(233,79,159,0.15)] text-[#D83F8F] dark:text-[#E94F9F] font-black text-[10px] flex items-center justify-center shrink-0 border border-pink-200 dark:border-[rgba(233,79,159,0.25)]">
                              {i + 1}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">{dc.course?.title}</span>
                          </div>
                          <span className="text-slate-500 dark:text-zinc-400 shrink-0 text-[11px] mr-2">
                            {formatDuration(dc.course?.durationHours)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column (Card & CTA) */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-6 text-start">
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 shadow-md">
                    <img
                      src={diploma.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                      alt={diploma.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        شهادة تخرج موثقة بالـ QR Code
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold">سعر الدبلومة الشاملة:</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-[#D83F8F] dark:text-[#E94F9F]">{formatPrice(diploma.price)}</span>
                      {totalOriginalPrice > diploma.price && (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 line-through font-bold">
                          {formatPrice(totalOriginalPrice)}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                        وفر {formatPrice(savings)} ({discountPercent}%) عند الاشتراك
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/diplomas/${diploma.slug}`}
                    className="w-full py-3.5 rounded-2xl bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] text-white dark:text-black font-black text-sm shadow-lg shadow-pink-600/20 text-center transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <span>تفاصيل الدبلومة والتسجيل</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
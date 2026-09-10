import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Star,
  ArrowLeft,
  Sparkles,
  Users,
  Award,
} from 'lucide-react';

interface HomeSplitSectionProps {
  platformName?: string;
}

export default function HomeSplitSection({
  platformName = 'أكاديمية م / محمد إبراهيم',
}: HomeSplitSectionProps) {
  const checkItems = [
    'مهارات برمجية وعملية مطلوبة في سوق العمل الحديث',
    'مشاريع إنتاج حقيقية وأكواد مبنية على أحدث المعايير',
    'فصول تفاعلية ومجموعات نقاش وتطبيق هندسي مباشر',
    'دعم فني وأكاديمي مستمر وتوجيه فردي لكل طالب',
    'أسعار في متناول الجميع مع باقات واشتراكات ميسرة',
  ];

  const teachers = [
    {
      name: 'م / محمد إبراهيم',
      role: 'مهندس برمجيات أول ومؤسس الأكاديمية',
      rating: '4.9',
      reviews: '520+ تقييم',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
    {
      name: 'م / سارة أحمد',
      role: 'مهندسة ذكاء اصطناعي وتعلم آلة',
      rating: '4.9',
      reviews: '480+ تقييم',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
    {
      name: 'م / أحمد عادل',
      role: 'مهندس نظم ومطور Full-Stack',
      rating: '4.8',
      reviews: '450+ تقييم',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-16 sm:my-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* =========================================================================
            SIDE 1: WHY CHOOSE US (لماذا تختار منصة م / محمد إبراهيم؟)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111113] rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 dark:border-[rgba(233,79,159,0.16)] shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] text-[#D83F8F] dark:text-[#E94F9F] border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                <span>التميز والريادة الهندسية</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#FAFAFA] leading-tight">
                لماذا تختار منصة م / محمد إبراهيم؟
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#C5C5C8] font-medium leading-relaxed">
                صممنا بيئة تعليمية تفاعلية شاملة تركز على التطبيق العملي وتمكينك من بناء مشاريع احترافية تنافس بها عالمياً.
              </p>
            </div>

            {/* Checklist with round magenta badges */}
            <div className="space-y-3.5 pt-2">
              {checkItems.map((text, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.15)] dark:text-[#E94F9F] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 fill-[#D83F8F] dark:fill-[#E94F9F] text-white dark:text-[#080808]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#FAFAFA] leading-snug">
                    {text}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Trust Badge */}
          <div className="pt-8 mt-6 border-t border-slate-100 dark:border-[rgba(233,79,159,0.15)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] text-[#D83F8F] dark:text-[#E94F9F] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-[#FAFAFA]">شهادات معتمدة برمز QR</p>
                <p className="text-[11px] text-slate-500 dark:text-[#C5C5C8] font-medium">قابلة للمشاركة على LinkedIn</p>
              </div>
            </div>
            <span className="text-xs font-black text-[#D83F8F] dark:text-[#E94F9F]">100% موثوقة</span>
          </div>

        </div>

        {/* =========================================================================
            SIDE 2: LEARN FROM AMAZING TEACHERS (PREMIUM BLACK CONTAINER)
           ========================================================================= */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-[#111113] to-[#0A0A0C] dark:from-[#0A0A0C] dark:via-[#111113] dark:to-[#050505] border border-slate-200 dark:border-[rgba(233,79,159,0.18)] rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
          
          {/* Subtle decorative background circles */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/15 dark:bg-[rgba(233,79,159,0.12)] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/15 dark:bg-[rgba(244,123,183,0.10)] rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Title + Magenta Button */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                <span>تعلم من </span>
                <span className="text-[#F47BB7] dark:text-[#E94F9F] font-black">نخبة المهندسين والمحاضرين</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 dark:text-[#C5C5C8] font-medium max-w-md leading-relaxed">
                مهندسونا شغوفون بنقل الخبرة العملية وتدريبك خطوة بخطوة حتى تصبح متمكناً في سوق العمل.
              </p>
            </div>

            <Link
              href="/instructors/join?track=expert"
              className="px-5 py-2.5 rounded-full bg-[#D83F8F] hover:bg-[#B83278] text-white dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] dark:text-[#080808] font-black text-xs transition-all shadow-lg dark:shadow-[0_8px_30px_rgba(233,79,159,0.20)] hover:scale-105 flex items-center gap-1.5 shrink-0 self-start sm:self-auto border border-pink-600/30 dark:border-[rgba(233,79,159,0.40)]"
            >
              <span>تعرف على طاقم التدريس</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Teacher Cards Grid inside the container */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {teachers.map((t, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#17171A] rounded-2xl p-3 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-right group border border-slate-100 dark:border-[rgba(233,79,159,0.14)] dark:hover:border-[#E94F9F]/40 backdrop-blur-xl"
              >
                {/* Teacher Photo */}
                <div className="h-36 sm:h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#111113] mb-3 relative">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{t.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 dark:text-[#FAFAFA] text-xs sm:text-sm group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#C5C5C8] font-medium line-clamp-1">
                    {t.role}
                  </p>
                  <p className="text-[10px] text-[#D83F8F] dark:text-[#E94F9F] font-bold pt-1">
                    {t.reviews}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

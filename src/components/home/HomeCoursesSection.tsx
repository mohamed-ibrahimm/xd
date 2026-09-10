'use client';

import React from 'react';
import Link from 'next/link';
import {
  Star,
  ArrowLeft,
  BookOpen,
  Code2,
  Sparkles,
  Flame,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface HomeCoursesSectionProps {
  initialCourses: any[];
  categories?: any[];
}

const FALLBACK_COURSES = [
  {
    id: 'course-1',
    title: 'دبلومة هندسة الويب الشاملة Full-Stack (Next.js & Node.js)',
    shortDescription: 'من الصفر حتى احتراف بناء التطبيقات السحابية وقواعد البيانات ونشر المشاريع الحية.',
    slug: 'fullstack-web-engineering',
    price: 499,
    compareAtPrice: 999,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    category: { name: 'تطوير البرمجيات' },
    instructor: {
      officialFullName: 'م / محمد إبراهيم',
      avatarUrl: null,
    },
    level: 'جميع المستويات',
  },
  {
    id: 'course-2',
    title: 'هندسة الذكاء الاصطناعي وتطبيقات الـ LLMs المتقدمة',
    shortDescription: 'بناء وكلاء أذكياء (AI Agents)، نماذج لغوية، وربطها بأنظمة الأعمال والـ APIs.',
    slug: 'ai-engineering-and-agents',
    price: 599,
    compareAtPrice: 1200,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    category: { name: 'الذكاء الاصطناعي' },
    instructor: {
      officialFullName: 'م / محمد إبراهيم',
      avatarUrl: null,
    },
    level: 'متقدم',
  },
  {
    id: 'course-3',
    title: 'احتراف هندسة النظم وتصميم المعماريات البرمجية (System Design)',
    shortDescription: 'تصميم أنظمة ضخمة تتحمل ملايين المستخدمين مع إدارة السيرفرات وقواعد البيانات الموزعة.',
    slug: 'system-design-mastery',
    price: 399,
    compareAtPrice: 799,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    category: { name: 'هندسة النظم' },
    instructor: {
      officialFullName: 'م / محمد إبراهيم',
      avatarUrl: null,
    },
    level: 'شامل',
  },
];

export default function HomeCoursesSection({
  initialCourses = [],
}: HomeCoursesSectionProps) {
  // Take exactly the top 3 courses (or fallback if empty)
  const displayCourses = initialCourses && initialCourses.length >= 3
    ? initialCourses.slice(0, 3)
    : initialCourses && initialCourses.length > 0
    ? [...initialCourses, ...FALLBACK_COURSES.slice(initialCourses.length, 3)]
    : FALLBACK_COURSES;

  return (
    <section id="popular-courses" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-14 sm:my-20 scroll-mt-24">
      <div className="space-y-10 sm:space-y-12">
        
        {/* =========================================================================
            1. SECTION HEADER: ELEGANT, SPACIOUS & COMFORTABLE
           ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] text-[#D83F8F] dark:text-[#E94F9F] border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
            <span>الكورسات والمسارات الأكثر طلباً لعام 2026</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-[#FAFAFA] tracking-tight leading-tight">
            اختر مسارك البرمجي وابدأ رحلتك اليوم
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#C5C5C8] font-medium leading-relaxed max-w-xl mx-auto">
            مناهج هندسية وتطبيقية شاملة مبنية لتؤهلك لسوق العمل وتزودك بالخبرة الواقعية اللازمة للتفوق.
          </p>
        </div>

        {/* =========================================================================
            2. SINGLE ROW OF 3 LUXURY CLASSIC COURSE CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayCourses.map((course: any, idx: number) => {
            const imageSrc = course.thumbnail || FALLBACK_COURSES[idx % FALLBACK_COURSES.length].thumbnail;
            const instructorName = course.instructor?.officialFullName ||
              `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() ||
              'م / محمد إبراهيم';
            const cleanInstructor = instructorName.replace(/سنجر/g, '').trim();

            const description = course.shortDescription && course.shortDescription.length > 5 && !course.shortDescription.includes('سسس')
              ? course.shortDescription
              : course.description && course.description.length > 5 && !course.description.includes('سسس')
              ? course.description
              : 'مشاريع عملية مكثفة تؤهلك لاحتراف التقنية والعمل الحر.';

            const hasDiscount = course.compareAtPrice && course.compareAtPrice > course.price;
            const discountPercent = hasDiscount
              ? Math.round(((course.compareAtPrice - course.price) / course.compareAtPrice) * 100)
              : 0;

            return (
              <div
                key={course.id || idx}
                className="group relative rounded-3xl bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.18)] hover:border-pink-300 dark:hover:border-[#E94F9F]/60 shadow-lg shadow-slate-900/5 dark:shadow-[0_16px_40px_rgba(0,0,0,0.8)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-black/90">
                  <img
                    src={imageSrc}
                    alt={course.title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                  {/* Top Bar inside Image: Discount Badge & Rating */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                    {hasDiscount ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-[#080808] text-[11px] font-black shadow-md flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-300 dark:text-[#080808]" />
                        <span>خصم {discountPercent}%</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/90 sm:backdrop-blur-md text-white text-[11px] font-bold">
                        {course.category?.name || 'مسار معتمد'}
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-full bg-black/85 sm:backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                    </span>
                  </div>

                  {/* Bottom of Image: Category & Level */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs font-semibold pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 sm:bg-white/20 sm:backdrop-blur-md text-[11px] border border-white/20">
                      {course.category?.name || 'علوم الحاسب'}
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      {course.durationHours ? `${course.durationHours} ساعة تدريبية` : 'مكثف ومباشر'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 text-start">
                  
                  <div className="space-y-2.5">
                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                      <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-[rgba(233,79,159,0.18)] text-[#D83F8F] dark:text-[#E94F9F] flex items-center justify-center font-black text-[10px] shrink-0 border border-pink-200/60 dark:border-[rgba(233,79,159,0.30)]">
                        {cleanInstructor.charAt(0) || 'م'}
                      </div>
                      <span className="font-bold truncate text-slate-800 dark:text-zinc-300">
                        {cleanInstructor}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#FAFAFA] group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-[#C5C5C8] leading-relaxed line-clamp-2 font-medium">
                      {description}
                    </p>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                    
                    {/* Price Display */}
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium">السعر:</span>
                      <div className="flex items-baseline gap-1.5">
                        {course.price > 0 ? (
                          <>
                            <span className="text-lg sm:text-xl font-black text-[#D83F8F] dark:text-[#E94F9F]">
                              {formatPrice(course.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                                {formatPrice(course.compareAtPrice)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            مجاناً
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/courses/${course.slug}`}
                      className="px-4 py-2.5 rounded-full text-xs font-black text-white dark:text-[#080808] bg-[#D83F8F] hover:bg-[#B83278] dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] shadow-md shadow-pink-600/20 dark:shadow-[0_4px_20px_rgba(233,79,159,0.25)] flex items-center gap-1.5 transition-all group-hover:scale-105 shrink-0"
                    >
                      <span>تفاصيل الكورس</span>
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    </Link>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. CENTERED "BROWSE ALL COURSES" CTA BUTTON
           ========================================================================= */}
        <div className="text-center pt-2 sm:pt-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-black text-white dark:text-[#080808] bg-slate-900 hover:bg-slate-800 dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] shadow-xl dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] hover:scale-105 active:scale-95 transition-all border border-slate-900/10 dark:border-[rgba(233,79,159,0.40)] cursor-pointer"
          >
            <span>تصفح جميع الكورسات</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

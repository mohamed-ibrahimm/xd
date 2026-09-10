'use client';

import React from 'react';
import {
  GraduationCap,
  Clock,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

interface FeatureBarProps {
  platformName?: string;
}

export default function HomeFeatureBar({ platformName }: FeatureBarProps) {
  const { t } = useLanguage();

  const features = [
    {
      title: t('تعلم مخصص لاحتياجاتك', 'Personalized Learning for Your Needs'),
      description: t('مسارات دراسية مرنة تناسب وتيرة تعلمك وأهدافك المهنية', 'Flexible learning tracks tailored to your pace and career goals'),
      icon: GraduationCap,
      bgCircle: 'bg-pink-500/10 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.12)] dark:text-[#E94F9F] dark:border dark:border-[rgba(233,79,159,0.25)]',
    },
    {
      title: t('جدول مرن في أي وقت', 'Flexible Schedule Anytime'),
      description: t('محاضرات مسجلة وتطبيقية متاحة 24/7 من أي جهاز', 'Recorded and hands-on lectures available 24/7 on any device'),
      icon: Clock,
      bgCircle: 'bg-pink-500/10 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.12)] dark:text-[#E94F9F] dark:border dark:border-[rgba(233,79,159,0.25)]',
    },
    {
      title: t('نخبة من المهندسين الخبراء', 'Elite Expert Engineers'),
      description: t('تدريب عملي ومباشر من كبار المهندسين والمحاضرين المعتمدين', 'Direct hands-on training from senior engineers and certified instructors'),
      icon: Award,
      bgCircle: 'bg-pink-500/10 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.12)] dark:text-[#E94F9F] dark:border dark:border-[rgba(233,79,159,0.25)]',
    },
    {
      title: t('متابعة دقيقة لتقدمك', 'Detailed Progress Tracking'),
      description: t('لوحة تحكم ذكية لمراقبة أدائك، واجباتك، ومشاريع تخرجك', 'Smart dashboard to monitor your performance, assignments, and capstones'),
      icon: TrendingUp,
      bgCircle: 'bg-pink-500/10 text-[#D83F8F] dark:bg-[rgba(233,79,159,0.12)] dark:text-[#E94F9F] dark:border dark:border-[rgba(233,79,159,0.25)]',
    },
  ];

  return (
    <section id="platform-features" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6 sm:mt-8 mb-12 sm:mb-16 relative z-20 scroll-mt-28">
      {/* Seamless Ambient Glow Flare bridging Hero to Features (Desktop only) */}
      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 dark:from-[rgba(233,79,159,0.06)] dark:via-[#111113]/30 dark:to-transparent blur-3xl -z-10 pointer-events-none rounded-3xl" />
      
      <div className="bg-white/95 dark:bg-[#111113]/90 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl shadow-slate-900/5 dark:shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-slate-200/80 dark:border-[rgba(233,79,159,0.16)] backdrop-blur-none sm:backdrop-blur-2xl transition-all duration-300 hover:shadow-2xl hover:dark:border-[#E94F9F]/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-100 dark:divide-white/[0.08]">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 ${idx > 0 ? 'pt-5 sm:pt-0 lg:pr-6' : ''} group transition-transform duration-300 hover:translate-x-0.5`}
              >
                {/* Magenta Glass Icon Badge */}
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl ${item.bgCircle} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                {/* Text Content */}
                <div className="text-start space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-[#FAFAFA] text-sm sm:text-base leading-snug group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#C5C5C8] leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

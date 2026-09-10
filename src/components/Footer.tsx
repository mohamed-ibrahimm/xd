import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Phone,
  MessageCircle,
  Send,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  ShieldCheck,
  Award,
  BookOpen,
  CreditCard,
  Smartphone,
  Zap,
  Wallet,
  Building2,
} from 'lucide-react';

interface FooterProps {
  initialSettings?: Record<string, string>;
}

export default function Footer({ initialSettings }: FooterProps) {
  const platformName = (initialSettings?.['PLATFORM_NAME'] || 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim() || 'أكاديمية م / محمد إبراهيم';
  const platformTagline = initialSettings?.['PLATFORM_TAGLINE'] || 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم ومشاريع الإنتاج الفعلية.';

  const rawWhatsApp = initialSettings?.['WHATSAPP_NUMBER'] || initialSettings?.['CONTACT_WHATSAPP'] || initialSettings?.['CONTACT_PHONE'] || '';
  const safeWhatsApp = (rawWhatsApp && !rawWhatsApp.includes('1001234567')) ? rawWhatsApp : '01555791568';
  const whatsappNum = safeWhatsApp.replace(/[^0-9]/g, '');
  let formattedWhatsapp = whatsappNum;
  if (formattedWhatsapp.startsWith('002')) {
    formattedWhatsapp = formattedWhatsapp.slice(2);
  } else if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '2' + formattedWhatsapp;
  } else if (formattedWhatsapp.length === 10 && formattedWhatsapp.startsWith('1')) {
    formattedWhatsapp = '20' + formattedWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${formattedWhatsapp}`;

  const contactEmail = initialSettings?.['CONTACT_EMAIL'] ? `mailto:${initialSettings['CONTACT_EMAIL']}` : '';
  const facebookUrl = initialSettings?.['FACEBOOK_URL'] || '';
  const telegramUrl = initialSettings?.['TELEGRAM_URL'] || '';
  const youtubeUrl = initialSettings?.['YOUTUBE_URL'] || '';
  const linkedinUrl = initialSettings?.['LINKEDIN_URL'] || '';

  return (
    <footer className="w-full bg-white dark:bg-[#050505] border-t border-slate-100 dark:border-[rgba(233,79,159,0.14)] mt-20 pt-16 pb-12 text-slate-600 dark:text-[#C5C5C8] relative">
      {/* Top subtle accent edge */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E94F9F]/30 to-transparent pointer-events-none" />

      {/* 5-Column Master Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
        
        {/* 1. Brand Information */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#B83278] via-[#E94F9F] to-[#FF5CAD] dark:from-[#E94F9F] dark:via-[#FF5CAD] dark:to-[#F47BB7] p-[2px] shadow-md">
              <div className="w-full h-full bg-white dark:bg-[#050505] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#D83F8F] dark:text-[#E94F9F]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-[#FAFAFA]">{platformName}</h3>
              <p className="text-[11px] text-[#D83F8F] dark:text-[#E94F9F] font-medium">التميز الأكاديمي والمهني المعتمد</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-[#C5C5C8]">
            {platformTagline}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200/80 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-[11px] font-bold">
              <Award className="w-3.5 h-3.5" />
              شهادات معتمدة بكود تحقق رقمي
            </span>
          </div>
        </div>

        {/* 2. Quick Links (روابط سريعة) */}
        <div className="text-right">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#FAFAFA] mb-4 border-b border-slate-100 dark:border-[rgba(233,79,159,0.15)] pb-2 inline-block">
            روابط سريعة
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/courses" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D83F8F]/70 dark:text-[#E94F9F]/70" />
                <span>الدورات التدريبية</span>
              </Link>
            </li>
            <li>
              <Link href="/diplomas" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#D83F8F]/70 dark:text-[#E94F9F]/70" />
                <span>الدبلومات الشاملة</span>
              </Link>
            </li>
            <li>
              <Link href="/verify" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D83F8F]/70 dark:text-[#E94F9F]/70" />
                <span>التحقق من صحة الشهادات</span>
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D83F8F]/70 dark:bg-[#E94F9F]/70" />
                <span>مركز المساعدة والدعم</span>
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D83F8F]/70 dark:bg-[#E94F9F]/70" />
                <span>الشروط وسياسة الاستخدام</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D83F8F]/70 dark:bg-[#E94F9F]/70" />
                <span>سياسة الخصوصية والأمان</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Specialized Paths (المسارات التخصصية) */}
        <div className="text-right">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#FAFAFA] mb-4 border-b border-slate-100 dark:border-[rgba(233,79,159,0.15)] pb-2 inline-block">
            المسارات التخصصية
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-[#C5C5C8]">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E94F9F]" />
              <span>Full-Stack Next.js 15 & Node.js</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F47BB7]" />
              <span>الذكاء الاصطناعي وتعلم الآلة</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5CAD]" />
              <span>تطبيقات الموبايل وFlutter</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E94F9F]" />
              <span>DevOps والبنية التحتية السحابية</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B83278]" />
              <span>الأمن السيبراني والشبكات</span>
            </li>
          </ul>
        </div>

        {/* 4. Payment Methods Box (مربع طرق الدفع المعتمدة) */}
        <div className="text-right">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#FAFAFA] mb-4 border-b border-slate-100 dark:border-[rgba(233,79,159,0.15)] pb-2 inline-block">
            طرق الدفع المعتمدة
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors">
              <Zap className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F] shrink-0" />
              <span>InstaPay (إنستاباي فوري)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-red-500 transition-colors">
              <Smartphone className="w-3.5 h-3.5 text-[#FF5470] shrink-0" />
              <span>فودافون كاش & أورنج كاش</span>
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-[#00D9C0] transition-colors">
              <CreditCard className="w-3.5 h-3.5 text-[#00D9C0] shrink-0" />
              <span>بطاقات Visa & Mastercard</span>
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F] shrink-0" />
              <span>كارت ميزة الوطني المحلي</span>
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-amber-600 dark:hover:text-[#F5C542] transition-colors">
              <Wallet className="w-3.5 h-3.5 text-[#F5C542] shrink-0" />
              <span>فوري Pay والمحافظ الذكية</span>
            </li>
            <li className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-slate-900 dark:hover:text-white transition-colors">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-[#85858A] shrink-0" />
              <span>تحويل بنكي مباشر آمن 100%</span>
            </li>
          </ul>
        </div>

        {/* 5. Direct Channels & Newsletter */}
        <div className="text-right space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-[#FAFAFA] border-b border-slate-100 dark:border-[rgba(233,79,159,0.15)] pb-2 inline-block">
            تواصل معنا
          </h4>
          <div className="space-y-3 text-xs">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#25D366] hover:opacity-90 transition-colors font-medium bg-emerald-50/50 dark:bg-[#111113] p-2.5 rounded-xl border border-emerald-200/80 dark:border-[rgba(37,211,102,0.25)] hover:scale-[1.02] active:scale-98 transition-transform"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>واتساب الدعم الفني (فوري)</span>
              </a>
            )}

            {contactEmail && (
              <a
                href={contactEmail}
                className="flex items-center gap-2 text-slate-600 dark:text-[#C5C5C8] hover:text-[#D83F8F] dark:hover:text-[#E94F9F] transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0 text-[#D83F8F] dark:text-[#E94F9F]" />
                <span>البريد الإلكتروني للإدارة</span>
              </a>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-[#D83F8F] dark:bg-white/[0.05] dark:hover:bg-[rgba(233,79,159,0.15)] dark:text-[#C5C5C8] dark:hover:text-[#E94F9F] flex items-center justify-center transition-colors border border-slate-200/60 dark:border-[rgba(233,79,159,0.15)]"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-white/[0.05] dark:hover:bg-[#FF5470]/20 dark:text-[#C5C5C8] dark:hover:text-[#FF5470] flex items-center justify-center transition-colors border border-slate-200/60 dark:border-[rgba(233,79,159,0.15)]"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-[#D83F8F] dark:bg-white/[0.05] dark:hover:bg-[rgba(233,79,159,0.15)] dark:text-[#C5C5C8] dark:hover:text-[#E94F9F] flex items-center justify-center transition-colors border border-slate-200/60 dark:border-[rgba(233,79,159,0.15)]"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-100 dark:border-[rgba(233,79,159,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-slate-500 dark:text-[#85858A] font-medium">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {platformName}. صُممت المنصة بأحدث المعايير البرمجية والتصميمية الحديثة.</p>
        <p className="flex items-center gap-1 text-slate-700 dark:text-[#C5C5C8]">
          <span>بإشراف وقيادة</span>
          <strong className="text-[#D83F8F] dark:text-[#E94F9F] font-bold">{platformName}</strong>
        </p>
      </div>
    </footer>
  );
}
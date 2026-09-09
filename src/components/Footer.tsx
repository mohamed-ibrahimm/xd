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
    <footer className="w-full bg-[#080710] border-t border-white/[0.06] mt-20 pt-16 pb-12 text-slate-400 relative">
      {/* Top subtle purple/gold accent edge */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/25 dark:via-[#00e55b]/25 via-purple-500/25 to-transparent pointer-events-none" />

      {/* 5-Column Master Footer Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
        
        {/* 1. Brand Information */}
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-amber-400 dark:to-[#00e55b] p-[2px] shadow-lg shadow-purple-950/50">
              <div className="w-full h-full bg-[#0c0918] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-400 dark:text-[#00e55b]" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{platformName}</h3>
              <p className="text-[11px] text-amber-300 dark:text-[#70ff9b] font-medium">التميز الأكاديمي والمهني المعتمد</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            {platformTagline}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 dark:bg-[#00e55b]/10 dark:border-[#00e55b]/25 dark:text-[#70ff9b] text-[11px] font-bold">
              <Award className="w-3.5 h-3.5" />
              شهادات معتمدة بكود تحقق رقمي
            </span>
          </div>
        </div>

        {/* 2. Quick Links (روابط سريعة) */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 border-b border-white/[0.08] pb-2 inline-block">
            روابط سريعة
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/courses" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400/70 dark:text-[#00e55b]/70" />
                <span>الدورات التدريبية</span>
              </Link>
            </li>
            <li>
              <Link href="/diplomas" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400/70 dark:text-[#00e55b]/70" />
                <span>الدبلومات الشاملة</span>
              </Link>
            </li>
            <li>
              <Link href="/verify" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400/70 dark:text-[#00e55b]/70" />
                <span>التحقق من صحة الشهادات</span>
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 dark:bg-[#00e55b]/70" />
                <span>مركز المساعدة والدعم</span>
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 dark:bg-[#00e55b]/70" />
                <span>الشروط وسياسة الاستخدام</span>
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                <span>سياسة الخصوصية والأمان</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Specialized Paths (المسارات التخصصية) */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 border-b border-white/[0.08] pb-2 inline-block">
            المسارات التخصصية
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400/70" />
              <span>Full-Stack Next.js 15 & Node.js</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400/70" />
              <span>الذكاء الاصطناعي وهندسة الأوامر</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
              <span>تصميم الواجهات UI/UX والموبايل</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              <span>DevOps والبنية التحتية السحابية</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400/70" />
              <span>الأمن السيبراني واختبار الاختراق</span>
            </li>
          </ul>
        </div>

        {/* 4. Payment Methods Box (مربع طرق الدفع المعتمدة) */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 border-b border-white/[0.08] pb-2 inline-block">
            طرق الدفع المعتمدة
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2 text-slate-300 hover:text-purple-300 transition-colors">
              <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>InstaPay (إنستاباي فوري)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-red-300 transition-colors">
              <Smartphone className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>فودافون كاش & أورنج كاش</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-blue-300 transition-colors">
              <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>بطاقات Visa & Mastercard</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>كارت ميزة الوطني المحلي</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-amber-300 dark:hover:text-[#70ff9b] transition-colors">
              <Wallet className="w-3.5 h-3.5 text-amber-400 dark:text-[#00e55b] shrink-0" />
              <span>فوري Pay والمحافظ الذكية</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>تحويل بنكي مباشر آمن 100%</span>
            </li>
          </ul>
        </div>

        {/* 5. Direct Channels (قنوات التواصل المباشرة) */}
        <div>
          <h4 className="text-sm font-bold text-white mb-4 border-b border-white/[0.08] pb-2 inline-block">
            قنوات التواصل المباشرة
          </h4>
          <div className="space-y-3 text-xs">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors font-medium bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 hover:scale-[1.02] active:scale-98 transition-transform"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>الدعم الفني عبر واتساب (فوري)</span>
              </a>
            )}

            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>قناة التليجرام الرسمية</span>
              </a>
            )}

            {contactEmail && (
              <a
                href={contactEmail}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0 text-amber-400 dark:text-[#00e55b]" />
                <span>البريد الإلكتروني للإدارة</span>
              </a>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-blue-600/30 text-slate-300 hover:text-blue-400 flex items-center justify-center transition-colors border border-white/[0.08]"
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
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-600/30 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors border border-white/[0.08]"
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
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-sky-600/30 text-slate-300 hover:text-sky-400 flex items-center justify-center transition-colors border border-white/[0.08]"
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] text-slate-400 dark:text-zinc-300 font-medium">
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {platformName}. صُممت المنصة بأحدث معايير الأمان وتطوير البرمجيات الحديثة.</p>
        <p className="flex items-center gap-1 text-slate-300 dark:text-zinc-200">
          <span>بإشراف وقيادة</span>
          <strong className="text-amber-400 dark:text-[#00e55b] font-bold">{platformName}</strong>
        </p>
      </div>
    </footer>
  );
}
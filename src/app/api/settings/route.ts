import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.platformSetting.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    // Sanitize settings: strip any sensitive credentials or secrets
    const safeSettingsMap: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) {
      const upper = k.toUpperCase();
      if (
        !upper.includes('SECRET') &&
        !upper.includes('KEY') &&
        !upper.includes('PASS') &&
        !upper.includes('TOKEN') &&
        !upper.includes('CREDENTIAL') &&
        !upper.includes('PRIVATE')
      ) {
        safeSettingsMap[k] = v;
      }
    }

    const rawWhatsapp = map['WHATSAPP_NUMBER'] || map['CONTACT_WHATSAPP'] || map['CONTACT_PHONE'] || '';
    const safeWhatsapp = (rawWhatsapp && !rawWhatsapp.includes('1001234567')) ? rawWhatsapp : '01555791568';
    
    return NextResponse.json({
      settings: safeSettingsMap,
      platformName: (map['PLATFORM_NAME'] || 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim() || 'أكاديمية م / محمد إبراهيم',
      platformTagline: map['PLATFORM_TAGLINE'] || 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم',
      watermarkEnabled: map['WATERMARK_ENABLED'] !== 'false',
      whatsappNumber: safeWhatsapp,
      contactEmail: map['CONTACT_EMAIL'] || '',
      facebookUrl: map['FACEBOOK_URL'] || '',
      telegramUrl: map['TELEGRAM_URL'] || '',
      youtubeUrl: map['YOUTUBE_URL'] || '',
      linkedinUrl: map['LINKEDIN_URL'] || '',
      
      // SaaS Subscription Prices & Limits
      instructorPriceMonthly: map['INSTRUCTOR_PRICE_MONTHLY'] || '290',
      instructorPriceAnnual: map['INSTRUCTOR_PRICE_ANNUAL'] || '1499',
      instructorPriceStudent: map['INSTRUCTOR_PRICE_STUDENT'] || '120',
      studentMaxAge: map['STUDENT_MAX_AGE'] || '22',
      studentTrialDays: map['STUDENT_TRIAL_DAYS'] || '14',
      instructorTrialDays: map['INSTRUCTOR_TRIAL_DAYS'] || '14',
      platformCommissionPercent: map['PLATFORM_COMMISSION_PERCENT'] || '0',

      // CMS Page Texts
      heroTitle: map['HERO_TITLE'] || '',
      heroSubtitle: map['HERO_SUBTITLE'] || '',
      heroBtnExpert: map['HERO_BTN_EXPERT'] || `انضم كـ مدرس أو دكتور (${map['INSTRUCTOR_TRIAL_DAYS'] || '14'} يوماً مجاناً • 0% عمولة)`,
      heroBtnStudent: map['HERO_BTN_STUDENT'] || `اشترك كمحاضر طالب (منحة ${map['STUDENT_TRIAL_DAYS'] || '14'} يوماً مجاناً)`,
      bannerText: map['BANNER_TEXT'] || '',
      bannerEnabled: map['BANNER_ENABLED'] !== 'false',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (e) {
    return NextResponse.json({
      settings: {},
      platformName: 'أكاديمية م / محمد إبراهيم',
      platformTagline: 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم',
      watermarkEnabled: true,
      whatsappNumber: '+201001234567',
      contactEmail: '',
      facebookUrl: '',
      telegramUrl: '',
      youtubeUrl: '',
      linkedinUrl: '',
      instructorPriceMonthly: '290',
      instructorPriceAnnual: '1499',
      instructorPriceStudent: '120',
      studentMaxAge: '22',
      studentTrialDays: '30',
      instructorTrialDays: '14',
      platformCommissionPercent: '0',
    });
  }
}
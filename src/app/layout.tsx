import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Arabic, Cairo } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import JsonLd from '@/components/seo/JsonLd';

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex',
  preload: true,
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
  preload: true,
});

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  let title = 'أكاديمية م / محمد إبراهيم';
  let description = 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم ومشاريع الإنتاج الحقيقية.';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mohamedibrahim-chi.vercel.app';

  try {
    const settings = await prisma.platformSetting.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (map['PLATFORM_NAME']) title = map['PLATFORM_NAME'].replace(/سنجر/g, '').trim() || title;
    if (map['PLATFORM_TAGLINE']) description = map['PLATFORM_TAGLINE'];
  } catch (e) {}

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${title} | ${description}`,
      template: `%s | ${title}`,
    },
    description,
    keywords: [
      'أكاديمية محمد إبراهيم',
      'كورسات برمجة',
      'دبلومات معتمدة',
      'ذكاء اصطناعي',
      'هندسة البرمجيات',
      'مذكرات برمجية',
      'تعليم برمجة للمبتدئين',
      'Next.js',
      'TypeScript',
      'Python',
      'Full Stack',
      title,
    ],
    authors: [{ name: 'م / محمد إبراهيم', url: baseUrl }],
    creator: title,
    publisher: title,
    category: 'education',
    alternates: {
      canonical: '/',
      languages: {
        'ar-EG': '/',
        'ar': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'ar_EG',
      url: baseUrl,
      siteName: title,
      title: `${title} | ${description}`,
      description,
      images: [
        {
          url: '/icon.svg',
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${description}`,
      description,
      images: ['/icon.svg'],
      creator: '@qimam_academy',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let platformName = 'أكاديمية م / محمد إبراهيم';
  let platformTagline = 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم';
  let settingsMap: Record<string, string> = {};
  let user: any = null;

  try {
    const settings = await prisma.platformSetting.findMany();
    settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    if (settingsMap['PLATFORM_NAME']) platformName = settingsMap['PLATFORM_NAME'].replace(/سنجر/g, '').trim() || platformName;
    if (settingsMap['PLATFORM_TAGLINE']) platformTagline = settingsMap['PLATFORM_TAGLINE'];
  } catch (e) {}

  try {
    user = await getCurrentUser();
  } catch (e) {}

  return (
    <html lang="ar" dir="rtl" className={`${ibmPlex.variable} ${cairo.variable} font-sans dark`} data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <JsonLd
          platformName={platformName}
          platformTagline={platformTagline}
          settings={settingsMap}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('qimam_theme_v2') || localStorage.getItem('qimam_theme');
                if (t === 'LIGHT') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light-theme');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.remove('light-theme');
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
                var l = localStorage.getItem('qimam_lang');
                if (l === 'en') {
                  document.documentElement.setAttribute('lang', 'en');
                  document.documentElement.setAttribute('dir', 'ltr');
                  document.documentElement.classList.add('lang-en');
                } else {
                  document.documentElement.setAttribute('lang', 'ar');
                  document.documentElement.setAttribute('dir', 'rtl');
                  document.documentElement.classList.remove('lang-en');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${ibmPlex.className} min-h-screen antialiased selection:bg-[#E94F9F] selection:text-[#080808] relative overflow-x-hidden w-full`} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell
              initialUser={user}
              initialPlatformName={platformName}
              initialPlatformTagline={platformTagline}
              initialSettings={settingsMap}
            >
              {children}
            </AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import { ThemeProvider } from '@/components/ThemeProvider';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import JsonLd from '@/components/seo/JsonLd';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
  preload: true,
});

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#0c0918',
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} font-sans dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />

        <JsonLd
          platformName={platformName}
          platformTagline={platformTagline}
          settings={settingsMap}
        />
      </head>
      <body className={`${cairo.className} min-h-screen antialiased selection:bg-amber-500 selection:text-black relative`} suppressHydrationWarning>
        <ThemeProvider>
          <AppShell
            initialUser={user}
            initialPlatformName={platformName}
            initialPlatformTagline={platformTagline}
            initialSettings={settingsMap}
          >
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
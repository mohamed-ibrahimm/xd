'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  GraduationCap,
  Award,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Sparkles,
  Video,
  ArrowLeft,
  FileText,
  Radio,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

interface HeaderProps {
  initialPlatformName?: string;
  initialPlatformTagline?: string;
  initialSettings?: Record<string, string>;
  initialUser?: any;
}

export default function Header({
  initialPlatformName = 'أكاديمية م / محمد إبراهيم',
  initialPlatformTagline = 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم',
  initialSettings,
  initialUser = null,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(top > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const cleanInitialName = (initialPlatformName || 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim();
  const [platformName, setPlatformName] = useState(cleanInitialName || 'أكاديمية م / محمد إبراهيم');
  const [platformTagline, setPlatformTagline] = useState(initialPlatformTagline || 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم');

  // Sync if prop updates from server
  useEffect(() => {
    if (initialUser !== undefined) {
      if (initialUser?.officialFullName) {
        initialUser.officialFullName = initialUser.officialFullName.replace(/سنجر/g, '').trim();
      }
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  useEffect(() => {
    if (initialPlatformName && !initialPlatformName.includes('?')) {
      setPlatformName(initialPlatformName.replace(/سنجر/g, '').trim());
    }
    if (initialPlatformTagline && !initialPlatformTagline.includes('?')) {
      setPlatformTagline(initialPlatformTagline);
    }
  }, [initialPlatformName, initialPlatformTagline]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.platformName && !data.platformName.includes('?')) {
          setPlatformName(data.platformName.replace(/سنجر/g, '').trim());
        }
        if (data.platformTagline && !data.platformTagline.includes('?')) {
          setPlatformTagline(data.platformTagline);
        }
      }
    } catch (e) {}
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          if (data.user.officialFullName) {
            data.user.officialFullName = data.user.officialFullName.replace(/سنجر/g, '').trim();
          }
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (initialUser === undefined) fetchUser();
    if (!initialPlatformName) fetchSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e.detail?.settings) setSettings(e.detail.settings);
      const name = e.detail?.PLATFORM_NAME || e.detail?.settings?.PLATFORM_NAME;
      const tagline = e.detail?.PLATFORM_TAGLINE || e.detail?.settings?.PLATFORM_TAGLINE;
      if (name && !name.includes('?')) setPlatformName(name.replace(/سنجر/g, '').trim());
      if (tagline && !tagline.includes('?')) setPlatformTagline(tagline);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'platform_name' && e.newValue && !e.newValue.includes('?')) {
        setPlatformName(e.newValue.replace(/سنجر/g, '').trim());
      }
    };

    window.addEventListener('platform-settings-updated', handleSettingsUpdated);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('platform-settings-updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  // Clean navigation links matching getsirty.com
  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'جميع الكورسات', href: '/courses' },
    { name: 'المكتبة والمذكرات', href: '/books' },
    { name: 'الدبلومات الشاملة', href: '/diplomas' },
    { name: 'انضم كمحاضر أو طالب', href: '/instructors/join' },
    { name: 'البث المباشر', href: '/live', isLive: true },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pointer-events-auto w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-black/85 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          isScrolled ? 'py-2.5 sm:py-3' : 'pt-3 sm:pt-4 pb-1'
        }`}
      >
        <div
          className={`flex w-full items-center justify-between gap-3 lg:gap-6 transition-all duration-300 ${
            isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
          }`}
        >

          {/* =========================================================================
              1. RIGHT: LOGO & PLATFORM TITLE + TAGLINE (FULL VISIBILITY, NEVER SHRUNK)
             ========================================================================= */}
          <div className="flex-1 flex items-center justify-start min-w-max pe-2">
            <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 py-1 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/[0.04] dark:bg-white/[0.05] border border-slate-200/60 dark:border-[rgba(233,79,159,0.25)] flex items-center justify-center backdrop-blur-xl group-hover:border-[#E94F9F]/50 group-hover:shadow-[0_0_20px_rgba(233,79,159,0.30)] transition-all shrink-0">
                <GraduationCap className="w-5 h-5 text-[#D83F8F] dark:text-[#E94F9F] group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col text-start justify-center shrink-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-[#D83F8F] dark:text-[#E94F9F] flex items-center gap-1 leading-none mb-0.5 whitespace-nowrap">
                  {t('منصة تعليمية معتمدة', 'Certified Educational Platform')}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-[#FAFAFA] group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors tracking-tight whitespace-nowrap leading-tight">
                  {t(platformName, 'Eng. Mohamed Ibrahim Academy')}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-[#85858A] font-medium whitespace-nowrap leading-tight mt-0.5">
                  {t('بوابتك لاحتراف البرمجة والذكاء الاصطناعي', 'Gateway to Coding & AI Mastery')}
                </span>
              </div>
            </Link>
          </div>

          {/* =========================================================================
              2. CENTER: DEDICATED ULTRA-TRANSPARENT GLASS PILL (EXACT DEAD-CENTER)
             ========================================================================= */}
          <div className="hidden lg:flex items-center justify-center shrink-0">
            <div className="flex items-center gap-1 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-black/60 p-1 backdrop-blur-2xl shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
            
            {/* 1. الرئيسية */}
            <Link
              href="/"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-slate-100 dark:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {t('الرئيسية')}
            </Link>

            {/* 2. جميع الكورسات (Direct Link, No Dropdown) */}
            <Link
              href="/courses"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all ${
                pathname.startsWith('/courses') && pathname !== '/'
                  ? 'bg-slate-100 dark:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {t('جميع الكورسات')}
            </Link>

            {/* 3. المكتبة والمذكرات */}
            <Link
              href="/books"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all ${
                pathname.startsWith('/books')
                  ? 'bg-slate-100 dark:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {t('المكتبة والمذكرات')}
            </Link>

            {/* 4. الدبلومات الشاملة */}
            <Link
              href="/diplomas"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all ${
                pathname.startsWith('/diplomas')
                  ? 'bg-slate-100 dark:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {t('الدبلومات الشاملة')}
            </Link>

            {/* 5. انضم كمحاضر أو طالب */}
            <Link
              href="/instructors/join"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all ${
                pathname.startsWith('/instructors/join')
                  ? 'bg-slate-100 dark:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/15 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {t('انضم كمحاضر أو طالب')}
            </Link>

            {/* 6. البث المباشر */}
            <Link
              href="/live"
              prefetch={true}
              className={`rounded-full px-3.5 py-1.5 text-xs lg:text-[13px] font-semibold transition-all inline-flex items-center gap-1.5 ${
                pathname.startsWith('/live')
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>{t('البث المباشر')}</span>
            </Link>

            </div>
          </div>

          {/* =========================================================================
              3. LEFT: ACTIONS (LANGUAGE TOGGLE, THEME TOGGLE, LOGIN, SIGN UP) - EXACT GETSIRTY STYLE
             ========================================================================= */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 pl-2">

            {/* Language Switcher Button (Globe Icon + EN / عربي) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLang();
              }}
              className="h-9 inline-flex items-center gap-1 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white px-2.5 backdrop-blur-xl transition-all shadow-xs cursor-pointer text-xs font-bold shrink-0"
              title={lang === 'ar' ? 'Switch website to English' : 'تحويل الموقع إلى اللغة العربية'}
              aria-label="تبديل اللغة"
            >
              <Globe className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F] dark:text-[#E94F9F]" />
              <span className="text-[11px] font-bold uppercase">{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white backdrop-blur-xl transition-all shadow-xs cursor-pointer shrink-0"
              title={theme === 'DARK' ? t('التحويل إلى الوضع النهاري') : t('التحويل إلى الوضع الليلي')}
              aria-label="تبديل المظهر"
            >
              {theme === 'DARK' ? <Sun className="w-4 h-4 text-[#E94F9F]" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Logged-In User Profile or Guest Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] hover:border-emerald-400 dark:hover:border-[#E94F9F]/40 backdrop-blur-xl transition-all shadow-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 dark:from-[#FF5CAD] dark:to-[#E94F9F] flex items-center justify-center text-[11px] font-black text-white dark:text-black overflow-hidden shrink-0 shadow-xs">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.firstName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{currentUser.firstName?.[0] || 'ق'}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[100px] truncate">
                    {currentUser.firstName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2.5 w-72 rounded-3xl bg-white/95 dark:bg-black/90 border border-slate-200/90 dark:border-white/10 shadow-2xl backdrop-blur-2xl p-2.5 space-y-1.5 z-50 text-start animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5 dark:ring-white/10">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-[#71877D]">{t('الحساب الشخصي:')}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          currentUser.role === 'ADMIN'
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300'
                            : currentUser.role === 'INSTRUCTOR'
                            ? 'bg-[#D83F8F]/15 border-[#D83F8F]/30 text-[#D83F8F] dark:text-[#E94F9F]'
                            : 'bg-[#00D9C0]/15 border-[#00D9C0]/30 text-[#00A98C] dark:text-[#00D9C0]'
                        }`}>
                          {currentUser.role === 'ADMIN'
                            ? t('المشرف العام')
                            : currentUser.role === 'INSTRUCTOR'
                            ? t('محاضر معتمد')
                            : t('طالب بالأكاديمية')}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {currentUser.officialFullName || `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono truncate">{currentUser.email}</p>
                    </div>

                    {/* Links */}
                    {currentUser.role === 'ADMIN' && (
                      <div className="space-y-0.5">
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-emerald-600 dark:hover:bg-[#E94F9F] dark:hover:text-black transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F] dark:text-[#E94F9F]" />
                            <span>{t('لوحة التحكم العامة')}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Admin</span>
                        </Link>
                        <Link
                          href="/admin/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-amber-800 dark:text-[#FF5CAD] bg-amber-500/10 dark:bg-[#E94F9F]/10 hover:bg-amber-500/20 dark:hover:bg-[#E94F9F]/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-[#E94F9F]" />
                            <span>{t('إعدادات المنصة (VIP)')}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 dark:bg-[#E94F9F] text-zinc-950 dark:text-black font-black">{t('أهم قسم')}</span>
                        </Link>
                      </div>
                    )}

                    {currentUser.role === 'INSTRUCTOR' && (
                      <div className="space-y-0.5">
                        <Link
                          href="/instructor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-emerald-600 dark:hover:bg-[#E94F9F] dark:hover:text-black transition-colors"
                        >
                          <Video className="w-4 h-4 text-[#E94F9F] dark:text-[#E94F9F]" />
                          <span>{t('استوديو تدريس المحاضر')}</span>
                        </Link>
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-blue-600 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>{t('كورساتي المسجلة')}</span>
                      </Link>
                      <Link
                        href="/dashboard/library"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-emerald-600 dark:hover:bg-[#E94F9F] dark:hover:text-black transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#E94F9F] dark:text-[#E94F9F]" />
                        <span>{t('مكتبتي الرقمية (المذكرات)')}</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/10 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          <span>{t('تسجيل الخروج')}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{t('خروج آمن')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* 1. Login Link */}
                <Link
                  href="/login"
                  className="h-9 inline-flex items-center rounded-full px-3.5 text-xs font-bold text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-xl transition-all shadow-xs shrink-0"
                >
                  {t('تسجيل الدخول')}
                </Link>

                {/* 2. Signature CTA Button */}
                <Link
                  href="/register"
                  className="h-9 relative group inline-flex items-center gap-1.5 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 dark:bg-[#E94F9F] dark:hover:bg-[#FF5CAD] dark:text-[#080808] shadow-sm dark:shadow-[0_4px_20px_rgba(233,79,159,0.25)] hover:scale-[1.02] active:scale-[0.98] border border-slate-900/10 dark:border-[#E94F9F]/40 transition-all duration-200 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white dark:text-[#080808] group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide font-black whitespace-nowrap">{t('إنشاء حساب')}</span>
                </Link>
              </>
            )}
          </div>

          {/* =========================================================================
              4. MOBILE CONTROLS: THEME TOGGLE, LANGUAGE TOGGLE & HAMBURGER
             ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            
            {/* Mobile Language Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLang();
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-700 dark:text-white/80 p-2 backdrop-blur-xl transition-all shadow-xs text-[10px] font-bold"
              aria-label="تبديل اللغة"
            >
              <Globe className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F] dark:text-[#E94F9F]" />
              <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* Mobile Theme Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-700 dark:text-white/80 p-2 backdrop-blur-xl transition-all shadow-xs"
              aria-label="تبديل المظهر"
            >
              {theme === 'DARK' ? <Sun className="w-4 h-4 text-[#E94F9F]" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] text-slate-700 dark:text-white/80 hover:bg-white/80 dark:hover:bg-white/10 p-2 backdrop-blur-xl transition-all shadow-xs"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E94F9F]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          5. MOBILE FLOATING MENU
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="mx-3 sm:mx-4 mt-2 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2.5 rounded-3xl border border-slate-200/80 dark:border-[rgba(233,79,159,0.25)] bg-white/95 dark:bg-[#111113]/95 p-4 shadow-2xl backdrop-blur-2xl">
            
            {/* Top Brand Info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{t(platformName)}</p>
                  <p className="text-[10px] text-[#D83F8F] dark:text-[#E94F9F] font-medium">{t('منصة تعليمية معتمدة')}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-zinc-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1 py-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[rgba(216,63,143,0.12)] dark:bg-[rgba(233,79,159,0.15)] text-[#D83F8F] dark:text-[#E94F9F] border border-[rgba(216,63,143,0.25)] dark:border-[rgba(233,79,159,0.30)] font-bold'
                        : 'text-slate-700 dark:text-[#C5C5C8] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[#D83F8F] dark:hover:text-[#E94F9F]'
                    }`}
                  >
                    <span>{t(link.name)}</span>
                    {link.isLive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth & CTA */}
            {currentUser ? (
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between px-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.firstName} ({currentUser.role === 'ADMIN' ? t('مشرف') : currentUser.role === 'INSTRUCTOR' ? t('محاضر') : t('طالب')})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                  >
                    {t('تسجيل الخروج')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={currentUser.role === 'ADMIN' ? '/admin' : currentUser.role === 'INSTRUCTOR' ? '/instructor' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-full bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-[#080808] font-black text-xs text-center shadow-sm"
                  >
                    {t('لوحة التحكم')}
                  </Link>
                  <Link
                    href="/dashboard/library"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-full border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs text-center"
                  >
                    {t('مكتبتي الرقمية')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-800 dark:text-white font-semibold text-xs text-center"
                  >
                    {t('تسجيل الدخول')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-[#080808] font-black text-xs text-center shadow-md shadow-pink-500/20 dark:shadow-[0_8px_25px_rgba(233,79,159,0.30)] border border-pink-600/30 dark:border-[#E94F9F]/40"
                  >
                    {t('إنشاء حساب')}
                  </Link>
                </div>
                <Link
                  href="/instructors/join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                  <span>{t('انضم كـ محاضر أو طالب')}</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}

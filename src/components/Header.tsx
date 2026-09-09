'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  GraduationCap,
  Award,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  CreditCard,
  MessageSquare,
  Sparkles,
  Home,
  CheckCircle2,
  Video,
  ArrowLeft,
  Flame,
  FileText,
  Radio,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  initialPlatformName?: string;
  initialPlatformTagline?: string;
  initialUser?: any;
}

export default function Header({
  initialPlatformName = 'أكاديمية م / محمد إبراهيم',
  initialPlatformTagline = 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم',
  initialUser = null,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coursesMenuOpen, setCoursesMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const cleanInitialName = (initialPlatformName || 'أكاديمية م / محمد إبراهيم').replace(/سنجر/g, '').trim();
  const [platformName, setPlatformName] = useState(cleanInitialName || 'أكاديمية م / محمد إبراهيم');
  const [platformTagline, setPlatformTagline] = useState(initialPlatformTagline || 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم');
  const [navExpertBtnText, setNavExpertBtnText] = useState('انضم كـ محاضر');
  const [navStudentBtnText, setNavStudentBtnText] = useState('انضم كـ محاضر طالب');

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
        if (data.platformName && !data.platformName.includes('?')) {
          setPlatformName(data.platformName.replace(/سنجر/g, '').trim());
        }
        if (data.platformTagline && !data.platformTagline.includes('?')) setPlatformTagline(data.platformTagline);
        if (data.settings?.NAV_EXPERT_BTN_TEXT) setNavExpertBtnText(data.settings.NAV_EXPERT_BTN_TEXT);
        if (data.settings?.NAV_STUDENT_BTN_TEXT) setNavStudentBtnText(data.settings.NAV_STUDENT_BTN_TEXT);
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch user and settings only if not provided by server SSR
  useEffect(() => {
    setMounted(true);
    if (initialUser === undefined) {
      fetchUser();
    }
    if (!initialPlatformName) {
      fetchSettings();
    }

    const handleSettingsUpdated = (e: any) => {
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

  // Instant auto-close menus on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setCoursesMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'البثوث المباشرة الآن', href: '/live', icon: Radio, isLive: true },
    { name: 'جميع الكورسات', href: '/courses', icon: BookOpen, isCenterpiece: true },
    { name: 'المكتبة والمذكرات', href: '/books', icon: FileText },
    { name: 'الدبلومات الشاملة', href: '/diplomas', icon: Award },
    { name: 'كورسات الطلاب', href: '/courses?type=students', icon: GraduationCap, isStudent: true },
    { name: 'كورسات المحاضرين', href: '/courses?type=instructors', icon: Video, isExpert: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-3.5 md:p-4 transition-all pointer-events-none">
      <nav className="pointer-events-auto dynamic-navbar-aura max-w-[1536px] w-full sm:w-[98%] mx-auto flex items-center justify-between min-h-[3.75rem] sm:min-h-[4.75rem] px-4 sm:px-6 md:px-8 rounded-full bg-white/95 dark:bg-[#0c0918]/95 border border-slate-200/90 dark:border-[#00e55b]/35 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:shadow-[0_15px_50px_-10px_rgba(0,229,91,0.25)] relative gap-3 sm:gap-6">
        
        {/* =========================================================================
            1. RIGHT: LOGO & PLATFORM TITLE WITH ROTATING GOLD HALO
           ========================================================================= */}
        <Link href="/" className="flex items-center gap-3 sm:gap-3.5 shrink-0 group py-1 min-w-0">
          <div className="dynamic-logo-emblem w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl p-[2px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#0c0918] rounded-[10px] sm:rounded-[14px] flex items-center justify-center border border-amber-400/40 dark:border-[#00e55b]/50 shadow-xs">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-[#00e55b]" />
            </div>
          </div>
          <div className="flex flex-col text-right justify-center min-w-0">
            <span className="text-[9px] sm:text-[10.5px] font-black text-amber-500 dark:text-[#00e55b] flex items-center gap-1 leading-none mb-0.5 whitespace-nowrap">
              منصة تعليمية معتمدة
            </span>
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#0df268] transition-colors tracking-normal whitespace-nowrap leading-relaxed drop-shadow-xs">
              {platformName}
            </span>
            <span className="text-[8.5px] sm:text-[10px] text-slate-500 dark:text-[#70ff9b]/80 font-medium whitespace-nowrap leading-relaxed mt-0.5 block">
              {platformTagline}
            </span>
          </div>
        </Link>

        {/* =========================================================================
            2. CENTER: CLEAN BALANCED CENTERED NAVIGATION (ZERO OVERLAP)
           ========================================================================= */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 bg-slate-100/90 dark:bg-black/60 p-1.5 rounded-full border border-slate-200/90 dark:border-white/10 shadow-inner shrink-0 mx-auto">
          
          {/* 1. THE FEATURED PROMINENT CENTERPIECE: جميع الكورسات مع خط مميز وتدرج ذهبي فخم */}
          <div
            className="relative group"
            onMouseEnter={() => setCoursesMenuOpen(true)}
            onMouseLeave={() => setCoursesMenuOpen(false)}
          >
            <Link
              href="/courses"
              prefetch={true}
              onClick={() => setCoursesMenuOpen(false)}
              className={`px-4.5 py-2 text-xs sm:text-[13px] font-black rounded-full transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-md ${
                pathname.startsWith('/courses')
                  ? 'diploma-luxury-pill scale-105 ring-2 ring-purple-400/60 dark:ring-[#00e55b]/60 shadow-purple-500/25 dark:shadow-[#00e55b]/30'
                  : 'diploma-luxury-pill hover:scale-105'
              }`}
            >
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-[#70ff9b] shrink-0 transition-transform group-hover:scale-110" />
              <span className="whitespace-nowrap font-black tracking-wide">جميع الكورسات</span>
            </Link>

            {/* Seamless Dropdown Bridge (no gap so mouse never loses focus) */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50 text-right transition-all duration-200 ${
                coursesMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1'
              }`}
            >
              <div className="rounded-3xl bg-white dark:bg-[#0c0918] border-2 border-slate-200 dark:border-[#00e55b]/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2.5 space-y-1.5 ring-1 ring-slate-900/5 dark:ring-white/10">
                <Link
                  href="/courses"
                  onClick={() => setCoursesMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-50 dark:bg-[#00e55b]/10 hover:bg-amber-100 dark:hover:bg-[#00e55b]/20 text-slate-900 dark:text-white transition-all group/item border border-amber-200 dark:border-[#00e55b]/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-slate-900 dark:text-white">دليل جميع الكورسات</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">كافة التخصصات والمسارات</span>
                    </div>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-600 dark:text-[#00e55b] group-hover/item:-translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/books"
                  onClick={() => setCoursesMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-900 dark:text-white transition-all group/item border border-emerald-200 dark:border-emerald-500/30"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-emerald-900 dark:text-emerald-300">سوق المذكرات والكتب الرقمية</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">ملخصات ومراجع محمية بالـ DRM</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">DRM</span>
                </Link>

                <Link
                  href="/courses?type=students"
                  onClick={() => setCoursesMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/90 dark:bg-zinc-900/70 hover:bg-amber-50 dark:hover:bg-[#00e55b]/15 text-slate-900 dark:text-white transition-all group/item border border-slate-100 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-[#00e55b]/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-amber-800 dark:text-[#70ff9b]">كورسات الطلاب</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">شروحات ومناهج الطلبة</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 dark:bg-[#00e55b]/20 text-amber-700 dark:text-[#70ff9b] font-bold">طالب</span>
                </Link>

                <Link
                  href="/courses?type=instructors"
                  onClick={() => setCoursesMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/90 dark:bg-zinc-900/70 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 text-slate-900 dark:text-white transition-all group/item border border-slate-100 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black block text-indigo-800 dark:text-indigo-300">كورسات المحاضرين</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">مدرسين ودكاترة معتمدين</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">دكتور</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. Link: المكتبة والمذكرات */}
          <Link
            href="/books"
            prefetch={true}
            className={`px-3.5 py-2 text-xs sm:text-[12.5px] font-black rounded-full transition-all inline-flex items-center gap-1.5 shrink-0 ${
              pathname.startsWith('/books')
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] text-white dark:text-black font-black shadow-md scale-[1.02]'
                : 'text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-[#00e55b] hover:bg-slate-200/60 dark:hover:bg-zinc-800/70'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-[#00e55b]" />
            <span className="whitespace-nowrap">المكتبة والمذكرات</span>
          </Link>

          {/* 3. Link: الدبلومات الشاملة */}
          <Link
            href="/diplomas"
            prefetch={true}
            className={`px-3.5 py-2 text-xs sm:text-[12.5px] font-bold rounded-full transition-all inline-flex items-center gap-1.5 shrink-0 ${
              pathname.startsWith('/diplomas')
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-black'
                : 'text-slate-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className="whitespace-nowrap">الدبلومات الشاملة</span>
          </Link>

          {/* 4. Link: البث المباشر  */}
          <Link
            href="/live"
            prefetch={true}
            className={`px-3.5 py-2 text-xs sm:text-[12.5px] font-bold rounded-full transition-all inline-flex items-center gap-1.5 shrink-0 ${
              pathname.startsWith('/live')
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 font-black scale-105'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15 font-black hover:scale-105'
            }`}
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="whitespace-nowrap">البث المباشر</span>
          </Link>

        </div>

        {/* =========================================================================
            3. LEFT: COMPACT & REFINED INSTRUCTOR JOIN PILLS + AUTH BUTTONS
           ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* User Profile Dropdown (If Logged In) */}
          {currentUser ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-full border border-slate-200/90 dark:border-purple-800/60 bg-white/90 dark:bg-zinc-800/90 hover:border-amber-400 dark:hover:border-[#00e55b] transition-all shadow-xs cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-[#0df268] dark:to-[#00e55b] flex items-center justify-center text-[11px] font-black text-white dark:text-black overflow-hidden shrink-0">
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
                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[110px] truncate">
                  {currentUser.firstName}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 dark:text-zinc-400 mr-0.5" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2.5 w-72 rounded-3xl bg-white dark:bg-[#0c0918] border border-slate-200/90 dark:border-[#00e55b]/40 shadow-2xl backdrop-blur-2xl p-2.5 space-y-1.5 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5 dark:ring-white/10">
                  {/* User Profile Header Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-400">الحساب الشخصي:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-amber-500/15 dark:bg-[#00e55b]/15 border-amber-500/30 dark:border-[#00e55b]/40 text-amber-600 dark:text-[#70ff9b]'
                          : currentUser.role === 'INSTRUCTOR'
                          ? 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                          : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300'
                      }`}>
                        {currentUser.role === 'ADMIN'
                          ? 'المشرف العام'
                          : currentUser.role === 'INSTRUCTOR'
                          ? 'محاضر معتمد'
                          : 'طالب بالأكاديمية'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {currentUser.officialFullName || `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono truncate">{currentUser.email}</p>
                  </div>

                  {/* ROLE: ADMIN LINKS */}
                  {currentUser.role === 'ADMIN' && (
                    <div className="space-y-0.5">
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600/80 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4 h-4 text-amber-500 dark:text-[#00e55b] group-hover:text-white" />
                          <span>لوحة التحكم العامة</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">Admin</span>
                      </Link>

                      <Link
                        href="/admin/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-amber-800 dark:text-[#70ff9b] bg-amber-500/10 dark:bg-[#00e55b]/10 hover:bg-amber-500/20 dark:hover:bg-[#00e55b]/20 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 dark:text-[#00e55b]" />
                          <span>إعدادات المنصة والأسعار (VIP)</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black">أهم قسم</span>
                      </Link>

                      <Link
                        href="/admin/instructors"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600/80 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-purple-400 group-hover:text-white" />
                          <span>إدارة المحاضرين والاشتراكات</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">SaaS</span>
                      </Link>

                      <Link
                        href="/admin/courses"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600/80 transition-colors group"
                      >
                        <BookOpen className="w-4 h-4 text-blue-400 group-hover:text-white" />
                        <span>إدارة الكورسات والمحتوى</span>
                      </Link>
                    </div>
                  )}

                  {/* ROLE: INSTRUCTOR LINKS */}
                  {currentUser.role === 'INSTRUCTOR' && (
                    <div className="space-y-0.5">
                      <Link
                        href="/instructor"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-purple-600 transition-colors group"
                      >
                        <Video className="w-4 h-4 text-purple-400 group-hover:text-white" />
                        <span>استوديو تدريس المحاضر</span>
                      </Link>
                      <Link
                        href="/instructor/books"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-amber-600 transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-amber-400 dark:text-[#00e55b] group-hover:text-white" />
                        <span>إدارة ونشر المذكرات</span>
                      </Link>
                    </div>
                  )}

                  {/* Student links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-blue-600 transition-colors group"
                    >
                      <BookOpen className="w-4 h-4 text-blue-400 group-hover:text-white" />
                      <span>كورساتي ودوراتي المسجلة</span>
                    </Link>
                    <Link
                      href="/dashboard/library"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-white hover:bg-amber-600 dark:hover:bg-[#00e55b]/80 transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-amber-400 dark:text-[#00e55b] group-hover:text-white" />
                      <span>مكتبتي الرقمية (المذكرات)</span>
                    </Link>
                  </div>

                  {/* Divider & Logout */}
                  <div className="border-t border-slate-100 dark:border-zinc-800/80 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </div>
                      <span className="text-[10px] opacity-70">خروج آمن</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth + Compact Dual Instructor Join Pills */
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              
              {/* Join: انضم كـ محاضر */}
              <Link
                href="/instructors/join?track=expert"
                className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 border border-purple-300 dark:border-purple-500/50 text-purple-950 dark:text-purple-200 transition-all flex items-center gap-1 shrink-0 shadow-xs"
                title="سجل كمدرس أو دكتور جامعي (0% عمولة - 14 يوماً مجاناً)"
              >
                <Video className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                <span>{navExpertBtnText}</span>
              </Link>

              {/* Join: انضم كـ محاضر طالب (Visible on XL screens) */}
              <Link
                href="/instructors/join?track=student"
                className="hidden xl:flex px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 hover:bg-amber-200 dark:bg-[#00e55b]/10 dark:hover:bg-[#00e55b]/20 border border-amber-300 dark:border-[#00e55b]/40 text-amber-950 dark:text-[#70ff9b] transition-all items-center gap-1 shrink-0 shadow-sm"
                title="منحة المحاضر الطالب لطلبة الجامعات والمدارس (شهر كامل مجاناً)"
              >
                <GraduationCap className="w-3 h-3 text-amber-700 dark:text-[#00e55b]" />
                <span>{navStudentBtnText}</span>
              </Link>

              {/* Login Button */}
              <Link
                href="/login"
                className="px-2.5 py-1 rounded-full text-[11px] font-black text-slate-900 hover:text-black bg-slate-200/90 hover:bg-slate-300 border border-slate-300 dark:border-zinc-700 dark:text-zinc-100 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all shadow-xs flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3 h-3 text-slate-800 dark:text-[#00e55b]" />
                <span>دخول</span>
              </Link>

              {/* Register CTA Button */}
              <Link
                href="/register"
                className="px-3.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 whitespace-nowrap flex items-center gap-1 shrink-0 hover:scale-105"
              >
                <UserPlus className="w-3 h-3 text-white" />
                <span>انضمام</span>
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleTheme();
            }}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 text-amber-600 dark:text-[#00e55b] hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
            title={theme === 'DARK' ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
            aria-label="تبديل المظهر"
          >
            {theme === 'DARK' ? <Sun className="w-3.5 h-3.5 text-[#00e55b]" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 sm:p-2.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
              mobileMenuOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-white/90 dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-xs'
            }`}
            aria-label="فتح القائمة"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </nav>

      {/* =========================================================================
          Ultra-Luxurious Full Mobile Drawer Sheet
         ========================================================================= */}
      {mounted && mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="mobile-drawer-sheet lg:hidden fixed inset-0 z-[99999] w-screen h-[100dvh] flex flex-col bg-slate-50/98 dark:bg-zinc-950/98 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="max-w-md w-full mx-auto space-y-4 pt-2 pb-10">
            
            {/* Drawer Top Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-[#00b846] dark:via-[#00e55b] dark:to-[#10f068] p-[2px] shrink-0">
                  <div className="w-full h-full bg-white dark:bg-[#0c0918] rounded-[9px] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-[#00e55b]" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{platformName}</p>
                  <p className="text-[10px] text-amber-500 dark:text-[#00e55b] font-bold">منصة تعليمية معتمدة</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Card (if logged in) */}
            {currentUser ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-purple-950/40 dark:to-zinc-900 border border-blue-100 dark:border-purple-800/40 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-[#0df268] dark:to-[#00e55b] flex items-center justify-center text-sm font-black text-white dark:text-black overflow-hidden shadow-xs">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{currentUser.firstName?.[0] || 'ق'}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                        {currentUser.officialFullName || `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300'
                      : currentUser.role === 'INSTRUCTOR'
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                      : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300'
                  }`}>
                    {currentUser.role === 'ADMIN' ? 'مشرف عام' : currentUser.role === 'INSTRUCTOR' ? 'محاضر' : 'طالب'}
                  </span>
                </div>

                {/* Direct Role Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-white/5">
                  {currentUser.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 rounded-xl bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>لوحة الأدمن</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-3 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-[#00e55b]" />
                        <span>إعدادات المنصة</span>
                      </Link>
                    </>
                  )}
                  {currentUser.role === 'INSTRUCTOR' && (
                    <Link
                      href="/instructor"
                      onClick={() => setMobileMenuOpen(false)}
                      className="col-span-2 py-2 px-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>استوديو تدريس المحاضر</span>
                    </Link>
                  )}
                  {currentUser.role === 'STUDENT' && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="col-span-2 py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>كورساتي المسجلة</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Mobile Auth Buttons */
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-md">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4 text-blue-600 dark:text-[#00e55b]" />
                    <span>تسجيل الدخول</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>انضمام جديد</span>
                  </Link>
                </div>
                
                {/* Mobile Instructor Options */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/instructors/join?track=expert"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>انضم كـ محاضر</span>
                  </Link>
                  <Link
                    href="/instructors/join?track=student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-2 rounded-xl bg-amber-500/15 dark:bg-[#00e55b]/15 hover:bg-amber-500/25 dark:hover:bg-[#00e55b]/25 border border-amber-500/40 dark:border-[#00e55b]/40 text-amber-700 dark:text-[#70ff9b] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-amber-500 dark:text-[#00e55b]" />
                    <span>انضم كـ محاضر طالب</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links with Icons & Highlighting */}
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5 shadow-md">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 px-3 py-1 text-right">أقسام المنصة:</p>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const isStudent = (link as any).isStudent;
                const isExpert = (link as any).isExpert;
                const isCenterpiece = (link as any).isCenterpiece;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-white border border-blue-200 dark:border-zinc-700 shadow-xs'
                        : isCenterpiece
                        ? 'bg-gradient-to-r from-amber-500/15 dark:from-[#00e55b]/15 to-purple-600/15 text-slate-900 dark:text-[#70ff9b] border border-amber-500/30 dark:border-[#00e55b]/40'
                        : isStudent
                        ? 'bg-amber-500/10 dark:bg-[#00e55b]/10 text-amber-800 dark:text-[#70ff9b] border border-amber-500/25 dark:border-[#00e55b]/30 hover:bg-amber-500/20'
                        : isExpert
                        ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/20'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {link.icon && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCenterpiece
                            ? 'bg-amber-500/20 dark:bg-[#00e55b]/20 text-amber-500 dark:text-[#00e55b]'
                            : isStudent
                            ? 'bg-amber-500/20 dark:bg-[#00e55b]/20 text-amber-500 dark:text-[#00e55b]'
                            : isExpert
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          <link.icon className="w-4 h-4" />
                        </div>
                      )}
                      <span>{link.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout button (Mobile) */}
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            )}

          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
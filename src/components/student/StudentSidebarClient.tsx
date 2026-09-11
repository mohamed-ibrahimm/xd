'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Radio,
  Compass,
  MessageSquare,
  Settings,
  Globe,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface Props {
  studentName: string;
  studentEmail: string;
  avatarUrl?: string | null;
  enrolledCount?: number;
  certificatesCount?: number;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

export default function StudentSidebarClient({
  studentName,
  studentEmail,
  avatarUrl,
  enrolledCount = 0,
  certificatesCount = 0,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navSections = useMemo(
    () => [
      {
        title: 'دراستي والشهادات',
        items: [
          {
            name: 'لوحة المتابعة الأكاديمية',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'دوراتي التدريبية',
            href: '/dashboard/my-courses',
            icon: BookOpen,
            badge: enrolledCount > 0 ? `${enrolledCount}` : undefined,
            badgeColor: 'bg-pink-500/20 text-[#D83F8F] dark:text-[#E94F9F] border border-pink-500/30',
          },
          {
            name: 'مكتبتي ومذكراتي الرقمية',
            href: '/dashboard/library',
            icon: FileText,
          },
        ],
      },
      {
        title: 'استكشاف المنصة',
        items: [
          {
            name: 'تصفح الكورسات الجديدة',
            href: '/courses',
            icon: Compass,
          },
          {
            name: 'سوق المذكرات والكتب',
            href: '/books',
            icon: FileText,
          },
          {
            name: 'الدبلومات الشاملة المعتمدة',
            href: '/diplomas',
            icon: Award,
            badge: '50% وفر',
            badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
          },
          {
            name: 'غرف البث المباشر (Live)',
            href: '/live',
            icon: Radio,
            badge: 'LIVE',
            badgeColor: 'bg-rose-500 text-white animate-pulse shadow-xs',
          },
        ],
      },
      {
        title: 'الحساب والدعم',
        items: [
          {
            name: 'المحادثات والدعم الأكاديمي',
            href: '/chat',
            icon: MessageSquare,
          },
          {
            name: 'تعديل الملف الشخصي والصورة',
            href: '/profile',
            icon: User,
            badge: 'حسابي',
            badgeColor: 'bg-pink-500/20 text-[#D83F8F] dark:text-[#E94F9F] border border-pink-500/30',
          },
        ],
      },
    ],
    [enrolledCount, certificatesCount]
  );

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pb-5 border-b border-slate-200/80 dark:border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-black flex items-center justify-center font-black shadow-md shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-start min-w-0">
            <h2 className="text-sm font-black text-slate-900 dark:text-white truncate">
              بوابة الطالب والمتدرب
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                أكاديمية م / محمد إبراهيم
              </span>
            </div>
          </div>
        </div>

        {/* Student Profile Badge with Quick Edit */}
        <Link
          href="/profile"
          onClick={() => setMobileDrawerOpen(false)}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.04] hover:bg-pink-500/10 dark:hover:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2 transition-all group cursor-pointer shadow-xs"
          title="تعديل الملف الشخصي والصورة"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={studentName}
                className="w-8 h-8 rounded-full object-cover border border-pink-500/40 shrink-0 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 text-[#D83F8F] dark:text-[#E94F9F] flex items-center justify-center text-xs font-black shrink-0">
                {studentName.charAt(0) || 'ط'}
              </div>
            )}
            <div className="text-start min-w-0">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-[#D83F8F] dark:group-hover:text-[#E94F9F] transition-colors">
                {studentName}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate block">
                {studentEmail}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-pink-500/15 text-[#D83F8F] dark:text-[#E94F9F] border border-pink-500/30">
              طالب
            </span>
            <span className="text-[9.5px] font-bold text-[#D83F8F] dark:text-[#E94F9F] flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
              تعديل ✎
            </span>
          </div>
        </Link>

        {/* Theme Toggle Button (Light / Night Mode Switcher) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="w-full flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200/70 dark:border-white/10 text-xs font-bold transition-all cursor-pointer group shadow-xs"
          title={theme === 'DARK' ? 'التحويل إلى الوضع النهاري (فاتح)' : 'التحويل إلى الوضع الليلي (داكن)'}
        >
          <div className="flex items-center gap-2.5">
            {theme === 'DARK' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600 group-hover:-rotate-12 transition-transform shrink-0" />
            )}
            <span className="text-slate-800 dark:text-zinc-200">
              {theme === 'DARK' ? 'الوضع النهاري (فاتح)' : 'الوضع الليلي (داكن)'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-pink-500/15 text-[#D83F8F] dark:text-[#E94F9F] border border-pink-500/30">
            {theme === 'DARK' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Grouped Nav Items */}
        <div className="space-y-5 text-start">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <span className="px-3 text-[10.5px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                {section.title}
              </span>
              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => {
                  const isActive = item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#D83F8F] text-white dark:bg-[#E94F9F] dark:text-black font-black shadow-md scale-[1.01]'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white dark:text-black' : 'text-slate-500 dark:text-zinc-400'
                        }`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black shrink-0 ${
                          isActive
                            ? 'bg-black/20 text-white dark:bg-black/30 dark:text-black'
                            : item.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-zinc-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Actions */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-1 text-start">
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Globe className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          <span>زيارة الموقع العام</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-start"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT PINNED SAAS SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white/95 dark:bg-[#0c0918]/95 border-l border-slate-200/80 dark:border-white/10 shrink-0 h-screen sticky top-0 overflow-y-auto p-4 z-30 shadow-sm backdrop-blur-xl">
        {renderNavContent()}
      </aside>

      {/* 2. MOBILE TOP BAR (With Hamburger Toggle) */}
      <div className="lg:hidden w-full bg-white/95 dark:bg-[#0c0918]/95 border-b border-slate-200/80 dark:border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-black flex items-center justify-center font-black">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 dark:text-white leading-tight">بوابة الطالب</h2>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{studentName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="تبديل المظهر"
            title={theme === 'DARK' ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
          >
            {theme === 'DARK' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE OFF-CANVAS DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-[#0c0918] p-5 shadow-2xl overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/10">
              <span className="text-xs font-black text-slate-900 dark:text-white">أقسام الطالب</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}

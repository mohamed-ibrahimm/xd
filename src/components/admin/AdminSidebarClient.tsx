'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  Star,
  Tag,
  Award,
  ShieldAlert,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  Zap,
  Globe,
  Command,
  LayoutGrid,
  ChevronLeft,
  FileText,
} from 'lucide-react';

interface Props {
  platformName: string;
  adminName: string;
}

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  accent: string;
}

export default function AdminSidebarClient({ platformName, adminName }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 10 Essential Admin Links with rich descriptions & high-impact visual themes
  const allNavItems: NavItem[] = useMemo(() => [
    {
      name: 'لوحة التحكم والتحليلات',
      description: 'نظرة عامة على المبيعات، الطلاب، المشاهدات والتقارير الفورية',
      href: '/admin',
      icon: LayoutDashboard,
      accent: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'إعدادات المنصة والأسعار (VIP)',
      description: 'التحكم بأسعار باقات الـ SaaS، نصوص الصفحات وحسابات الدفع',
      href: '/admin/settings',
      icon: SlidersHorizontal,
      badge: 'VIP',
      badgeColor: 'bg-amber-500 text-zinc-950 shadow-amber-500/20',
      accent: 'from-amber-400 to-yellow-500',
    },
    {
      name: 'إدارة المحاضرين والباقات',
      description: 'متابعة حسابات المدرسين والدكاترة واشتراكات نظام الـ SaaS',
      href: '/admin/instructors',
      icon: GraduationCap,
      badge: 'SaaS',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      accent: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'توثيق المحاضرين الطلبة',
      description: 'مراجعة وتفعيل منح الـ 30 يوماً المجانية للطلاب المتميزين',
      href: '/admin/student-verifications',
      icon: Award,
      badge: 'منحة',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      accent: 'from-emerald-400 to-teal-500',
    },
    {
      name: 'إدارة الكورسات والدروس',
      description: 'إضافة وتعديل المسارات، الدبلومات، الفيديوهات والملحقات',
      href: '/admin/courses',
      icon: BookOpen,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      name: 'مراجعة واعتماد المذكرات والكتب',
      description: 'اعتماد ونشر مذكرات المحاضرين، مراجعة الأسعار، وفحص ملفات الـ DRM',
      href: '/admin/books',
      icon: FileText,
      badge: 'مراجعة واعتماد',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-black shadow-amber-500/20',
      accent: 'from-amber-500 to-orange-600',
    },
    {
      name: 'إدارة الطلاب والمستخدمين',
      description: 'سجل الطلاب، منح الصلاحيات، وتعديل الحسابات وبياناتهم',
      href: '/admin/users',
      icon: Users,
      accent: 'from-violet-500 to-purple-600',
    },
    {
      name: 'المدفوعات والتحصيلات',
      description: 'مراجعة تحويلات إنستاباي وفودافون كاش وتأكيد الاشتراكات',
      href: '/admin/payments',
      icon: CreditCard,
      accent: 'from-emerald-500 to-green-600',
    },
    {
      name: 'كوبونات الخصم والعروض',
      description: 'إنشاء قسائم تخفيض بنسبة مئوية أو قيمة ثابتة للمسارات',
      href: '/admin/coupons',
      icon: Tag,
      accent: 'from-rose-500 to-pink-600',
    },
    {
      name: 'تقييمات ومراجعات الطلاب',
      description: 'مراقبة آراء وتقييمات الطلاب للكورسات واعتمادها',
      href: '/admin/reviews',
      icon: Star,
      accent: 'from-amber-400 to-orange-500',
    },
    {
      name: 'سجلات النظام والأمان',
      description: 'سجل العمليات الدقيقة وحركات تسجيل الدخول والأمان',
      href: '/admin/audit-logs',
      icon: ShieldAlert,
      accent: 'from-slate-500 to-zinc-600',
    },
  ], []);

  // Keyboard Shortcut: Cmd+K or Ctrl+K or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase().trim();
    return allNavItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [allNavItems, searchQuery]);

  // Get current active item info for the top bar
  const currentItem = useMemo(() => {
    return allNavItems.find((item) => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href))) || allNavItems[0];
  }, [allNavItems, pathname]);

  return (
    <>
      {/* =========================================================================
          1. SLIM & ELEGANT TOP STATUS BAR (Contained in layout, zero overlap)
         ========================================================================= */}
      {/* =========================================================================
          1. SLIM & ELEGANT TOP STATUS BAR (Contained in layout, zero overlap)
         ========================================================================= */}
      <div className="w-full bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-[#00e55b]/30 backdrop-blur-xl px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-[#00e55b] animate-pulse shadow-sm shadow-amber-400/50 dark:shadow-[#00e55b]/60" />
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            {currentItem?.name || 'لوحة الإدارة'}
          </span>
          <span className="hidden md:inline-block text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            • {platformName}
          </span>
        </div>

        {/* Quick Direct Links */}
        <div className="hidden xl:flex items-center gap-1 text-xs font-bold">
          <Link
            href="/admin/settings"
            className={`px-3 py-1 rounded-lg transition-all ${
              pathname === '/admin/settings'
                ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-amber-400 dark:hover:text-[#00e55b] hover:bg-white/5'
            }`}
          >
            الإعدادات (VIP)
          </Link>
          <Link
            href="/admin/courses"
            className={`px-3 py-1 rounded-lg transition-all ${
              pathname.startsWith('/admin/courses')
                ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-amber-400 dark:hover:text-[#00e55b] hover:bg-white/5'
            }`}
          >
            الكورسات
          </Link>
          <Link
            href="/admin/instructors"
            className={`px-3 py-1 rounded-lg transition-all ${
              pathname.startsWith('/admin/instructors')
                ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-amber-400 dark:hover:text-[#00e55b] hover:bg-white/5'
            }`}
          >
            المحاضرين
          </Link>
          <Link
            href="/admin/books"
            className={`px-3 py-1 rounded-lg transition-all ${
              pathname.startsWith('/admin/books')
                ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-amber-400 dark:hover:text-[#00e55b] hover:bg-white/5'
            }`}
          >
            المذكرات
          </Link>
          <Link
            href="/admin/payments"
            className={`px-3 py-1 rounded-lg transition-all ${
              pathname.startsWith('/admin/payments')
                ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black font-black shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-amber-400 dark:hover:text-[#00e55b] hover:bg-white/5'
            }`}
          >
            المدفوعات
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Launcher Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(true);
              setSearchQuery('');
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white text-xs font-black transition-all border border-slate-200 dark:border-white/10 shadow-xs cursor-pointer active:scale-95 group"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-500 dark:text-[#00e55b] group-hover:rotate-90 transition-transform duration-300" />
            <span>أقسام الإدارة</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-black/10 dark:bg-black/40 text-[10px] font-mono text-slate-500 dark:text-zinc-400 border border-black/5 dark:border-white/10">
              ⌘K
            </kbd>
          </button>

          {/* Home Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 dark:bg-[#00e55b]/15 hover:bg-amber-500/25 dark:hover:bg-[#00e55b]/25 text-amber-800 dark:text-[#70ff9b] text-xs font-bold transition-all border border-amber-500/30 dark:border-[#00e55b]/40 shrink-0"
            title="العودة للموقع العام"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">الموقع العام</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. FLOATING CIRCULAR COMMAND TRIGGER (Bottom-Left Luxury Floating Button)
         ========================================================================= */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
          setSearchQuery('');
        }}
        className="fixed bottom-6 left-6 z-[9999] group flex items-center gap-2 p-1.5 pr-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] text-zinc-950 dark:text-black shadow-[0_10px_35px_rgba(245,158,11,0.45)] dark:shadow-[0_10px_35px_rgba(0,229,91,0.45)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.6)] dark:hover:shadow-[0_15px_45px_rgba(0,229,91,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-amber-400/20 dark:ring-[#00e55b]/30"
        title="فتح القائمة السريعة (Ctrl+K)"
        aria-label="أقسام الإدارة السريعة"
      >
        <span className="text-xs font-black tracking-wide whitespace-nowrap hidden sm:inline-block">
          أقسام الإدارة
        </span>
        <div className="w-9 h-9 rounded-full bg-zinc-950 text-amber-400 dark:bg-black dark:text-[#00e55b] flex items-center justify-center shadow-md group-hover:rotate-180 transition-transform duration-500">
          <LayoutGrid className="w-4 h-4" />
        </div>
      </button>

      {/* =========================================================================
          3. LUXURY QUICK COMMAND PALETTE MODAL (Rendered into document.body via Portal)
         ========================================================================= */}
      {mounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#0e0a1f]/95 dark:bg-[#0c0918]/95 border-2 border-amber-500/40 dark:border-[#00e55b]/40 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-3xl p-4 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200 text-right">
            
            {/* Modal Header & Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 dark:bg-[#00e55b]/20 border border-amber-500/40 dark:border-[#00e55b]/40 flex items-center justify-center text-amber-400 dark:text-[#00e55b]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      القائمة السريعة للوحة الإدارة
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      انتقل لأي قسم في المنصة بضغطة زر واحدة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن قسم (مثل: الأسعار، الكورسات، المحاضرين، المدفوعات)..."
                  className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:focus:border-[#00e55b] dark:focus:ring-2 dark:focus:ring-[#00e55b]/20 transition-all"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Interactive Grid of Navigation Cards */}
            <div className="max-h-[60vh] overflow-y-auto pr-1 pl-1 space-y-2 scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500 dark:bg-[#00e55b] text-zinc-950 dark:text-black border-amber-400 dark:border-[#10f068] shadow-lg shadow-amber-500/25 dark:shadow-[#00e55b]/25 font-black scale-[1.01]'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] text-white border-white/[0.06] hover:border-amber-500/40 dark:hover:border-[#00e55b]/40 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${
                        isActive
                          ? 'bg-zinc-950 dark:bg-black text-amber-400 dark:text-[#00e55b]'
                          : `bg-gradient-to-tr ${item.accent} text-white`
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs font-black truncate ${isActive ? 'text-zinc-950 dark:text-black' : 'text-white group-hover:text-amber-300 dark:group-hover:text-[#70ff9b]'}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                              isActive
                                ? 'bg-zinc-950 dark:bg-black text-amber-400 dark:text-[#00e55b]'
                                : item.badgeColor || 'bg-amber-500/20 text-amber-300 dark:bg-[#00e55b]/20 dark:text-[#70ff9b]'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10.5px] leading-snug line-clamp-1 ${
                          isActive ? 'text-zinc-900 dark:text-zinc-900 font-medium' : 'text-zinc-400 group-hover:text-zinc-300'
                        }`}>
                          {item.description}
                        </p>
                      </div>

                      <ChevronLeft className={`w-4 h-4 shrink-0 mt-2 transition-transform group-hover:-translate-x-1 ${
                        isActive ? 'text-zinc-950 dark:text-black' : 'text-zinc-500 group-hover:text-amber-400 dark:group-hover:text-[#00e55b]'
                      }`} />
                    </Link>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-zinc-400 space-y-2">
                  <p className="text-xs">لم يتم العثور على قسم يطابق بحثك</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-400 dark:text-[#00e55b] font-black hover:underline cursor-pointer"
                  >
                    عرض كافة الأقسام
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-300 font-bold">المسؤول: {adminName}</span>
              </div>
              <span className="hidden sm:inline text-zinc-500">
                اضغط <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300 font-mono">ESC</kbd> للإغلاق
              </span>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

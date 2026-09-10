'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft, ShieldCheck, UserCheck, X } from 'lucide-react';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const registered = searchParams.get('registered');

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const errorParam = searchParams.get('error');
  const getInitialError = () => {
    if (errorParam === 'invalid_credentials') return 'اسم المستخدم أو كلمة المرور غير صحيحة';
    if (errorParam === 'missing_credentials') return 'يرجى إدخال اسم المستخدم وكلمة المرور';
    if (errorParam === 'unauthorized_admin') return 'يجب تسجيل الدخول أولاً بحساب المدير للوصول إلى لوحة الإدارة';
    if (errorParam === 'unauthorized_instructor') return 'يجب تسجيل الدخول بحساب المعلم للوصول إلى استوديو المعلم';
    if (errorParam === 'invalid_oauth_state') return 'فشلت المصادقة الأمنية (CSRF)، يرجى إعادة المحاولة';
    if (errorParam === 'oauth_denied') return 'تم إلغاء تسجيل الدخول عبر المزود';
    if (errorParam === 'oauth_verification_failed') return 'فشل التحقق من بيانات الحساب الاجتماعي';
    if (errorParam === 'oauth_provisioning_failed') return 'فشل تسجيل أو ربط الحساب الاجتماعي';
    if (errorParam === 'oauth_provider_not_configured') return 'خدمة تسجيل الدخول الاجتماعي غير مهيأة بعد على الخادم. يُرجى مراجعة إعدادات المزود في ملف البيئة أو تسجيل الدخول بالبريد.';
    if (errorParam === 'oauth_conflict_link_required') return 'يوجد حساب مسجل بهذا البريد مسبقاً. يرجى تسجيل الدخول بكلمة المرور لربط الحساب بأمان منعاً لاختراق الحسابات.';
    return '';
  };
  const [error, setError] = useState(getInitialError);
  const [loading, setLoading] = useState(false);

  // Clean up stale error query params from the browser URL so they are not permanently displayed on refresh
  useEffect(() => {
    if (errorParam) {
      try {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.has('error')) {
          currentUrl.searchParams.delete('error');
          currentUrl.searchParams.delete('provider');
          window.history.replaceState({}, '', currentUrl.pathname + (currentUrl.search ? currentUrl.search : ''));
        }
      } catch (_) {}
    }
  }, [errorParam]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const identEl = document.getElementById('login-identifier') as HTMLInputElement | null;
    const passEl = document.getElementById('login-password') as HTMLInputElement | null;
    const identifier = (identEl?.value || formData.identifier || '').trim();
    const password = (passEl?.value || formData.password || '').trim();

    if (!identifier || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول: يرجى التحقق من اسم المستخدم وكلمة المرور');
      } else {
        let target = '/dashboard';
        if (data.user?.role === 'ADMIN') {
          target = '/admin';
        } else if (data.user?.role === 'INSTRUCTOR') {
          target = '/instructor';
        } else if (callbackUrl && callbackUrl !== '/login' && !callbackUrl.startsWith('/login')) {
          target = callbackUrl;
        }
        window.location.href = target;
      }
    } catch (err: any) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505]">
      {/* Dynamic Magenta Moving Glow Orbs in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[10%] right-[25%] w-[420px] h-[420px] bg-pink-400/20 dark:bg-[rgba(233,79,159,0.08)] rounded-full blur-[110px]" />
        <div className="dynamic-drift-2 absolute bottom-[15%] left-[20%] w-[460px] h-[460px] bg-purple-500/20 dark:bg-[rgba(244,123,183,0.06)] rounded-full blur-[120px]" />
        <div className="dynamic-drift-3 absolute top-[40%] left-[10%] w-[380px] h-[380px] bg-pink-500/15 dark:bg-[rgba(233,79,159,0.05)] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.20)] p-7 sm:p-9 shadow-2xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(233,79,159,0.12)] space-y-6 backdrop-blur-[14px] relative">
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center mb-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500/30 to-purple-500/30 blur-md" />
            <div className="relative w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-[#E94F9F] via-[#FF5CAD] to-[#B83278] shadow-lg shadow-pink-500/20">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#17171A] flex items-center justify-center border border-[rgba(233,79,159,0.30)]">
                <LogIn className="w-6 h-6 text-[#D83F8F] dark:text-[#E94F9F]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#FAFAFA] tracking-tight">تسجيل الدخول</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-[#C5C5C8]">
            مرحباً بك مجدداً في <span className="font-bold text-[#D83F8F] dark:text-[#E94F9F]">أكاديمية م / محمد إبراهيم</span>
          </p>
        </div>

        {registered && (
          <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs font-semibold text-center">
            تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-[#FF5470]/10 border border-rose-200 dark:border-[#FF5470]/30 text-rose-700 dark:text-[#FF5470] text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF5470]" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="p-1 text-[#FF5470] hover:opacity-80 transition-opacity"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          method="POST"
          action="/api/auth/login"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative group">
              <input
                type="text"
                name="identifier"
                id="login-identifier"
                required
                defaultValue={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="admin أو student أو البريد الإلكتروني"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#FAFAFA]">كلمة المرور</label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#D83F8F] hover:text-[#B83278] dark:text-[#E94F9F] dark:hover:text-[#FF5CAD] transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative group">
              <input
                type="password"
                name="password"
                id="login-password"
                required
                defaultValue={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-12 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#D83F8F] dark:bg-[#E94F9F] hover:bg-[#B83278] dark:hover:bg-[#FF5CAD] text-white dark:text-[#080808] font-black text-base shadow-xl dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 border border-pink-600/30 dark:border-[rgba(233,79,159,0.40)]"
          >
            <span>{loading ? 'جاري التحقق...' : 'دخول المنصة'}</span>
            <ArrowLeft className="w-5 h-5 text-white dark:text-[#080808]" />
          </button>
        </form>

        <SocialAuthButtons callbackUrl={callbackUrl} />

        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-[#C5C5C8] pt-2">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="font-bold text-[#D83F8F] hover:text-[#B83278] dark:text-[#E94F9F] dark:hover:text-[#FF5CAD] transition-colors underline-offset-4 hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-zinc-400">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}
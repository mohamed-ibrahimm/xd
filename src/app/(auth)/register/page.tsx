'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  GraduationCap,
  Video,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  UserPlus
} from 'lucide-react';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialTrackParam = searchParams.get('track');

  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>(
    initialRoleParam?.toUpperCase() === 'INSTRUCTOR' || initialTrackParam === 'student' ? 'INSTRUCTOR' : 'STUDENT'
  );
  const [track, setTrack] = useState<string>(initialTrackParam || '');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialRoleParam?.toUpperCase() === 'INSTRUCTOR' || initialTrackParam === 'student') {
      setRole('INSTRUCTOR');
    }
    if (initialTrackParam) {
      setTrack(initialTrackParam);
    }
  }, [initialRoleParam, initialTrackParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manual Form Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('يجب ألا تقل كلمة المرور عن 6 أحرف');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role,
          track: role === 'INSTRUCTOR' ? track : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'فشل إنشاء الحساب');
      } else {
        window.location.href = data.redirectTo || (role === 'INSTRUCTOR' ? '/instructor' : '/dashboard');
      }
    } catch {
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-10 overflow-hidden bg-[#FAF8FA] dark:bg-[#050505]">
      {/* Background Magenta Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="dynamic-drift-1 absolute top-[10%] right-[15%] w-[420px] h-[420px] bg-pink-400/20 dark:bg-[rgba(233,79,159,0.08)] rounded-full blur-[110px]" />
        <div className="dynamic-drift-2 absolute bottom-[10%] left-[15%] w-[460px] h-[460px] bg-purple-500/20 dark:bg-[rgba(244,123,183,0.06)] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-[#111113] border border-slate-200/90 dark:border-[rgba(233,79,159,0.20)] rounded-3xl p-6 sm:p-8 shadow-2xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(233,79,159,0.12)] space-y-6 backdrop-blur-[14px] relative">
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center mb-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500/30 to-purple-500/30 blur-md" />
            <div className="relative w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-[#E94F9F] via-[#FF5CAD] to-[#B83278] shadow-lg shadow-pink-500/20">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#17171A] flex items-center justify-center border border-[rgba(233,79,159,0.30)]">
                <UserPlus className="w-5 h-5 text-[#D83F8F] dark:text-[#E94F9F]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-[#FAFAFA]">إنشاء حساب جديد</h1>
          <p className="text-xs text-slate-500 dark:text-[#C5C5C8]">
            {role === 'INSTRUCTOR'
              ? track === 'student'
                ? 'انضم كـ محاضر طالب واستفد من 30 يوماً تجربة مجانية كاملة'
                : 'انضم كـ محاضر وابدأ تدريس طلابك باحترافية كاملة'
              : 'ابدأ رحلتك التعليمية واكتسب مهارات برمجية وهندسية قوية'}
          </p>
        </div>

        {/* Role Switcher & Track Indicator */}
        <div className="space-y-3">
          {/* Role Switcher */}
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setTrack(''); }}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-[#080808] shadow-md'
                  : 'text-slate-600 dark:text-[#C5C5C8] hover:text-slate-900 dark:hover:text-[#FAFAFA]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>حساب طالب متدرب</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('INSTRUCTOR')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'INSTRUCTOR'
                  ? 'bg-[#D83F8F] dark:bg-[#E94F9F] text-white dark:text-[#080808] shadow-md'
                  : 'text-slate-600 dark:text-[#C5C5C8] hover:text-slate-900 dark:hover:text-[#FAFAFA]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>حساب محاضر</span>
            </button>
          </div>

          {/* Instructor Track Indicator */}
          {role === 'INSTRUCTOR' && (
            track === 'student' ? (
              <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-xs flex items-center justify-between animate-in fade-in shadow-md">
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#D83F8F] dark:text-[#E94F9F] shrink-0" />
                  <div>
                    <span className="font-black text-[#D83F8F] dark:text-[#E94F9F] block">باقة المحاضر الطالب</span>
                    <span className="text-[11px] text-slate-600 dark:text-[#C5C5C8]">منحة تمكين: شهر كامل مجاناً (30 يوماً) + باقة 120 ج.م</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrack('')}
                  className="text-[11px] text-slate-500 dark:text-[#85858A] hover:underline shrink-0 mr-2 cursor-pointer"
                >
                  التحويل لمدرس أو دكتور
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-pink-50 dark:bg-[rgba(233,79,159,0.10)] border border-pink-200 dark:border-[rgba(233,79,159,0.25)] text-[#D83F8F] dark:text-[#E94F9F] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                <span className="font-semibold">فترة تجريبية 14 يوماً مجاناً مع 0% عمولة للمدرسين والدكاترة</span>
                <button
                  type="button"
                  onClick={() => setTrack('student')}
                  className="text-[#D83F8F] dark:text-[#E94F9F] font-bold hover:underline shrink-0 text-[11px] text-right cursor-pointer"
                >
                  أنا طالب جامعي (30 يوماً مجاناً)
                </button>
              </div>
            )
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-[#FF5470]/10 border border-rose-200 dark:border-[#FF5470]/30 text-rose-700 dark:text-[#FF5470] text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#FF5470]" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Manual Registration Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              الاسم بالكامل
            </label>
            <div className="relative group">
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="أدخل اسمك الثلاثي أو الرباعي"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <User className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <Mail className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              رقم الهاتف أو الواتساب
            </label>
            <div className="relative group">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01012345678"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <Phone className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              كلمة المرور
            </label>
            <div className="relative group">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="6 أحرف على الأقل"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#FAFAFA] mb-1.5">
              تأكيد كلمة المرور
            </label>
            <div className="relative group">
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                className="w-full h-11 pr-11 pl-4 rounded-xl bg-slate-50 dark:bg-[#17171A] border border-slate-200 dark:border-[rgba(233,79,159,0.20)] text-slate-900 dark:text-[#FAFAFA] placeholder:text-slate-400 dark:placeholder:text-[#85858A] text-xs sm:text-sm focus:bg-white dark:focus:bg-[#17171A] focus:outline-none focus:border-[#D83F8F] dark:focus:border-[#E94F9F] transition-all shadow-xs"
              />
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-[#85858A] absolute right-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-[#D83F8F] dark:group-focus-within:text-[#E94F9F] transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-[#D83F8F] dark:bg-[#E94F9F] hover:bg-[#B83278] dark:hover:bg-[#FF5CAD] text-white dark:text-[#080808] font-black text-base shadow-xl dark:shadow-[0_8px_30px_rgba(233,79,159,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 border border-pink-600/30 dark:border-[rgba(233,79,159,0.40)]"
            >
              <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والبدء الآن'}</span>
              <ArrowLeft className="w-5 h-5 text-white dark:text-[#080808]" />
            </button>
          </div>
        </form>

        <SocialAuthButtons dividerText="أو التسجيل السريع عبر" callbackUrl="/dashboard" />

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-[#C5C5C8]">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="font-bold text-[#D83F8F] hover:text-[#B83278] dark:text-[#E94F9F] dark:hover:text-[#FF5CAD] transition-colors underline-offset-4 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-zinc-400">جاري التحميل...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

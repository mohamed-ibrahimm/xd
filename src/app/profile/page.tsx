'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Award,
  Lock,
  Save,
  ShieldCheck,
  Mail,
  Phone,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  GraduationCap,
  Crown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  ArrowRight,
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'dev-male-1', label: 'مطور برمجيات', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
  { id: 'inst-male', label: 'محاضر تقني', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
  { id: 'student-male', label: 'طالب جامعي', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' },
  { id: 'dev-female-1', label: 'مهندسة ذكاء اصطناعي', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
  { id: 'dev-female-2', label: 'مصممة واجهات', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300' },
  { id: 'senior-dev', label: 'مهندس أول', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300' },
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    fatherName: '',
    lastName: '',
    officialFullName: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setFormData({
            firstName: data.user.firstName || '',
            fatherName: data.user.fatherName || '',
            lastName: data.user.lastName || '',
            officialFullName: data.user.officialFullName || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
            avatarUrl: data.user.avatarUrl || '',
            currentPassword: '',
            newPassword: '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image File Compression & Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'يرجى اختيار ملف صورة صالح (JPEG أو PNG أو WebP)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, avatarUrl: compressedDataUrl }));
          setMessage({ type: 'success', text: 'تمت معاينة الصورة بنجاح! اضغط "حفظ التعديلات" لحفظها.' });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setMessage({ type: 'success', text: 'تم اختيار الصورة! اضغط "حفظ التعديلات" لتثبيتها.' });
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    setMessage({ type: 'success', text: 'تمت إزالة الصورة الشخصية. اضغط "حفظ التعديلات" للتأكيد.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'فشل التحديث' });
      } else {
        setUser(data.user);
        setMessage({ type: 'success', text: 'تم حفظ وتحديث بيانات الملف الشخصي والصورة بنجاح!' });
        setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        router.refresh();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-rose-400">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
        <a href="/login" className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold inline-block">
          تسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 text-slate-900 dark:text-white">
      {/* Top Back Navigation Link */}
      <div className="flex items-center justify-between">
        <Link
          href={user.role === 'ADMIN' ? '/admin' : user.role === 'INSTRUCTOR' ? '/instructor' : '/dashboard'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all shadow-xs group"
        >
          <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>
            {user.role === 'ADMIN'
              ? 'العودة إلى لوحة تحكم الإدارة (Admin)'
              : user.role === 'INSTRUCTOR'
              ? 'العودة إلى استوديو المحاضر'
              : 'العودة إلى لوحة الطالب الأكاديمية'}
          </span>
        </Link>

        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-500">
          معرّف الحساب: <span className="font-mono text-slate-700 dark:text-zinc-400">{user.username || user.email}</span>
        </span>
      </div>

      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <User className="w-7 h-7 text-[#D83F8F] dark:text-[#E94F9F]" />
            <span>الملف الشخصي وإعدادات الحساب</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
            تعديل وتحديث بياناتك الشخصية، الصورة الرمزية، الاسم المعتمد للشهادات، وكلمة المرور.
          </p>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-bold shadow-xs">
          {user.role === 'ADMIN' ? (
            <>
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-300">المشرف العام (SuperAdmin)</span>
            </>
          ) : user.role === 'INSTRUCTOR' ? (
            <>
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-300">محاضر معتمد (Instructor)</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
              <span className="text-[#D83F8F] dark:text-[#E94F9F]">طالب بالأكاديمية (Student)</span>
            </>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-md animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-2 cursor-pointer font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Photo Customization Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111113] border border-slate-200/90 dark:border-white/10 space-y-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Avatar Preview with Glowing Ring */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#D83F8F] via-purple-500 to-amber-400 shadow-xl shadow-pink-500/20 dark:shadow-pink-950/40">
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center relative">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/50 dark:to-purple-950/50 flex items-center justify-center text-[#D83F8F] dark:text-white text-3xl sm:text-4xl font-black">
                    {formData.firstName?.[0] || 'ق'}
                  </div>
                )}

                {/* Hover Upload Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer backdrop-blur-[2px]"
                >
                  <Camera className="w-5 h-5" />
                  <span>تغيير الصورة</span>
                </button>
              </div>
            </div>

            {/* Role Floating Badge */}
            <div className="absolute -bottom-1.5 right-1/2 translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/20 text-[10px] font-bold text-slate-800 dark:text-white shadow-md flex items-center gap-1 shrink-0 whitespace-nowrap">
              {user.role === 'ADMIN' ? '👑 مدير' : user.role === 'INSTRUCTOR' ? '🎓 محاضر' : '📖 طالب'}
            </div>
          </div>

          {/* Avatar Controls & Options */}
          <div className="space-y-4 text-center sm:text-right flex-1 min-w-0">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
                <span>الصورة الشخصية (Profile Avatar)</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                اختر صورة شخصية تعبر عن هويتك في المنصة وتظهر في استوديو المحاضر، الشات، ورأس الصفحة والقائمة الجانبية.
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D83F8F] to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة من جهازك</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#D83F8F] dark:text-[#E94F9F]" />
                <span>رابط خارجي (URL)</span>
              </button>

              {formData.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="إزالة الصورة والعودة للحرف الافتراضي"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إزالة</span>
                </button>
              )}
            </div>

            {/* Direct URL Input Bar */}
            {showUrlInput && (
              <div className="pt-2 animate-in fade-in">
                <div className="flex items-center gap-2 max-w-md mx-auto sm:mx-0">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#D83F8F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    تم
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preset Avatars Gallery Picker */}
        <div className="pt-5 border-t border-slate-200/80 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">أو اختر من النماذج الرمزية الجاهزة:</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold">نقرة واحدة للاختيار</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = formData.avatarUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center group cursor-pointer ${
                    isSelected
                      ? 'bg-pink-50 dark:bg-pink-950/50 border-[#D83F8F] ring-2 ring-[#D83F8F]/40 shadow-md'
                      : 'bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform">
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-bold truncate w-full">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Official Full Name for Certificates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-pink-500/[0.04] dark:bg-pink-950/[0.15] border border-pink-500/30 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-[#D83F8F] dark:text-[#E94F9F]">
            <Award className="w-5 h-5" />
            <span>الاسم الرباعي الرسمي المعتمد للشهادات (Official Full Name)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            هذا الاسم يتم طباعته وإدراجه آلياً على كافة الشهادات المعتمدة الصادرة لك من الأكاديمية مع رمز التحقق السريع (QR Code).
          </p>
          <input
            type="text"
            name="officialFullName"
            required
            value={formData.officialFullName}
            onChange={handleChange}
            placeholder="الاسم الرباعي الرسمي المعتمد باللغة العربية"
            className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-[#111113] border border-pink-500/40 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#D83F8F] focus:ring-2 focus:ring-pink-500/20 shadow-xs"
          />
        </div>

        {/* Basic Personal Details */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111113] border border-slate-200/90 dark:border-white/10 space-y-5 shadow-xl backdrop-blur-xl">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
            <span>البيانات الأساسية ومعلومات التواصل</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">الاسم الأول</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#D83F8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">اسم الأب</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#D83F8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">اسم العائلة (اللقب)</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#D83F8F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">اسم المستخدم (Username)</label>
              <input
                type="text"
                disabled
                value={user.username || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 text-xs cursor-not-allowed font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 text-xs cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">رقم الهاتف / الواتساب</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01012345678"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#D83F8F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">النبذة التعريفية (Bio)</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="اكتب نبذة مختصرة عن خبراتك أو اهتماماتك التقنية والتعليمية..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#D83F8F] leading-relaxed"
            />
          </div>
        </div>

        {/* Change Password Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-[#111113] border border-slate-200/90 dark:border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
            <Lock className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />
            <span>تغيير كلمة المرور (اختياري)</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            اترك هذه الحقول فارغة إذا كنت لا ترغب في تغيير كلمة المرور الحالية.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">كلمة المرور الحالية</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#D83F8F]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">كلمة المرور الجديدة</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#D83F8F]"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D83F8F] via-pink-600 to-purple-600 hover:scale-[1.02] text-white font-black text-sm shadow-xl shadow-pink-500/25 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات والصورة'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
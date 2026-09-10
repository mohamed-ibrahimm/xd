'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Sparkles, CheckCircle2, ShieldCheck, Copy, Check } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxUses: 100,
    perUserLimit: 1,
    minOrderAmount: 0,
    count: 1,
  });

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('تم توليد الكوبون بنجاح!');
        setFormData({ ...formData, code: '' });
        loadCoupons();
      } else {
        setMessage(data.error || 'فشل إنشاء الكوبون');
      }
    } catch (e) {
      setMessage('حدث خطأ في الاتصال');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            إدارة وتوليد كوبونات الخصم الذكية
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
            توليد كوبونات بنسب مئوية أو مبالغ ثابتة أو كوبونات مجانية 100% مع توليد أكواد عشوائية ذكية
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          توليد كوبون جديد (GENERATE COUPON)
        </h3>

        {message && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                كود الكوبون
              </label>
              <button
                type="button"
                onClick={() => {
                  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
                  let rand = '';
                  for (let i = 0; i < 6; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
                  setFormData({ ...formData, code: `QIMAM-${rand}` });
                }}
                className="text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold"
              >
                توليد عشوائي 
              </button>
            </div>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="مثال: QIMAM-7KX92P"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs font-mono uppercase placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">نوع الخصم</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="PERCENTAGE">نسبة مئوية (%)</option>
              <option value="FIXED">مبلغ خصم ثابت (ج.م)</option>
              <option value="FREE_100">كوبون مجاني 100% (Free 100%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">قيمة الخصم (% أو ج.م)</label>
            <input
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">الحد الأقصى للاستخدام (مرات)</label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">الحد لكل طالب (مرة)</label>
            <input
              type="number"
              value={formData.perUserLimit}
              onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-raised border border-slate-200 dark:border-border text-slate-900 dark:text-white text-xs focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-primary-900/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'جاري التوليد...' : 'توليد الكوبون (GENERATE)'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-400 font-bold">
                <th className="p-4">كود الكوبون</th>
                <th className="p-4">نوع وقيمة الخصم</th>
                <th className="p-4">الاستخدامات المنجزة</th>
                <th className="p-4">الحد الأقصى</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-mono font-bold text-indigo-600 dark:text-primary-300">
                      <span>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(c.code)}
                        className="text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white cursor-pointer"
                      >
                        {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>

                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {c.discountType === 'PERCENTAGE'
                      ? `${c.discountValue}% خصم`
                      : c.discountType === 'FIXED'
                      ? `${c.discountValue} ج.م خصم ثابت`
                      : 'مجاني 100%'}
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-700 dark:text-zinc-300">{c.usedCount} مرات</td>
                  <td className="p-4 text-slate-600 dark:text-zinc-400">{c.maxUses} مرة</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                      نشط وساري
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-zinc-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
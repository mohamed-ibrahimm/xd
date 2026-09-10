'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`p-2 rounded-full border border-amber-500/30 bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center shrink-0 shadow-sm cursor-pointer ${className}`}
      title={theme === 'DARK' ? 'التحويل إلى الوضع النهاري (أبيض)' : 'التحويل إلى الوضع الليلي'}
      aria-label="تبديل المظهر"
    >
      {theme === 'DARK' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#D83F8F] dark:text-[#E94F9F]" />}
    </button>
  );
}

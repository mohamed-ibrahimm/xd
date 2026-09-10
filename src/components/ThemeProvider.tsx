'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'DARK' | 'LIGHT';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'LIGHT',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('DARK');
  const [mounted, setMounted] = useState(false);

  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (t === 'LIGHT') {
      root.classList.remove('dark');
      root.classList.add('light-theme');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light-theme');
        body.setAttribute('data-theme', 'light');
      }
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.remove('light-theme');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    // Read saved preference, default to DARK (Dark Tech Neon Emerald)
    let saved: Theme = 'DARK';
    try {
      const stored = localStorage.getItem('qimam_theme_v2') || localStorage.getItem('qimam_theme');
      if (stored === 'LIGHT') {
        saved = 'LIGHT';
      } else {
        saved = 'DARK';
      }
    } catch (e) {
      saved = 'DARK';
    }

    setThemeState(saved);
    applyTheme(saved);
  }, [applyTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem('qimam_theme_v2', t);
      localStorage.setItem('qimam_theme', t);
    } catch (e) {}
    applyTheme(t);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'DARK' ? 'LIGHT' : 'DARK';
      try {
        localStorage.setItem('qimam_theme_v2', nextTheme);
        localStorage.setItem('qimam_theme', nextTheme);
      } catch (e) {}
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop & complete progress when navigation finishes
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger instant 1ms laser progress
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only trigger for internal route changes (not external, not anchors on same page, not new tabs)
      if (
        href.startsWith('/') &&
        !href.startsWith('/#') &&
        !href.startsWith('//') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // If clicking the current path, don't trigger
        const url = new URL(href, window.location.href);
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }

        // Start progress instantly (1 millisecond feedback)
        setVisible(true);
        setProgress(25);

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (timerRef.current) clearInterval(timerRef.current);
              return 88;
            }
            return prev + (prev < 50 ? 20 : 10);
          });
        }, 120);
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full transition-all ease-out duration-200 bg-gradient-to-r from-[#D83F8F] via-[#E94F9F] to-[#FF5CAD] dark:from-[#E94F9F] dark:via-[#FF5CAD] dark:to-[#F47BB7] shadow-[0_0_12px_rgba(233,79,159,0.85)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';
import { Headphones } from 'lucide-react';

interface FloatingWhatsAppProps {
  settings?: Record<string, string>;
}

export default function FloatingWhatsApp({ settings = {} }: FloatingWhatsAppProps) {
  const pathname = usePathname();

  // Hide in video classroom, admin studio, and instructor portal
  if (pathname.startsWith('/learn') || pathname.startsWith('/admin') || pathname.startsWith('/instructor')) {
    return null;
  }

  const candidateNum = settings.WHATSAPP_NUMBER || settings.CONTACT_WHATSAPP || settings.CONTACT_PHONE || '';
  const rawNum = (candidateNum && !candidateNum.includes('1001234567')) ? candidateNum : '01555791568';
  const cleanNum = rawNum.replace(/[^0-9]/g, '');
  let formattedWhatsapp = cleanNum;
  if (formattedWhatsapp.startsWith('002')) {
    formattedWhatsapp = formattedWhatsapp.slice(2);
  } else if (formattedWhatsapp.startsWith('0')) {
    formattedWhatsapp = '2' + formattedWhatsapp;
  } else if (formattedWhatsapp.length === 10 && formattedWhatsapp.startsWith('1')) {
    formattedWhatsapp = '20' + formattedWhatsapp;
  }
  const whatsappUrl = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن تفاصيل الكورسات والدبلومات')}`;

  return (
    <>
      {/* Floating Support Button (Small, on the RIGHT side with symmetrical luxury pulse) */}
      <aside aria-label="الدعم الفني المباشر">
        <Link
          href="/support"
          className="fixed bottom-3.5 sm:bottom-6 right-2 sm:right-6 z-50 flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 dark:from-[#0df268] dark:via-[#00e55b] dark:to-[#00b846] dark:hover:from-[#10f068] dark:hover:to-[#00e55b] text-zinc-950 dark:text-black shadow-xl shadow-amber-500/35 dark:shadow-[0_10px_35px_rgba(0,229,91,0.45)] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-amber-300/60 dark:border-[#00e55b]/60 backdrop-blur-sm cursor-pointer"
          title="تذاكر ومساعدة الدعم الفني"
        >
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute -inset-1 rounded-full bg-amber-300/50 dark:bg-[#00e55b]/50 animate-ping pointer-events-none" />
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-950 dark:bg-black text-amber-400 dark:text-[#00e55b] flex items-center justify-center shadow-xs">
              <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 dark:text-[#00e55b] group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <div className="flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-black animate-pulse" />
              <span className="text-[10px] text-zinc-900 dark:text-black font-bold leading-none">دعم فوري</span>
            </div>
            <span className="text-xs font-black leading-tight mt-0.5 whitespace-nowrap text-zinc-950 dark:text-black">الدعم الفني</span>
          </div>
        </Link>
      </aside>

      {/* Floating WhatsApp Button (On the LEFT side) */}
      <aside aria-label="تواصل واتساب">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3.5 sm:bottom-6 left-2 sm:left-6 z-50 flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-emerald-600/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group border border-white/40 backdrop-blur-sm cursor-pointer"
          title="تحدث مباشرة مع إدارة الأكاديمية عبر الواتساب"
        >
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping pointer-events-none" />
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#25D366] flex items-center justify-center shadow-xs">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-right">
            <div className="flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] text-emerald-100 font-bold leading-none">متاح أونلاين</span>
            </div>
            <span className="text-xs font-black leading-tight mt-0.5 whitespace-nowrap">واتساب</span>
          </div>
        </a>
      </aside>
    </>
  );
}

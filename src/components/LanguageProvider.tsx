'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

export type Lang = 'ar' | 'en';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: (arText: string, enFallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  toggleLang: () => {},
  setLang: () => {},
  t: (arText, enFallback) => enFallback || arText,
});

export const DICTIONARY: Record<string, string> = {
  "استوديو تدريس سحابي متكامل يمنح المدرسين والدكاترة الجامعيين استقلالية تامة، مع تحويل أرباحك فورياً إلى حسابك الشخصي عبر إنستاباي والمحافظ بدون اقتطاع أي عمولة.": "An integrated cloud teaching studio offering professors complete independence, with instant payouts directly to your InstaPay or e-wallets without commission deductions.",
  "تصفح واشترِ أقوى المذكرات والكتب المعدة بواسطة نخبة المحاضرين والطلاب المتفوقين، واقرأها من أي جهاز مع حماية مشددة بنظام DRM ومعاينة مجانية لأولى الصفحات.": "Browse and purchase top notes and books prepared by elite instructors and top students, and read them on any device with strict DRM protection and free previews.",
  "دبلومات مكثفة تجمع أهم الكورسات التخصصية لإعدادك لسوق العمل وتوفير أكثر من 50% مقارنة بشراء الكورسات منفردة، مع شهادة تخرج معتمدة بكود تحقق رقمي.": "Intensive diplomas combining key specialized courses to prepare you for the job market, saving over 50% compared to buying courses individually, with accredited graduation certificates and digital verification code.",
  "ارفع كتبك ومذكراتك وملخصاتك الآن، وتمتع بحماية مشددة ضد التحميل والنسخ (DRM Shield) مع استلام أرباحك دورياً وبناء جمهورك الطلابي والمهني.": "Upload your books and summaries now, enjoy strict DRM Shield protection against downloads and piracy, receive payouts regularly, and build your student audience.",
  "لوحة متكاملة لإنشاء وتوليد أكواد الخصم الترويجية لطلابك، مع تحديد نسب الخصم وعدد مرات الاستخدام وتواريخ الصلاحية لزيادة سرعة الالتحاق.": "Comprehensive dashboard to generate student discount coupon codes with custom discount percentages, max usage, and expiration dates.",
  "نظام حماية يمنع تسجيل الشاشة ويقوم بطباعة بيانات الطالب (الاسم والبريد ورقم الهاتف) كعلامة مائية متحركة ومضيئة لحماية محتواك الفكري.": "Anti-recording protection that prints student information (name, email, phone) as a glowing moving watermark to safeguard your intellectual property.",
  "لوحة تحكم ذكية تتيح لك متابعة تفاعل طلابك، نسب الإكمال، وتقييمات الدروس، مع إمكانية التواصل والرد على استفسارات الطلاب مباشرة.": "Smart analytics dashboard to monitor student engagement, completion rates, and lesson ratings, with direct student messaging support.",
  "إمكانية تفعيل وإصدار شهادات إتمام رقمية معتمدة لكل طالب يجتاز كورسـك، مع كود استعلام وتحقق رقمي فوري يرفع من مصداقية دوراتك.": "Enable and issue accredited completion certificates for students passing your course, with instant digital QR verification codes.",
  "يقوم الطلاب بتحويل قيمة الكورس مباشرة إلى حسابك الشخصي في إنستاباي أو فودافون كاش دون وسيط، وتتحكم بالقبول بضغطة زر واحدة.": "Students transfer course fees directly to your personal InstaPay or Vodafone Cash account with zero intermediary, and you approve with one click.",
  "تحتفظ بكامل عوائد دوراتك التدريبية بنسبة 100%. لا نقتطع أي نسبة مئوية من مبيعاتك نهائياً، فالجهد جهدك والعائد بالكامل لك.": "Retain 100% of your course revenues. We never deduct any percentage cut from your sales: your effort, your full revenue.",
  "مخصص للأساتذة والمحاضرين الذين يرغبون في بناء استوديو تعليمي سحابي مستقل لدفعاتهم مع سيطرة كاملة على المحتوى والأسعار.": "Dedicated to professors and instructors wanting to build an independent cloud educational studio for their students with full control over content and pricing.",
  "نشر وبيع المذكرات والكتب الرقمية مع ميزة المعاينة المجانية، مع دعم ورعاية للطلبة المتفوقين للتدريس وتحقيق دخل مستقل.": "Publish and sell digital notes and books with free previews, plus grants and sponsorship for top students to teach and earn.",
  "مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.": "Integrated engineering tracks, accredited diplomas, and real production projects qualifying you for the job market.",
  "مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف": "Integrated engineering tracks, accredited diplomas, and real production projects qualifying you for the job market",
  "علامة مائية ذكية متحركة تطبع اسم ورقم هاتف الطالب على الشاشة لمنع تصوير الفيديوهات أو سرقة ملفات الـ": "Smart moving watermark printing student name and phone number on screen to prevent screen recording and file theft",
  "بيئة تعليمية متكاملة تجمع بين أقوى تقنيات البث المباشر، حماية المحتوى من السرقة، وسرعة سحب الأرباح.": "An integrated educational environment combining powerful live streaming, content piracy protection, and fast payouts.",
  "بنية تحتية سحابية متقدمة مصممة خصيصاً للمحاضرين والمعلمين والدكاترة لإدارة دوراتهم بسهولة وأمان.": "Advanced cloud infrastructure custom-designed for instructors, teachers, and doctors to manage courses with ease and security.",
  "سجل حسابك الآن في أقل من دقيقة وابدأ فترة التجربة المجانية، وشارك خبراتك وعلمك مع آلاف الطلاب.": "Register your account now in under a minute, start your free trial, and share your knowledge with thousands of students.",
  "اخرج لطلابك لحظياً بدقة 1080p، شارك شاشتك، واطلق مسابقات وكويزات تفاعلية حية (Kahoot Mode).": "Go live to your students in 1080p, share your screen, and launch live interactive quizzes (Kahoot Mode).",
  "مناهج هندسية وتطبيقية شاملة مبنية لتؤهلك لسوق العمل وتزودك بالخبرة الواقعية اللازمة للتفوق.": "Comprehensive engineering and practical curricula built to prepare you for the job market and give you real-world expertise.",
  "حرك المؤشرات لتكتشف الفارق بين منصتنا والمنصات التقليدية التي تقتطع 30% إلى 50% من أرباحك.": "Slide the controls to discover the difference between our platform and traditional platforms taking 30% to 50% of your revenues.",
  "اخرج لطلابك لحظياً بدقة 1080p، شارك شاشتك، واطلق مسابقات وكويزات تفاعلية حية (Kahoot Mode)": "Go live to your students in 1080p, share your screen, and launch live interactive quizzes (Kahoot Mode)",
  "تتضمن هذه الدبلومة 3 مسارات تدريبية كاملة: تطوير الويب، تصميم الواجهات، وأساسيات الحماية.": "This diploma includes 3 complete training tracks: web development, UI design, and security fundamentals.",
  "احترف بناء تطبيقات الويب الحديثة والآمنة من الصفر حتى الإطلاق على بيئة الإنتاج السحابية.": "Master building modern, secure web apps from scratch to cloud production deployment.",
  "ابدأ الآن بنشر كورساتك ومذكراتك مع حماية كاملة ضد التسريب وسحب أرباح فوري عبر إنستاباي.": "Start publishing your courses and notes now with full anti-leak protection and instant InstaPay payouts.",
  "الدبلومة الأكثر شمولاً في الوطن العربي لتأهيلك لسوق العمل العالمي كمهندس برمجيات محترف.": "The most comprehensive diploma in the Arab world qualifying you for the global job market as a professional software engineer.",
  "الدبلومة الأكثر شمولاً في الوطن العربي لتأهيلك لسوق العمل العالمي كمهندس برمجيات محترف": "The most comprehensive diploma in the Arab world qualifying you for the global job market as a professional software engineer",
  "انضم فوراً إلى محاضرتك باستخدام الرابط أو معرّف القاعة، أو ابدأ قاعة بث جديدة لطلابك.": "Join your lecture immediately using the link or room ID, or start a new broadcast room for your students.",
  "بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم ومشاريع الإنتاج الفعلية.": "Your professional gateway to mastering programming, AI, design, and real-world production projects.",
  "تصميم أنظمة ضخمة تتحمل ملايين المستخدمين مع إدارة السيرفرات وقواعد البيانات الموزعة.": "Design large-scale systems handling millions of users with distributed servers and databases.",
  "تواصل مع فريق الاستشارات الأكاديمية لاختيار المسار التدريبي المناسب لمستواك وهدفك.": "Contact the academic mentorship team to choose the right training track for your level and goals.",
  "جميع كورساتك نشطة وتستقبل طلبات الشراء ويتم تحويل مبالغ الطلاب على حساباتك مباشرة.": "All your courses are active and receiving purchases, with payouts transferred directly to your accounts.",
  "صمم واجهات عصرية وأنظمة تصميمية متكاملة في Figma مع مراعاة المعايير العربية RTL.": "Design modern interfaces and design systems in Figma with RTL support.",
  "من الصفر حتى احتراف بناء التطبيقات السحابية وقواعد البيانات ونشر المشاريع الحية.": "From zero to mastering cloud apps, databases, and live project deployment.",
  "جميع الدورات تشمل مشاريع حقيقية لسوق العمل وشهادة إتمام معتمدة بكود تحقق رقمي.": "All courses include real production projects and accredited completion certificates with digital QR verification.",
  "دبلومة هندسة البرمجيات وتطوير الويب المتكاملة (Full-Stack Mastery Diploma)": "Software Engineering & Integrated Web Development Diploma (Full-Stack Mastery Diploma)",
  "تعلم كيفية دمج نماذج LLMs مثل GPT و Gemini في تطبيقاتك البرمجية باحترافية.": "Learn how to integrate LLM models like GPT and Gemini into your apps professionally.",
  "150 مسألة امتحانات في الخوارزميات وهياكل البيانات مع الحلول النموذجية.": "150 exam questions in algorithms and data structures with model solutions.",
  "، مشاركة الشاشة، كويزات حية أثناء البث، وتسجيل سحابي تلقائي للمحاضرات.": ", screen sharing, live quizzes during broadcast, and automatic cloud recording.",
  "ابدأ مجاناً لمدة 14 يوماً بدون أي اقتطاع! سحب أرباح فوري عند الطلب عبر": "Start free for 14 days with zero deductions! Instant payouts on demand via",
  "منصة الصدارة: الكورسات الأكثر نشراً وبحثاً والضجة الأكبر في سوق العمل": "Leading Platform: Most Published, Searched & High-Impact Courses in the Job Market",
  "انضم إلى آلاف المتعلمين واحترف البرمجة والذكاء الاصطناعي والتصميم مع": "Join thousands of learners and master programming, AI, and design with",
  "دورة تدريبية متخصصة في دورة تجربة إضافة كورس جديد الآن 1787906318470": "Specialized training course in New Course Creation Test 1787906318470",
  "خصم استثنائي 50% لفترة محدودة على جميع المسارات والدبلومات الهندسية ": "Special 50% Discount for a Limited Time on All Engineering Tracks & Diplomas",
  "خصم استثنائي 50% لفترة محدودة على جميع المسارات والدبلومات الهندسية": "Special 50% Discount for a Limited Time on All Engineering Tracks & Diplomas",
  "تصميم واجهات وتجربة المستخدم الاحترافية UI/UX من الصفر حتى الإتقان": "Professional UI/UX Interface Design from Scratch to Mastery",
  "تلخيص قوانين وحلول امتحانات الرياضيات الهندسية والتفاضل والتكامل.": "Summary of laws and solved exam questions for engineering calculus and mathematics.",
  "دليل شامل لاحتراف أحدث تقنيات React و Next.js 14 بمشاريع إنتاجية.": "Comprehensive guide to mastering React and Next.js 14 with real-world production projects.",
  "لماذا يفضل الأساتذة والطلاب التدريس عبر منصتنا السحابية المستقلة؟": "Why Do Professors & Students Prefer Teaching on Our Independent Cloud Platform?",
  "البرمجة وهندسة النظم والذكاء الاصطناعي ومشاريع الإنتاج الحقيقية": "Coding, Systems Engineering, AI & Production Projects",
  "بنك أسئلة واختبارات هياكل البيانات والخوارزميات (محلول بالكامل)": "Data Structures & Algorithms Question Bank & Exams (Fully Solved)",
  "الدبلومة الهندسية الأكثر طلباً ومبيعاً لعام 2026 (TRENDING #1)": "Most Demanded & Best-Selling Engineering Diploma in 2026 (TRENDING #1)",
  "الدليل العملي لاحتراف تطوير واجهات الويب (React & Next.js 14)": "Practical Guide to Mastering Web Frontend Development (React & Next.js 14)",
  "بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم": "Your Professional Gateway to Software Engineering, AI & Design",
  "المذكرات الأعلى تقييماً وإقبالاً من طلاب الجامعات والمهندسين": "Highest Rated & Popular Notes from University Students & Engineers",
  "كتيب مجاني يلخص أسرار المقابلات البرمجية وأسئلة حل المشكلات.": "Free handbook summarizing coding interview strategies and problem solving questions.",
  "يجب تسجيل الدخول أولاً بحساب المدير للوصول إلى لوحة الإدارة": "You must log in with an admin account first to access the admin panel",
  ". صُممت المنصة بأحدث المعايير البرمجية والتصميمية الحديثة.": ". The platform was designed with the latest modern software and design standards.",
  "ملخص شامل لهندسة البرمجيات وأنماط التصميم مع أمثلة محلولة.": "Comprehensive summary of software engineering and design patterns with solved examples.",
  "هل أنت محاضر متميز أو طالب متفوق؟ انشر مذكراتك واربح 85%!": "Are you a distinguished instructor or top student? Publish your notes and earn 85%!",
  "دبلوم تطوير تطبيقات الويب الشاملة بـ Next.js و TypeScript": "Full-Stack Web Development Diploma with Next.js & TypeScript",
  "السلام عليكم، أود الاستفسار عن تفاصيل الكورسات والدبلومات": "Hello, I would like to inquire about course and diploma details",
  "مذكرة القوانين والمسائل المحلولة في الرياضيات الهندسية 2": "Formula & Solved Problems Note in Engineering Mathematics 2",
  "ملخص مهارات مقابلات البرمجة والـ Problem Solving (مجاني)": "Coding Interview Skills & Problem Solving Summary (Free)",
  "تدريب عملي ومباشر من كبار المهندسين والمحاضرين المعتمدين": "Direct hands-on training from senior engineers and certified instructors",
  "يجب تسجيل الدخول بحساب المعلم للوصول إلى استوديو المعلم": "You must log in with an instructor account to access the instructor studio",
  "أستوديو Live Stream ومشاركة الشاشة (Google Meet Style)": "Live Stream Studio & Screen Sharing (Google Meet Style)",
  "احتراف الذكاء الاصطناعي وهندسة الأوامر وتطوير النماذج": "Mastering AI, Prompt Engineering & Model Development",
  "مسار عملي متكامل لتطوير تطبيقات الويب السريعة والآمنة": "Comprehensive practical track to build fast and secure web applications",
  "دورة تدريبية متخصصة في دورة اختبار الإنشاء السريع 987": "Specialized training course in Fast Creation Test 987",
  "متابعة فورية للمبيعات، الطلاب، المدفوعات، وسير المنصة": "Real-time tracking of sales, students, payments, and platform activity",
  "مشاريع عملية مكثفة تؤهلك لاحتراف التقنية والعمل الحر.": "Intensive hands-on projects qualifying you for tech careers and freelancing.",
  "الملخص الذهبي الشامل في هندسة البرمجيات وتصميم النظم": "Comprehensive Golden Summary in Software Engineering & System Design",
  "مسارات دراسية مرنة تناسب وتيرة تعلمك وأهدافك المهنية": "Flexible learning tracks tailored to your pace and career goals",
  "لوحة تحكم ذكية لمراقبة أدائك، واجباتك، ومشاريع تخرجك": "Smart dashboard to monitor your performance, assignments, and capstones",
  "معرّف القاعة أو رابط المحاضرة (Meeting ID or Link):": "Room ID or Meeting Link:",
  "نموذج 0% عمولة — الأرباح 100% لك (14 يوماً مجاناً)": "0% Commission Model — 100% Profits to You (14 Days Free)",
  "انضم كـ مدرس أو دكتور (14 يوماً مجاناً • 0% عمولة)": "Join as Teacher or Doctor (14 Days Free • 0% Commission)",
  "الدبلومة الهندسية الأكثر طلباً ومبيعاً لعام 2026 (": "Most Demanded & Best-Selling Engineering Diploma in 2026 (",
  "الدبلومة الهندسية الأكثر طلباً ومبيعاً لعام 2026": "Most Demanded & Best-Selling Engineering Diploma in 2026",
  "رفع اليد وفتح المايك للنقاش ومسابقات كويزات حية": "Hand Raise, Open Mic for Discussions & Live Quizzes",
  "خصم استثنائي 50% لفترة محدودة على جميع المسارات": "Special 50% Discount for a Limited Time on All Tracks",
  "انضم كـ مدرس أو دكتور (14 days Free • 0% عمولة)": "Join as Teacher or Doctor (14 Days Free • 0% Commission)",
  "احتراف هندسة النظم وتصميم المعماريات البرمجية (": "Systems Engineering & Architecture Mastery (",
  "لتأهيلك لسوق العمل العالمي كمهندس برمجيات محترف": "qualifying you for the global job market as a professional software engineer",
  "بث فائق السرعة مع مشاركة شاشة خالية من التقطيع": "Ultra-Fast Streaming with Lag-Free Screen Sharing",
  "درّس لطلابك واحتفظ بكامل عوائد مبيعاتك مباشرة": "Teach your students and keep 100% of your sales revenues directly",
  "غرف WebRTC محمية مع علامات مائية لمنع التسريب": "WebRTC Protected Rooms with Anti-Leak Watermarks",
  "دورة تجربة إضافة كورس جديد الآن 1787906318470": "New Course Creation Test 1787906318470",
  "هل أنت محاضر أو طالب متفوق ترغب بنشر شروحاتك؟": "Are you an instructor or honor student looking to publish tutorials?",
  "سوق ومكتبة المذكرات والمراجع الرقمية المشفرة": "Encrypted Digital Notes & References Marketplace",
  "محاضرات مسجلة وتطبيقية متاحة 24/7 من أي جهاز": "Recorded and hands-on lectures available 24/7 on any device",
  "مقارنة بين منصتنا والمنصات التعليمية الأخرى": "Comparison Between Our Platform and Traditional Platforms",
  "مثال: مراجعة هندسة البرمجيات أو حل كويز...": "e.g. Software engineering review or quiz solving...",
  "قاعات البث المباشر والاجتماعات الافتراضية": "Live Streaming Rooms & Virtual Meetings",
  "المذكرات الأكثر طلباً ومبيعاً هذا الأسبوع": "Most Demanded & Best-Selling Notes This Week",
  "كل ما تحتاجه للتدريس والربح في منصة واحدة": "Everything You Need to Teach & Earn in One Platform",
  "، نماذج لغوية، وربطها بأنظمة الأعمال والـ": ", LLMs, and integrating them with business systems and",
  "الكورسات والمسارات الأكثر طلباً لعام 2026": "Most In-Demand Courses & Tracks for 2026",
  "بوابتك لاحتراف البرمجة والذكاء الاصطناعي": "Gateway to Coding & AI Mastery",
  "حدث خطأ في الاتصال، يرجى المحاولة لاحقاً": "Connection error occurred, please try again later",
  "اشترك كمحاضر طالب (منحة 14 يوماً مجاناً)": "Join as Student Instructor (14 Days Free Grant)",
  "تحصيل فوري ومباشر عبر InstaPay والمحافظ": "Direct Instant Collections via InstaPay & E-Wallets",
  "مثال: math-101 أو الصق الرابط كاملاً...": "e.g. math-101 or paste full link...",
  "البرمجة وهندسة النظم والذكاء الاصطناعي": "Coding, Systems Engineering & AI",
  "والمحافظ الإلكترونية دون أي رسوم خفية.": "and e-wallets with no hidden fees.",
  "الدبلومة الأكثر شمولاً في الوطن العربي": "The most comprehensive diploma in the Arab world",
  "دليل الكورسات والدبلومات الأكثر طلباً": "Directory of Most In-Demand Courses & Diplomas",
  "إدارة كوبونات الخصم والعروض الترويجية": "Discount Coupons & Promotional Offers Management",
  "يرجى إدخال معرّف القاعة أو لصق الرابط": "Please enter room ID or paste link",
  "admin أو student أو البريد الإلكتروني": "admin, student, or email",
  "سوق المذكرات والكتب (خصم 50% ومعاينة)": "Notes & Books Marketplace (50% Off & Preview)",
  "لماذا يختار المحاضرون والطلاب منصتنا؟": "Why Do Instructors & Students Choose Our Platform?",
  "المنصة الرائدة لعلوم البرمجة والتقنية": "Leading Platform for Coding & Tech Sciences",
  "المسارات الشاملة المعتمدة لسوق العمل": "Accredited Comprehensive Tracks for the Job Market",
  "استوديو تدريس سحابي وإحصائيات متقدمة": "Cloud Teaching Studio & Advanced Analytics",
  "علامة مائية ديناميكية ببيانات الطالب": "Dynamic Watermark with Student Info",
  "دورة هندسة النظم وتطوير الويب الحديث": "Modern Systems Engineering & Web Development Course",
  "اختر مسارك البرمجي وابدأ رحلتك اليوم": "Choose Your Software Track & Start Your Journey Today",
  "يوماً مجاناً • 0% عمولة على المبيعات": "Days Free • 0% Sales Commission",
  "الكورسات المتضمنة في هذه الدبلومة (": "Included Courses in this Diploma (",
  "حماية متطورة بعلامة مائية ديناميكية": "Advanced Dynamic Watermark Protection",
  "الدبلومة الأكثر طلباً في سوق العمل ": "Most In-Demand Diploma in the Job Market",
  "هندسة الذكاء الاصطناعي وتطبيقات الـ": "AI Engineering & Advanced Applications",
  "سوق المذكرات ومنحة الطلاب المتفوقين": "Notes Marketplace & Honor Student Grant",
  "جاهز لإطلاق أول كورس تعليمي باسمك؟": "Ready to launch your first course in your name?",
  "الدبلومة الأكثر طلباً في سوق العمل": "Most In-Demand Diploma in the Job Market",
  "بوابتك الاحترافية لاحتراف البرمجة": "Your Professional Gateway to Programming",
  "محاضرات تفاعلية ومناقشات هندسية ←": "Interactive Lectures & Discussions →",
  "تصفح كافة المذكرات والكتب المتاحة": "Browse All Available Notes & Books",
  "لحظي ومباشر على InstaPay والمحافظ": "Instant & Direct on InstaPay and E-Wallets",
  "منحة شهر كامل مجاناً وباقة مدعومة": "Full Month Free Grant & Subsidized Plan",
  "اسم المستخدم أو البريد الإلكتروني": "Username or Email",
  "متابعة التعلم (آخر كورس تم فتحه):": "Continue Learning (Last Opened Course):",
  "كافة الملفات محمية بنظام الـ DRM": "All Files Protected by DRM System",
  "غرفة الاجتماعات والمحاضرات الحية": "Meeting Room & Live Lectures",
  "صافي أرباحك في منصتنا (100% لك):": "Your Net Earnings on Our Platform (100% Yours):",
  "كارنيه، جدول دراسي، أو إثبات قيد": "Student Card, Study Schedule, or Enrollment Proof",
  "التميز الأكاديمي والمهني المعتمد": "Accredited Academic & Professional Excellence",
  "شرح حي مباشر مع الطلاب بدقة 1080": "Live direct instruction with students in 1080p",
  "شهادات إتمام ذكية موثقة برمز QR": "Smart Completion Certificates Verified by QR Code",
  "DevOps والبنية التحتية السحابية": "DevOps & Cloud Infrastructure",
  "نظرة عامة والتحليلات الأكاديمية": "Academic Overview & Analytics",
  "لوحة المتابعة الأكاديمية للطلاب": "Student Academic Tracking Dashboard",
  "الرابط أو معرّف القاعة غير صالح": "Invalid link or room ID",
  "حماية رقمية متقدمة ضد التسريب (": "Advanced Digital Anti-Piracy Protection (",
  " مع باقة اشتراك مدعومة ومخفضة.": "For every university or school student who wants to explain subjects to peers; we offer a full free month and \\\\",
  "محاضرات تفاعلية ونقاشات هندسية": "Interactive Lectures & Discussions",
  "برنامج شراكة المحتوى والمذكرات": "Content & Notes Partnership Program",
  "ما تخصمه المنصات الأخرى (40%):": "What Other Platforms Deduct (40%):",
  "دورة اختبار الإنشاء السريع 987": "Fast Creation Test Course 987",
  "أحدث طلبات الاشتراك والمدفوعات": "Latest Enrollments & Payments",
  "تحويل الموقع إلى اللغة العربية": "Switch site to Arabic",
  "شهادة تخرج موثقة بالـ QR Code": "Graduation Certificate Verified with QR Code",
  "لا يُطلب أي مستند (بدء مباشر)": "No Documents Required (Instant Start)",
  "بدء تجربة المدرس أو الدكتور (": "Start Professor / Doctor Trial (",
  "التصميم وتجربة المستخدم UI/UX": "UI/UX Design & User Experience",
  "د. عبد الرحمن خالد محمد السيد": "Dr. Abdelrahman Khaled Mohamed Elsayed",
  "م. محمد طارق محمود عبد العزيز": "Eng. Mohamed Tarek Mahmoud Abdelaziz",
  "خصم استثنائي 50% لفترة محدودة": "Special 50% Discount for a Limited Time",
  "أستوديو البث المباشر التفاعلي": "Interactive Live Broadcast Studio",
  "ملخصات ومراجع محمية بالـ DRM": "Summaries & DRM-Protected References",
  "معاينة مجانية لكافة المذكرات": "Free Preview for All Notes",
  "شهادات معتمدة بكود تحقق رقمي": "Accredited Certificates with Verification Code",
  "لا يُطلب بطاقة شخصية نهائياً": "Zero ID Documents Required",
  "للمدرسين والدكاترة الجامعيين": "For University Professors & Doctors",
  "InstaPay وفودافون كاش مباشرة": "InstaPay & Vodafone Cash Directly",
  "الذكاء الاصطناعي وتعلم الآلة": "AI & Machine Learning",
  "سوق المذكرات والكتب الرقمية": "Digital Marketplace for Notes & Books",
  "الدبلومات المهنية المتكاملة": "Integrated Professional Diplomas",
  "انضم كـ مدرس أو دكتور جامعي": "Join as Professor or University Doctor",
  "وبنوك أسئلة باحترافية كاملة": "& Complete Question Banks",
  "بنوك أسئلة وامتحانات محلولة": "Question Banks & Solved Exams",
  "نموذج 0% عمولة على المبيعات": "0% Sales Commission Model",
  "30% إلى 50% من كل عملية بيع": "30% to 50% from Every Sale",
  "شهرياً مع رسوم تحويل إضافية": "Monthly with Extra Transfer Fees",
  "شهادات صور غير قابلة للتحقق": "Unverifiable Static Image Certificates",
  "هياكل البيانات والخوارزميات": "Data Structures & Algorithms",
  "تعديل أسعار الكورسات والكتب": "Edit Course & Book Prices",
  "باقة استوديو المحاضر (SaaS)": "Instructor Studio Plan (SaaS)",
  "أكاديمية م / محمد  ابراهيم": "Eng. Mohamed Ibrahim Academy",
  "كورسات المحاضرين والدكاترة": "Instructor & Professor Courses",
  "المحادثات والدعم الأكاديمي": "Chat & Academic Support",
  "استشارة فورية عبر الواتساب": "Instant Mentorship via WhatsApp",
  "ملخصات دراسية، كتب تخصصية،": "Study Summaries, Specialized Books,",
  "حماية رقمية مشفرة 100% DRM": "100% DRM Encrypted Protection",
  "تقييم 4.9/5 من آلاف الطلاب": "4.9/5 Rating from Thousands of Students",
  "كم ستحقق من أرباح مع نموذج": "How much will you earn with the model of",
  "حماية تقليدية سهلة التسجيل": "Traditional Easily-Recorded Protection",
  "شهادات ذكية برمز QR للتحقق": "Smart Certificates with QR Verification",
  "الذكاء الاصطناعي والبيانات": "Artificial Intelligence & Data",
  "تحويلات مباشرة لحسابك 100%": "100% Direct Payouts to Your Account",
  "أحدث طلبات وتحويلات الطلاب": "Latest Student Orders & Transfers",
  "أستوديو البث المباشر (VIP)": "Live Streaming Studio (VIP)",
  "الدبلومات الشاملة المعتمدة": "Accredited Comprehensive Diplomas",
  "دبلومة هندسة الويب الشاملة": "Full-Stack Web Engineering Diploma",
  "أكاديمية م / محمد إبراهيم": "Eng. Mohamed Ibrahim Academy",
  "أكاديمية م / محمد ابراهيم": "Eng. Mohamed Ibrahim Academy",
  "المكتبة والمذكرات الرقمية": "Digital Library & Notes",
  "واتساب الدعم الفني (فوري)": "Technical Support WhatsApp (Instant)",
  "بدء اجتماع جديد (المحاضر)": "Start New Meeting (Instructor)",
  "الأعلى نمواً في سوق العمل": "Fastest Growing in the Job Market",
  "خصم استثنائي لفترة محدودة": "Special Discount for a Limited Time",
  "حفظ دائم في مكتبتك الخاصة": "Permanent Save in Your Library",
  "لا يوجد باقات خاصة للطلاب": "No Dedicated Plans for Students",
  "اسمك المعروض داخل القاعة:": "Your Display Name in the Room:",
  "المزايا التقنية للاستوديو": "Studio Technical Advantages",
  "البريد الإلكتروني للإدارة": "Administration Email",
  "تحويل بنكي مباشر آمن 100%": "100% Secure Direct Bank Wire",
  "تطبيقات الموبايل وFlutter": "Mobile Apps & Flutter",
  "مسار المدرسين والدكاترة (": "Professors & Doctors Track (",
  "استكشف المزيد من الكورسات": "Explore More Courses",
  "مكتبتي الرقمية (المذكرات)": "My Digital Library (Notes)",
  "التحويل إلى الوضع النهاري": "Switch to Day Mode",
  "نخبة من المهندسين الخبراء": "Elite Expert Engineers",
  "مشاركة شاشة وكويزات لحظية": "Screen Sharing & Instant Quizzes",
  "أعلى عائد مالي و 0% عمولة": "Highest Revenue & 0% Commission",
  "عرض تفاصيل الكورس والعرض": "View Course Details & Offer",
  "تفاصيل الدبلومة والتسجيل": "Diploma Details & Enrollment",
  "المنصات التقليدية الأخرى": "Other Traditional Platforms",
  "فوري Pay والمحافظ الذكية": "Fawry Pay & Smart E-Wallets",
  "بطاقات Visa & Mastercard": "Visa & Mastercard Cards",
  "InstaPay (إنستاباي فوري)": "InstaPay (Instant)",
  "ضمان الجودة والأمان 100%": "100% Quality & Security Guarantee",
  "الأمن السيبراني والشبكات": "Cybersecurity & Networks",
  "مسار الكورس ونوع المحاضر": "Course Track & Instructor Type",
  "إدارة المحاضرين والباقات": "Instructors & Plans Management",
  "لوحة المتابعة الأكاديمية": "Academic Tracking Dashboard",
  "التحويل إلى الوضع الليلي": "Switch to Night Mode",
  "يوماً مجاناً • 0% عمولة)": "Days Free • 0% Commission)",
  "والبنية التحتية السحابية": "Cloud Infrastructure",
  "أكاديمية م/محمد إبراهيم": "Eng. Mohamed Ibrahim Academy",
  "أكاديمية م/محمد ابراهيم": "Eng. Mohamed Ibrahim Academy",
  "كافة التخصصات والمسارات": "All Tracks & Specializations",
  "مكتبتي ومذكراتي الرقمية": "My Digital Library & Notes",
  "الشروط وسياسة الاستخدام": "Terms & Usage Policy",
  "ابدأ التعلم الآن مجاناً": "Start Learning Now for Free",
  "تفاصيل الكورس والاشتراك": "Course Details & Enrollment",
  "عبر مسارات عملية كاملة.": "through full hands-on tracks.",
  "#2 الأكثر بحثاً ورواجاً": "#2 Most Searched & Viral",
  "تصفية الكورسات المتقدمة": "Advanced Course Filters",
  "حاسبة العوائد التفاعلية": "Interactive Revenue Calculator",
  "المبلغ الذي وفرته معنا:": "Amount You Save with Us:",
  "تفعيل فوري بدون مستندات": "Instant Activation Without Documents",
  "سعر الباقة بعد التجربة:": "Plan Price After Trial:",
  "فودافون كاش & أورنج كاش": "Vodafone Cash & Orange Cash",
  "كارت ميزة الوطني المحلي": "Meeza National Local Card",
  "الفرقة الثالثة والرابعة": "Third & Fourth Year",
  "م. محمد طارق عبد العزيز": "Eng. Mohamed Tarek Abdelaziz",
  "جميع المجالات والتخصصات": "All Fields & Specializations",
  "الاسم المعتمد للشهادات:": "Verified Name for Certificates:",
  "تصفح المزيد من الكورسات": "Browse More Courses",
  "استوديو المحاضر السحابي": "Cloud Instructor Studio",
  "بث مباشر فوري (Live HD)": "Instant Live Stream (HD)",
  "أرباحك المباشرة المحققة": "Your Realized Direct Earnings",
  "الكورسات والكتب الرقمية": "Courses & Digital Books",
  "طلبات الطلاب والإيصالات": "Student Orders & Receipts",
  "غرف البث المباشر (Live)": "Live Streaming Rooms",
  "بيانات الدخول غير صحيحة": "Invalid login credentials",
  "+1,540 طالب يدرسون الآن": "+1,540 Students Studying Now",
  "انضم كـ مدرس أو دكتور (": "Join as Teacher or Doctor (",
  "اشترك كمحاضر طالب (منحة": "Join as Student Instructor (Grant",
  "مدرسين ودكاترة معتمدين": "Certified Instructors & Professors",
  "لوحة التحكم والتحليلات": "Dashboard & Analytics",
  "سياسة الخصوصية والأمان": "Privacy & Security Policy",
  "انشر مذكراتك واربح 85%": "Publish Notes & Earn 85%",
  "عبر مسارات عملية كاملة": "through full hands-on tracks",
  "إقبال هائل هذا الأسبوع": "Massive Demand This Week",
  "#3 العرض الذهبي الأقوى": "#3 Strongest Golden Deal",
  "السعر: من الأقل للأعلى": "Price: Low to High",
  "السعر: من الأعلى للأقل": "Price: High to Low",
  "سعر الاشتراك في الكورس": "Course Enrollment Price",
  "كافة الأقسام والمذكرات": "All Categories & Notes",
  "إثبات الدراسة المطلوب:": "Required Proof of Study:",
  "لطلبة الكليات والمدارس": "For University & School Students",
  "التحقق من صحة الشهادات": "Verify Certificate Validity",
  "الفرقة الأولى والثانية": "First & Second Year",
  "تطوير الويب والبرمجيات": "Web & Software Development",
  "اشتراك استوديو المحاضر": "Instructor Studio Subscription",
  "إجمالي الطلاب المسجلين": "Total Enrolled Students",
  "تتضمن 15 درساً ومحاضرة": "Includes 15 Lessons & Lectures",
  "إدارة التعليم والمحتوى": "Education & Content Management",
  "إدارة الكورسات والدروس": "Courses & Lessons Management",
  "توثيق المحاضرين الطلبة": "Student Instructor Verifications",
  "مراجعة المذكرات والكتب": "Notes & Books Review",
  "سجلات الأمان والعمليات": "Audit & Security Logs",
  "هندسة الذكاء الاصطناعي": "AI Engineering",
  "أمان وحماية بنسبة 100%": "100% Security & Protection",
  "أكاديمية محمد إبراهيم": "Eng. Mohamed Ibrahim Academy",
  "أكاديمية محمد ابراهيم": "Eng. Mohamed Ibrahim Academy",
  "بوابتك الذكية لاحتراف": "Your Smart Gateway to Mastering",
  "انضم كـ محاضر أو طالب": "Join as Instructor or Student",
  "سعر الدبلومة الشاملة:": "Comprehensive Diploma Price:",
  "الأكثر مبيعاً ورواجاً": "Best Seller & Trending",
  "شروط الانضمام كـ ناشر": "Publisher Terms of Joining",
  "تسجيل مدرس أو دكتور (": "Register Professor or Doctor (",
  "مسار المحاضر الطالب (": "Student Instructor Track (",
  "مدفوعات مؤكدة ومعتمدة": "Confirmed & Approved Payments",
  "بوابة الطالب والمتدرب": "Student & Trainee Portal",
  "الكورسات المشترك فيها": "Enrolled Courses",
  "ترقية أو تجديد الباقة": "Upgrade or Renew Plan",
  "أستوديو التدريس والبث": "Teaching & Streaming Studio",
  "تصفح الكورسات الجديدة": "Browse New Courses",
  "استوديو تدريس المحاضر": "Instructor Studio",
  "انضم كـ مدرس أو دكتور": "Join as Teacher or Doctor",
  "المهندس محمد إبراهيم": "Eng. Mohamed Ibrahim",
  "البرمجة وهندسة النظم": "Programming & Systems Engineering",
  "جميع الكورسات (الكل)": "All Courses (All)",
  "البثوث المباشرة الآن": "Live Streams Now",
  "شروحات ومناهج الطلبة": "Student Curriculums & Explanations",
  "مركز المساعدة والدعم": "Help & Support Center",
  "جميع الحقوق محفوظة ©": "All Rights Reserved ©",
  "سجل الآن في الدبلومة": "Enroll in Diploma Now",
  "نشر مذكرة جديدة الآن": "Publish New Note Now",
  "الأكثر بحثاً في 2026": "Most Searched in 2026",
  "#1 الأكثر ضجة وطلباً": "#1 Most Trending & In-Demand",
  "الأكثر طلباً ورواجاً": "Most In-Demand & Popular",
  "شامل لجميع المستويات": "All Levels Included",
  "ملخصات وشروحات مركزة": "Focused Summaries & Lectures",
  "كتب ومراجع إلكترونية": "E-Books & Academic References",
  "0% (كامل الأرباح لك)": "0% (100% Profits to You)",
  "دعم الطلبة المحاضرين": "Student Instructor Support",
  "عام للخريجين والطلاب": "General for Graduates & Students",
  "تطوير الويب والبرمجة": "Web Development & Programming",
  "يوماً مجاناً بالكامل": "Days Completely Free",
  "الكورسات المشترك بها": "Enrolled Courses",
  "متابعة المشاهدة الآن": "Continue Watching Now",
  "إعدادات المنصة (VIP)": "Platform Settings (VIP)",
  "المدفوعات والتحصيلات": "Payments & Collections",
  "نظرة عامة والتحليلات": "Overview & Analytics",
  "بيانات استلام أرباحي": "My Payout Settings",
  "أدخل اسمك أو لقبك...": "Enter your name or display name...",
  "هل نسيت كلمة المرور؟": "Forgot Password?",
  "(تقييم خريجي المنصة)": "(Platform Alumni Rating)",
  "تعلم مخصص لاحتياجاتك": "Personalized Learning for Your Needs",
  "12 مشروع إنتاج واقعي": "12 Real Production Projects",
  "سعر الاشتراك بالخصم:": "Discounted Subscription Price:",
  "منصة تعليمية معتمدة": "Certified Educational Platform",
  "سوق المذكرات والكتب": "Notes & Books Marketplace",
  "لوحة الإدارة العامة": "General Administration",
  "انضم كمحاضر أو طالب": "Join as Instructor or Student",
  "اشترك كـ محاضر طالب": "Join as Student Instructor",
  "الأكثر ضجة وإقبالاً": "Most Trending & In-Demand",
  "عروض وتخفيضات سارية": "Active Deals & Discounts",
  "دورات مدفوعة متقدمة": "Advanced Paid Courses",
  "عدد الطلاب المتوقع:": "Expected Number of Students:",
  "نسبة عمولة المبيعات": "Sales Commission Rate",
  "المستندات المطلوبة:": "Required Documents:",
  "اشتراك محاضر طالب (": "Student Instructor Plan (",
  "مرحباً بك مجدداً في": "Welcome Back to",
  "% (الأرباح لك 100%)": "% (100% Profits to You)",
  "حسابات نشطة بالمنصة": "Active Accounts on Platform",
  "الكورسات والدبلومات": "Courses & Diplomas",
  "لا توجد طلبات معلقة": "No pending requests",
  "اشتراكك السحابي نشط": "Your Cloud Subscription is Active",
  "رفع فيديوهات ومناهج": "Upload Videos & Curriculum",
  "معاينة صفحتي للطلاب": "Preview My Page for Students",
  "الرئيسية والإعدادات": "Main & Settings",
  "المستخدمون والمالية": "Users & Finance",
  "مذكراتي وكتبي (DRM)": "My Notes & Books (DRM)",
  "المالية والاشتراكات": "Finance & Subscriptions",
  "تقييم خريجي المنصة)": "(Platform Alumni Rating)",
  "منحة المحاضر الطالب": "Student Instructor Grant",
  "متابعة دقيقة لتقدمك": "Detailed Progress Tracking",
  "بناء وكلاء أذكياء (": "Building Autonomous Agents (",
  "سحب فوري بدون تأخير": "Instant Payouts Without Delay",
  "دليل جميع الكورسات": "All Courses Directory",
  "مدرس / دكتور معتمد": "Certified Instructor / Professor",
  "جميع الحقوق محفوظة": "All Rights Reserved",
  "تصفح جميع الكورسات": "Browse All Courses",
  "خصومات ذهبية حصرية": "Exclusive Golden Discounts",
  "كورسات مجانية 100%": "100% Free Courses",
  "طرق الدفع المعتمدة": "Accepted Payment Methods",
  "د. عبد الرحمن خالد": "Dr. Abdelrahman Khaled",
  "زيارة الموقع العام": "Visit Public Site",
  "منصة قمم التعليمية": "Qimam Educational Platform",
  "الطلاب والمستخدمون": "Students & Users",
  "لوحة التحكم العامة": "Main Dashboard",
  "1,540+ يدرسون الآن": "1,540+ Students Studying Now",
  "تقييم خريجي المنصة": "Platform Alumni Rating",
  "منحة ورعاية للطلاب": "Grant & Sponsorship for Students",
  "جدول مرن في أي وقت": "Flexible Schedule Anytime",
  "شهادة معتمدة بـ QR": "Accredited Certificate with QR",
  "تطبيقات الموبايل و": "Mobile Apps &",
  "المكتبة والمذكرات": "Library & Notes",
  "الدبلومات الشاملة": "Comprehensive Diplomas",
  "أستوديو البث الحي": "Live Stream Studio",
  "اشترك كمحاضر طالب": "Join as Student Instructor",
  "إعادة ضبط الفلاتر": "Reset Filters",
  "دبلومة مهنية كبرى": "Major Professional Diploma",
  "مذكرة وكتاب دراسي": "Study Note & Book",
  "متوسط سعر الكورس:": "Average Course Price:",
  "الشهادات المعتمدة": "Accredited Certificates",
  "الفترة التجريبية:": "Free Trial Period:",
  "المنحة التجريبية:": "Trial Grant:",
  "نسيت كلمة المرور؟": "Forgot Password?",
  "المسارات التخصصية": "Specialized Tracks",
  "الدورات التدريبية": "Training Courses",
  "عرض كافة العمليات": "View All Operations",
  "الكورسات المكتملة": "Completed Courses",
  "الشهادات المكتسبة": "Earned Certificates",
  "أكاديمية المحاضر:": "Instructor Academy:",
  "إنستاباي وفودافون": "InstaPay & Vodafone",
  "مبيعات ودخل مستمر": "Sales & Recurring Income",
  "مشروع إنتاج واقعي": "Real Production Projects",
  "طالبة بالأكاديمية": "Academy Student",
  "م / محمد إبراهيم": "Eng. Mohamed Ibrahim",
  "منصتنا التعليمية": "Our Educational Platform",
  "الذكاء الاصطناعي": "Artificial Intelligence",
  "كورسات المحاضرين": "Instructor Courses",
  "دوراتي التدريبية": "My Training Courses",
  "ابدأ التعلم الآن": "Start Learning Now",
  "الانضمام لمحاضرة": "Join Lecture",
  "دخول القاعة الآن": "Enter Room Now",
  "المستوى التدريبي": "Training Level",
  "محتار تبدأ منين؟": "Unsure where to start?",
  "حماية الفيديوهات": "Video Anti-Piracy Protection",
  "البطاقة الشخصية:": "National ID Card:",
  "إثبات دراسي ميسر": "Simplified Student Verification",
  "تفاعل ونقاش صوتي": "Interactive Voice Discussion",
  "رياضيات هندسية 2": "Engineering Mathematics 2",
  "إجمالي الإيرادات": "Total Revenue",
  "بانتظار المراجعة": "Pending Review",
  "درجات الاختبارات": "Quiz Scores",
  "غرفة Live Stream": "Live Stream Room",
  "نشر مذكرة / كتاب": "Publish Note / Book",
  "مراجعة الإيصالات": "Review Receipts",
  "دوراتك التدريبية": "Your Training Courses",
  "دراستي والشهادات": "My Studies & Certificates",
  "?Forgot Password": "Forgot Password?",
  "طالب بالأكاديمية": "Academy Student",
  "إنشاء حساب جديد": "Create New Account",
  "استكشف المسارات": "Explore Tracks",
  "عرض كل المسارات": "View All Tracks",
  "عمولة المبيعات:": "Sales Commission:",
  "التحصيل المالي:": "Financial Collection:",
  "اتصال مشفر وآمن": "Encrypted & Secure Connection",
  "دقة فائقة 1080p": "Ultra-High 1080p Quality",
  "أو المتابعة عبر": "Or Continue with",
  "التأهيل الوظيفي": "Career Qualification",
  "هندسة البرمجيات": "Software Engineering",
  "%) عند الاشتراك": "%) on Enrollment",
  "الطلاب المسجلين": "Enrolled Students",
  "المقرر التدريبي": "Course / Track",
  "الصفحة المستقلة": "Dedicated Page",
  "استوديو المحاضر": "Instructor Studio",
  "نسخ رابط الطلاب": "Copy Student Link",
  "إضافة كورس جديد": "Add New Course",
  "كورساتي المسجلة": "My Enrolled Courses",
  "تطوير البرمجيات": "Software Development",
  "شهادة معتمدة بـ": "Accredited Certificate with",
  "والمحافظ الذكية": "and Smart Wallets",
  "طالب الأكاديمية": "Academy Student",
  "إعدادات الحساب": "Account Settings",
  "كافة المستويات": "All Levels",
  "الأعلى تقييماً": "Highest Rated",
  "الأحدث إضافتاً": "Recently Added",
  "إقبال استثنائي": "Exceptional Demand",
  "استلام الأموال": "Money Receipt",
  "الكاميرا مفعلة": "Camera Enabled",
  "ليس لديك حساب؟": "Don't have an account?",
  "الفرقة الثانية": "Second Year",
  "مشاركة شاشة HD": "HD Screen Sharing",
  "تشفير DRM كامل": "Full DRM Encryption",
  "استلام الأرباح": "Payouts Settings",
  "إدارة الكورسات": "Manage Courses",
  "تقييمات الطلاب": "Student Reviews",
  "استكشاف المنصة": "Explore Platform",
  "الكاميرا مغلقة": "Camera Off",
  "الحساب الشخصي:": "Personal Account:",
  "جميع المستويات": "All Levels",
  "مشغل آمن ومحمي": "Secure & Protected Player",
  "إعدادات المنصة": "Platform Settings",
  "مكتبتي الرقمية": "My Digital Library",
  "بإشراف وقيادة": "Under the Supervision & Leadership of",
  "جميع الكورسات": "All Courses",
  "كورسات الطلاب": "Student Courses",
  "انضم كـ محاضر": "Join as Instructor",
  "اشترك كـ طالب": "Subscribe as Student",
  "العودة للمنصة": "Back to Platform",
  "تحميل المذكرة": "Download Notes",
  "قراءة ومعاينة": "Read & Preview",
  "معاينة وقراءة": "Preview & Read",
  "السعر والعروض": "Price & Deals",
  "الأكثر مبيعاً": "Best Seller",
  "الأحدث نزولاً": "Newest Releases",
  "يوماً مجاناً)": "Days Free)",
  "م. أحمد مصطفى": "Eng. Ahmed Mostafa",
  "بدء البث الآن": "Start Stream Now",
  "باقة SaaS Pro": "SaaS Pro Plan",
  "تعديل المنهاج": "Edit Curriculum",
  "دورات تدريبية": "Training Courses",
  "درساً ومحاضرة": "Lessons & Lectures",
  "كوبونات الخصم": "Discount Coupons",
  "الحساب والدعم": "Account & Support",
  "تفاصيل الكورس": "Course Details",
  "بث مباشر 1080": "1080p Live Stream",
  "مميزات منظومة": "Platform Ecosystem Features",
  "إنستاباي فوري": "Instant InstaPay",
  "الحساب الشخصي": "My Account",
  "البث المباشر": "Live Stream",
  "الملف الشخصي": "Profile",
  "انضم كـ طالب": "Join as Student",
  "تسجيل الدخول": "Sign In",
  "تسجيل الخروج": "Sign Out",
  "عرض التفاصيل": "View Details",
  "جميع الأسعار": "All Prices",
  "شهادة معتمدة": "Accredited Certificate",
  "تصنيف المجال": "Field Category",
  "متاح أونلاين": "Available Online",
  "المشرف العام": "Super Admin",
  "+ إضافة كورس": "+ Add Course",
  "طلبات الطلاب": "Student Orders",
  "المايك مكتوم": "Mic Muted",
  "ساعة تدريبية": "Training Hours",
  "يوماً مجاناً": "Days Free",
  "خصم استثنائي": "Special Discount",
  "لفترة محدودة": "for a Limited Time",
  "تبديل المظهر": "Toggle Theme",
  "لوحة التحكم": "Dashboard",
  "الدعم الفني": "Technical Support",
  "روابط سريعة": "Quick Links",
  "انضم كمحاضر": "Join as Instructor",
  "دخول المنصة": "Enter Platform",
  "المايك مفعل": "Microphone Enabled",
  "كلمة المرور": "Password",
  "وسيلة الدفع": "Payment Method",
  "ترقية/تجديد": "Upgrade/Renew",
  "فتح القائمة": "Open Menu",
  "فودافون كاش": "Vodafone Cash",
  "محاضر معتمد": "Certified Instructor",
  "+1,540 طالب": "+1,540 Students",
  "يدرسون الآن": "Studying Now",
  "هندسة النظم": "Systems Engineering",
  "علوم الحاسب": "Computer Science",
  "مكثف ومباشر": "Intensive & Live",
  "تبديل اللغة": "Switch Language",
  "تواصل معنا": "Contact Us",
  "إنشاء حساب": "Create Account",
  "تسجيل خروج": "Logout",
  "اشترك الآن": "Subscribe Now",
  "قراءة الآن": "Read Now",
  "تدريب مكثف": "Intensive Training",
  "كتب ومراجع": "Books & References",
  "طالب اشترى": "Students Enrolled",
  "ج.م شهرياً": "EGP / month",
  "مرحباً بك،": "Welcome,",
  "إضافة كورس": "Add Course",
  "الاختبارات": "Quizzes",
  "كوبون 100%": "100% Coupon",
  "مسار معتمد": "Accredited Track",
  "الإعدادات": "Settings",
  "المحادثات": "Conversations",
  "بنك أسئلة": "Question Bank",
  "رقم الطلب": "Order #",
  "نشر مذكرة": "Publish Note",
  "كوبون نشط": "Active Coupons",
  "الملاحظات": "Notes",
  "جديد 2026": "New 2026",
  "أورنج كاش": "Orange Cash",
  "الرئيسية": "Home",
  "سجل الآن": "Enroll Now",
  "الأقسام:": "Sections:",
  "% عمولة؟": "% Commission?",
  "دعم فوري": "Instant Support",
  "المحاضر:": "Instructor:",
  "وفودافون": "& Vodafone",
  "الشهادات": "Certificates",
  "الواجبات": "Assignments",
  "إنستاباي": "InstaPay",
  "خروج آمن": "Secure Logout",
  "المتقدمة": "Advanced",
  "0% عمولة": "0% Commission",
  "كورساتي": "My Courses",
  "الشاملة": "Comprehensive",
  "تجربببه": "Practical Production Projects",
  "سسسسسسس": "Comprehensive Practical Track",
  "دورات):": "Courses):",
  "التاريخ": "Date",
  "المحاضر": "Instructor",
  "المناهج": "Curriculums",
  "50% وفر": "Save 50%",
  "أهم قسم": "Top Section",
  "واتساب": "WhatsApp",
  "معاينة": "Preview",
  "ملخصات": "Summaries",
  "الميزة": "Feature",
  "مجاناً": "Free",
  "مجانية": "Free",
  "مدفوعة": "Paid",
  "دبلومة": "Diploma",
  "حمصصصص": "Homos (Demo)",
  "البرنس": "The Prince (Demo)",
  "الطالب": "Student",
  "المبلغ": "Amount",
  "الحالة": "Status",
  "فبراير": "February",
  "سبتمبر": "September",
  "أكتوبر": "October",
  "نوفمبر": "November",
  "ديسمبر": "December",
  "للطلاب": "for Students",
  "محاضرة": "Lectures",
  "تجريبي": "Trial",
  "السعر:": "Price:",
  "متكامل": "Integrated",
  "بطاقات": "Cards",
  "حسابي": "My Account",
  "قراءة": "Read",
  "صفحات": "Pages",
  "وحدات": "Units",
  "ساعات": "Hours",
  "دولار": "USD",
  "دبلوم": "Diploma",
  "مبتدئ": "Beginner",
  "متوسط": "Intermediate",
  "متقدم": "Advanced",
  "معتمد": "Approved",
  "مرفوض": "Rejected",
  "يناير": "January",
  "أبريل": "April",
  "يونيو": "June",
  "يوليو": "July",
  "أغسطس": "August",
  "إنجاز": "Progress",
  "مشترك": "Enrolled",
  "مقبول": "Approved",
  "متبقي": "remaining",
  "يوماً": "days",
  "درساً": "Lessons",
  "تشفير": "Encryption",
  "عمولة": "Commission",
  "إغلاق": "Close",
  "محاضر": "Instructor",
  "شراء": "Buy",
  "الكل": "All",
  "طالب": "Student",
  "صفحة": "Pages",
  "دروس": "Lessons",
  "ساعة": "Hours",
  "جنيه": "EGP",
  "دورة": "Course",
  "شامل": "Comprehensive",
  "معلق": "Pending",
  "ناجح": "Passed",
  "راسب": "Failed",
  "فارس": "Faris (Demo)",
  "مبدع": "Creative (Demo)",
  "مارس": "March",
  "مايو": "May",
  "أيام": "days",
  "منحة": "Grant",
  "جديد": "New",
  "فوري": "Fawry",
  "مشرف": "Admin",
  "درس": "Lessons",
  "ج.م": "EGP",
  "وفر": "Save",
  "خصم": "Discount",
  "عرض": "View",
  "نشط": "Active",
  "عبر": "Across",
  "يوم": "days",
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const originalTexts = useRef<WeakMap<Node, string>>(new WeakMap());
  const originalAttrs = useRef<WeakMap<Element, Record<string, string>>>(new WeakMap());
  const clientCache = useRef<Map<string, string>>(new Map());

  // Precompiled multi-word phrases and single-word regexes
  const multiWordEntries = useRef<Array<[string, string]>>([]);
  const singleWordEntries = useRef<Array<[string, string, RegExp]>>([]);

  // Initialize client cache and precompiled lookups from DICTIONARY
  useEffect(() => {
    const multi: Array<[string, string]> = [];
    const single: Array<[string, string, RegExp]> = [];

    Object.entries(DICTIONARY).forEach(([ar, en]) => {
      const trimmed = ar.trim();
      clientCache.current.set(trimmed, en);
      if (trimmed.includes(' ')) {
        multi.push([trimmed, en]);
      } else {
        const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![\\u0600-\\u06FF\\w])${escaped}(?![\\u0600-\\u06FF\\w])`, 'gu');
        single.push([trimmed, en, regex]);
      }
    });

    multi.sort((a, b) => b[0].length - a[0].length);
    single.sort((a, b) => b[0].length - a[0].length);

    multiWordEntries.current = multi;
    singleWordEntries.current = single;
  }, []);

  // Safe string translation helper
  const translateString = useCallback((text: string): string => {
    if (!text || !/[\u0600-\u06FF]/.test(text)) return text;

    const trimmed = text.trim();
    const normalized = trimmed.replace(/\s+/g, ' ');

    if (clientCache.current.has(trimmed)) {
      return text.replace(trimmed, clientCache.current.get(trimmed)!);
    }
    if (clientCache.current.has(normalized)) {
      return text.replace(trimmed, clientCache.current.get(normalized)!);
    }

    // Convert Eastern Arabic numerals and separators
    let result = text
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/٬/g, ',')
      .replace(/٫/g, '.');

    const trimmedNum = result.trim();
    if (clientCache.current.has(trimmedNum)) {
      return result.replace(trimmedNum, clientCache.current.get(trimmedNum)!);
    }

    // Multi-word phrase matching (sorted longest to shortest)
    for (const [ar, en] of multiWordEntries.current) {
      if (result.includes(ar)) {
        result = result.replaceAll(ar, en);
      }
    }

    // Single-word matching with strict Arabic boundaries (prevents partial word corruption)
    for (const [ar, en, regex] of singleWordEntries.current) {
      if (result.includes(ar)) {
        result = result.replace(regex, en);
      }
    }

    return result;
  }, []);

  // Core DOM Translator - 0ms local dictionary match
  const translateDOM = useCallback(() => {
    if (typeof document === 'undefined') return;

    // 1. Text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code', 'pre'].includes(tag)) return NodeFilter.FILTER_REJECT;

          if (/[\u0600-\u06FF]/.test(node.textContent)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      }
    );

    const nodesToTranslate: Array<{ node: Node; text: string }> = [];
    let currentNode = walker.nextNode();

    while (currentNode) {
      const text = currentNode.textContent || '';
      if (!originalTexts.current.has(currentNode)) {
        originalTexts.current.set(currentNode, text);
      }
      nodesToTranslate.push({ node: currentNode, text });
      currentNode = walker.nextNode();
    }

    for (const { node, text } of nodesToTranslate) {
      const translated = translateString(text);
      if (translated !== text && node.textContent !== translated) {
        node.textContent = translated;
      }
    }

    // 2. Element attributes (placeholders, titles, aria-labels)
    const elementsWithAttrs = document.querySelectorAll<HTMLElement>(
      'input[placeholder], textarea[placeholder], img[alt], [title], [aria-label]'
    );

    elementsWithAttrs.forEach((el) => {
      let saved = originalAttrs.current.get(el);
      if (!saved) {
        saved = {};
        originalAttrs.current.set(el, saved);
      }

      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        if (el.hasAttribute(attr)) {
          const val = el.getAttribute(attr) || '';
          if (/[\u0600-\u06FF]/.test(val)) {
            if (saved[attr] === undefined) {
              saved[attr] = val;
            }
            const trans = translateString(val);
            if (trans !== val) {
              el.setAttribute(attr, trans);
            }
          }
        }
      });
    });
  }, [translateString]);

  // Restore DOM back to 100% Arabic
  const restoreDOM = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Restore text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (originalTexts.current.has(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      const original = originalTexts.current.get(currentNode);
      if (original !== undefined && currentNode.textContent !== original) {
        currentNode.textContent = original;
      }
      currentNode = walker.nextNode();
    }

    // Restore attributes
    const elementsWithAttrs = document.querySelectorAll<HTMLElement>(
      'input[placeholder], textarea[placeholder], img[alt], [title], [aria-label]'
    );
    elementsWithAttrs.forEach((el) => {
      const saved = originalAttrs.current.get(el);
      if (saved) {
        Object.entries(saved).forEach(([attr, originalVal]) => {
          if (el.getAttribute(attr) !== originalVal) {
            el.setAttribute(attr, originalVal);
          }
        });
      }
    });
  }, []);

  // Apply Language HTML attributes & DOM changes
  const applyLanguage = useCallback((newLang: Lang) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const body = document.body;

    html.setAttribute('lang', newLang);
    html.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    if (body) {
      body.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    }

    if (newLang === 'en') {
      html.classList.add('lang-en');
      html.classList.remove('lang-ar');
    } else {
      html.classList.add('lang-ar');
      html.classList.remove('lang-en');
    }

    try {
      localStorage.setItem('qimam_lang', newLang);
      window.dispatchEvent(new CustomEvent('platform-language-changed', { detail: { lang: newLang } }));
    } catch (e) {}

    if (newLang === 'en') {
      setTimeout(translateDOM, 30);
    } else {
      restoreDOM();
    }
  }, [translateDOM, restoreDOM]);

  // Initialize from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('qimam_lang') as Lang;
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved);
        applyLanguage(saved);
      } else {
        applyLanguage('ar');
      }
    } catch (e) {
      applyLanguage('ar');
    }
  }, [applyLanguage]);

  // Translate on route changes if in English
  useEffect(() => {
    if (mounted && lang === 'en') {
      const timer = setTimeout(translateDOM, 120);
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted, lang, translateDOM]);

  // Dynamic MutationObserver for newly rendered DOM nodes
  useEffect(() => {
    if (!mounted || lang !== 'en') return;

    let debounceTimer: NodeJS.Timeout | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        translateDOM();
      }, 60);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [mounted, lang, translateDOM]);

  const setLang = (l: Lang) => {
    setLangState(l);
    applyLanguage(l);
  };

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
  };

  const t = (arText: string, enFallback?: string): string => {
    if (lang === 'ar') return arText;
    if (enFallback) return enFallback;
    return clientCache.current.get(arText.trim()) || DICTIONARY[arText.trim()] || translateString(arText);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

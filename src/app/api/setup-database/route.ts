import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'هذا الإجراء معطل تماماً في بيئة الإنتاج' }, { status: 403 });
  }

  const setupKey = req.headers.get('x-setup-key');
  const user = await getCurrentUser();
  const isAuthorized = (user && user.role === 'ADMIN') || (process.env.SETUP_KEY && setupKey === process.env.SETUP_KEY);

  if (!isAuthorized) {
    return NextResponse.json({ error: 'غير مصرح: يتطلب صلاحيات المدير' }, { status: 403 });
  }

  return await seedDatabase();
}

export async function POST(req: Request) {
  return GET(req);
}

async function seedDatabase() {
  try {
    const adminPass = await bcrypt.hash('admin', 10);
    const instPass = await bcrypt.hash('instructor', 10);
    const studPass = await bcrypt.hash('student', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@qimam.edu' },
      update: {
        officialFullName: 'د. عبد الرحمن خالد محمد السيد',
        role: 'ADMIN',
        isEmailVerified: true,
      },
      create: {
        email: 'admin@qimam.edu',
        passwordHash: adminPass,
        role: 'ADMIN',
        firstName: 'عبد الرحمن',
        fatherName: 'خالد',
        lastName: 'السيد',
        officialFullName: 'د. عبد الرحمن خالد محمد السيد',
        username: 'admin',
        phone: '+201001234567',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'مدير المنصة وخبير تكنولوجيا التعليم وتطوير النظم السحابية',
        isEmailVerified: true,
      },
    });

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@qimam.edu' },
      update: {
        officialFullName: 'م. محمد إبراهيم عبد العزيز',
        role: 'INSTRUCTOR',
        isEmailVerified: true,
      },
      create: {
        email: 'instructor@qimam.edu',
        passwordHash: instPass,
        role: 'INSTRUCTOR',
        firstName: 'محمد',
        fatherName: 'إبراهيم',
        lastName: 'عبد العزيز',
        officialFullName: 'م. محمد إبراهيم عبد العزيز',
        username: 'mohamed_ibrahim',
        phone: '+201555791568',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'مهندس برمجيات أول ومحاضر معتمد بخبرة أكثر من 10 سنوات في تطوير أنظمة الويب والذكاء الاصطناعي',
        isEmailVerified: true,
      },
    });

    const student = await prisma.user.upsert({
      where: { email: 'student@qimam.edu' },
      update: {
        role: 'STUDENT',
        isEmailVerified: true,
      },
      create: {
        email: 'student@qimam.edu',
        passwordHash: studPass,
        role: 'STUDENT',
        firstName: 'أحمد',
        fatherName: 'مصطفى',
        lastName: 'إبراهيم',
        officialFullName: 'أحمد مصطفى كامل إبراهيم',
        username: 'student',
        phone: '+201205551234',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        bio: 'طالب شغوف بتعلم أحدث تقنيات الويب والذكاء الاصطناعي',
        isEmailVerified: true,
      },
    });

    const settings = [
      { key: 'PLATFORM_NAME', value: 'أكاديمية م / محمد إبراهيم' },
      { key: 'PLATFORM_TAGLINE', value: 'بوابتك الذكية لاحتراف البرمجة وهندسة النظم والذكاء الاصطناعي' },
      { key: 'HERO_TITLE', value: 'بوابتك الذكية لاحتراف' },
      { key: 'HERO_TITLE_HIGHLIGHT', value: 'البرمجة وهندسة النظم والذكاء الاصطناعي' },
      { key: 'HERO_SUBTITLE', value: 'أكاديمية م / محمد إبراهيم — مسارات تدريبية هندسية متكاملة، دبلومات برمجية معتمدة، ومشاريع إنتاج واقعية تؤهلك لسوق العمل بثقة واحتراف.' },
      { key: 'WHATSAPP_NUMBER', value: '01555791568' },
      { key: 'CONTACT_WHATSAPP', value: '01555791568' },
      { key: 'CONTACT_PHONE', value: '01555791568' },
      { key: 'CONTACT_EMAIL', value: 'support@mohamedibrahim.academy' },
      { key: 'SOCIAL_TELEGRAM', value: 'https://t.me/mohamed_academy' },
      { key: 'SOCIAL_FACEBOOK', value: 'https://facebook.com/mohamed.academy' },
      { key: 'BANNER_ENABLED', value: 'true' },
      { key: 'BANNER_TEXT', value: 'خصم استثنائي 50% لفترة محدودة على جميع المسارات والدبلومات الهندسية' },
      { key: 'HERO_BADGE', value: 'جديد!' },
      { key: 'FEATURED_DIPLOMA_BADGE', value: 'الدبلومة الأكثر طلباً في سوق العمل' },
      { key: 'NOTES_MARKETPLACE_BADGE', value: 'سوق المذكرات والكتب (خصم 50% ومعاينة)' },
      { key: 'INSTRUCTOR_JOIN_BADGE', value: 'انضم كـ مدرس أو دكتور (14 يوماً مجاناً - 0% عمولة)' },
      { key: 'STUDENT_INSTRUCTOR_BADGE', value: 'اشترك كمحاضر طالب (منحة 16 يوماً مجاناً)' },
    ];

    for (const s of settings) {
      await prisma.platformSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, description: s.key },
      });
    }

    const catWeb = await prisma.category.upsert({
      where: { slug: 'web-development' },
      update: { name: 'تطوير الويب والبرمجيات' },
      create: {
        name: 'تطوير الويب والبرمجيات',
        slug: 'web-development',
        icon: 'Code2',
        description: 'تعلم أحدث أطر العمل مثل Next.js, React, Node.js و TypeScript لبناء تطبيقات ويب حديثة ومتكاملة.',
        orderIndex: 1,
      },
    });

    const catAI = await prisma.category.upsert({
      where: { slug: 'ai-data-science' },
      update: { name: 'الذكاء الاصطناعي والبيانات' },
      create: {
        name: 'الذكاء الاصطناعي والبيانات',
        slug: 'ai-data-science',
        icon: 'BrainCircuit',
        description: 'دورات عملية في نماذج الذكاء الاصطناعي التوليدي، معالجة اللغات الطبيعية، وهندسة الأوامر.',
        orderIndex: 2,
      },
    });

    const catUI = await prisma.category.upsert({
      where: { slug: 'ui-ux-design' },
      update: { name: 'التصميم وتجربة المستخدم UI/UX' },
      create: {
        name: 'التصميم وتجربة المستخدم UI/UX',
        slug: 'ui-ux-design',
        icon: 'Palette',
        description: 'احتراف تصميم واجهات المستخدم والأنظمة التصميمية في Figma.',
        orderIndex: 3,
      },
    });

    const coursesData = [
      {
        title: 'دبلوم تطوير تطبيقات الويب الشاملة بـ Next.js و TypeScript',
        slug: 'fullstack-nextjs-typescript',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
        shortDescription: 'احترف بناء تطبيقات الويب الحديثة والآمنة من الصفر حتى الإطلاق على بيئة الإنتاج السحابية.',
        description: 'دورة تدريبية مكثفة تغطي كل ما تحتاجه لتصبح مهندس برمجيات Full-Stack محترف مع Next.js و TypeScript وقواعد البيانات وبوابات الدفع.',
        categoryId: catWeb.id,
        level: 'INTERMEDIATE',
        durationHours: 35,
        price: 1200,
        compareAtPrice: 2400,
        requirements: JSON.stringify(['أساسيات JavaScript و HTML/CSS', 'جهاز حاسوب متصل بالإنترنت']),
        learningObjectives: JSON.stringify([
          'إتقان Next.js 14+ و Server Components و Server Actions',
          'بناء أنظمة التوثيق والحماية وقواعد البيانات باستخدام Prisma',
          'دمج بوابات الدفع الإلكتروني والتحويلات اليدوية InstaPay و Vodafone Cash'
        ]),
        instructorId: instructor.id,
        status: 'PUBLISHED',
        completionThresholdPercent: 80,
        hasFinalExam: true,
        certificateEnabled: true,
      },
      {
        title: 'احتراف الذكاء الاصطناعي التوليدي وبناء وكلاء AI Agents',
        slug: 'mastering-generative-ai-agents',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
        shortDescription: 'دليل عملي لبناء أنظمة الذكاء الاصطناعي، نماذج LLM، وربطها بقواعد البيانات وتطبيقات الويب.',
        description: 'تعلم كيفية هندسة الأوامر المتقدمة، بناء أدوات RAG، واستخدام مكتبات LangChain و OpenAI و Gemini لبناء روبوتات دردشة ذكية ومساعدين ذاتيي التصرف.',
        categoryId: catAI.id,
        level: 'ADVANCED',
        durationHours: 28,
        price: 1500,
        compareAtPrice: 3000,
        requirements: JSON.stringify(['معرفة بأساسيات لغة Python أو JavaScript', 'حساب OpenAI أو Google AI Studio']),
        learningObjectives: JSON.stringify([
          'فهم بنية النماذج اللغوية الضخمة LLMs وكيفية ضبطها',
          'بناء أنظمة بحث دلالي ومعالجة مستندات Vector Databases',
          'نشر وكلاء ذكاء اصطناعي حقيقيين يخدمون المستخدمين ويوفرون تكاليف العمليات'
        ]),
        instructorId: instructor.id,
        status: 'PUBLISHED',
        completionThresholdPercent: 85,
        hasFinalExam: true,
        certificateEnabled: true,
      },
      {
        title: 'تصميم واجهات وتجربة المستخدم الاحترافية في Figma من الصفر',
        slug: 'ui-ux-design-figma-mastery',
        thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523c932deda?w=800',
        shortDescription: 'صمم واجهات عصرية وأنظمة تصميم Design Systems متكاملة جاهزة للتسليم للمطورين.',
        description: 'من المبادئ النفسية لتجربة المستخدم وحتى بناء البروتوتايب التفاعلي المعقد والمتجاوب مع كافة مقاسات الشاشات وفق معايير الشركات العالمية.',
        categoryId: catUI.id,
        level: 'BEGINNER',
        durationHours: 20,
        price: 800,
        compareAtPrice: 1600,
        requirements: JSON.stringify(['شغف بالتصميم ولا تشترط أي خبرة سابقة']),
        learningObjectives: JSON.stringify([
          'فهم نظريات الألوان، الخطوط والمسافات البصرية',
          'إتقان Auto Layout والمكونات المتقدمة في Figma',
          'إعداد ملفات تسليم المطورين Developer Handoff باحترافية'
        ]),
        instructorId: instructor.id,
        status: 'PUBLISHED',
        completionThresholdPercent: 75,
        hasFinalExam: false,
        certificateEnabled: true,
      },
    ];

    for (const c of coursesData) {
      const course = await prisma.course.upsert({
        where: { slug: c.slug },
        update: {
          title: c.title,
          status: 'PUBLISHED',
          price: c.price,
          compareAtPrice: c.compareAtPrice,
        },
        create: c,
      });

      const section = await prisma.section.upsert({
        where: { id: 'sec-' + course.id + '-1' },
        update: { title: 'الوحدة الأولى: المفاهيم الأساسية والمدخل الشامل' },
        create: {
          id: 'sec-' + course.id + '-1',
          courseId: course.id,
          title: 'الوحدة الأولى: المفاهيم الأساسية والمدخل الشامل',
          orderIndex: 1,
        },
      });

      await prisma.lesson.upsert({
        where: { id: 'les-' + course.id + '-1' },
        update: { title: '1. مقدمة شاملة وخارطة الطريق في ' + course.title },
        create: {
          id: 'les-' + course.id + '-1',
          sectionId: section.id,
          title: '1. مقدمة شاملة وخارطة الطريق في ' + course.title,
          slug: 'intro-' + course.slug,
          description: 'نظرة عامة على محاور المسار وكيفية الاستفادة القصوى من التطبيقات العملية والمشاريع.',
          durationMinutes: 20,
          orderIndex: 1,
          isFreePreview: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          videoDurationSeconds: 1200,
          videoProvider: 'DIRECT',
        },
      });
    }

    await prisma.diploma.upsert({
      where: { slug: 'fullstack-ai-engineering-diploma' },
      update: {
        title: 'الدبلومة الهندسية الشاملة: Full-Stack & AI Engineering',
        status: 'PUBLISHED',
      },
      create: {
        title: 'الدبلومة الهندسية الشاملة: Full-Stack & AI Engineering',
        slug: 'fullstack-ai-engineering-diploma',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        shortDescription: 'المسار التدريبي الأقوى لدمج هندسة البرمجيات الكاملة مع نماذج الذكاء الاصطناعي التطبيقي.',
        description: 'دبلومة متكاملة تأخذك من مرحلة الأساسيات حتى تصبح قادراً على بناء وإطلاق أنظمة سحابية كاملة ودمج تقنيات الـ AI والـ LLMs وإدارة قواعد البيانات باحترافية.',
        categoryId: catWeb.id,
        price: 2500,
        compareAtPrice: 5000,
        durationHours: 85,
        status: 'PUBLISHED',
      },
    });

    const sampleBooks = [
      {
        title: 'الملخص الذهبي الشامل في هندسة البرمجيات وتصميم النظم',
        slug: 'software-engineering-golden-summary',
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'ملخص مكثف وعالي الجودة يشمل أهم المفاهيم الهندسية، أنماط التصميم (Design Patterns)، ومبادئ SOLID مع أمثلة عملية ورسومات توضيحية تسهل الفهم والمراجعة قبل الامتحانات والمقابلات التقنية.',
        shortDescription: 'ملخص شامل لهندسة البرمجيات وأنماط التصميم مع أمثلة محلولة.',
        pageCount: 45,
        previewPagesCount: 4,
        price: 45,
        compareAtPrice: 85,
        isFree: false,
        authorName: 'م / محمد إبراهيم',
        academicSubject: 'هندسة البرمجيات',
        academicLevel: 'الفرقة الثالثة والرابعة',
        category: 'ملخصات',
        instructorId: instructor.id,
        salesCount: 128,
        viewsCount: 1420,
        rating: 4.9,
      },
      {
        title: 'بنك أسئلة واختبارات هياكل البيانات والخوارزميات (محلول بالكامل)',
        slug: 'dsa-solved-exams-bank',
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'أكثر من 150 مسألة وسؤال امتحانات جامعية ومقابلات شركات كبرى في هياكل البيانات (Arrays, Trees, Graphs, DP) مع الشرح والحل البرمجي خطوة بخطوة بالـ C++ و Python.',
        shortDescription: '150 مسألة امتحانات في الخوارزميات وهياكل البيانات مع الحلول النموذجية.',
        pageCount: 68,
        previewPagesCount: 5,
        price: 60,
        compareAtPrice: 110,
        isFree: false,
        authorName: 'م / محمد إبراهيم',
        academicSubject: 'هياكل البيانات والخوارزميات',
        academicLevel: 'الفرقة الثانية',
        category: 'بنك أسئلة',
        instructorId: instructor.id,
        salesCount: 215,
        viewsCount: 2890,
        rating: 5.0,
      },
      {
        title: 'الدليل العملي لاحتراف تطوير واجهات الويب (React & Next.js 14)',
        slug: 'react-nextjs-handbook',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'مرجع كامل وعصري يشرح بناء التطبيقات من الصفر حتى النشر، إدارة الحالة، تحسين محركات البحث SEO، والأمان، مع مشروع متجر إلكتروني تطبيقي متكامل.',
        shortDescription: 'دليل شامل لاحتراف أحدث تقنيات React و Next.js 14 بمشاريع إنتاجية.',
        pageCount: 92,
        previewPagesCount: 6,
        price: 75,
        compareAtPrice: 150,
        isFree: false,
        authorName: 'م / محمد إبراهيم',
        academicSubject: 'تطوير الويب والبرمجة',
        academicLevel: 'كافة المستويات',
        category: 'كتب ومراجع',
        instructorId: instructor.id,
        salesCount: 340,
        viewsCount: 4100,
        rating: 4.95,
      },
      {
        title: 'ملخص مهارات مقابلات البرمجة والـ Problem Solving (مجاني)',
        slug: 'free-coding-interview-cheatsheet',
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'ورقة مفاهيم مجانية تلخص أهم التكتيكات البرمجية، تحليل التعقيد الزمني والمكاني Big-O، والأنماط المتكررة في مقابلات كبرى شركات التكنولوجيا.',
        shortDescription: 'دليل سريع ومجاني للتحضير لمقابلات العمل التقنية والمسائل البرمجية.',
        pageCount: 15,
        previewPagesCount: 15,
        price: 0,
        compareAtPrice: 50,
        isFree: true,
        authorName: 'م / محمد إبراهيم',
        academicSubject: 'تطوير مهني ومقابلات',
        academicLevel: 'للجميع',
        category: 'ملخصات',
        instructorId: instructor.id,
        salesCount: 520,
        viewsCount: 6800,
        rating: 4.98,
      },
    ];

    for (const b of sampleBooks) {
      await prisma.digitalBook.upsert({
        where: { slug: b.slug },
        update: {
          title: b.title,
          status: 'PUBLISHED',
          price: b.price,
          compareAtPrice: b.compareAtPrice,
        },
        create: {
          ...b,
          status: 'PUBLISHED',
        },
      });
    }

    const firstCourse = await prisma.course.findFirst({ where: { status: 'PUBLISHED' } });
    if (firstCourse) {
      try {
        await prisma.review.create({
          data: {
            courseId: firstCourse.id,
            userId: student.id,
            rating: 5,
            comment: 'شرح ممتاز وتطبيق عملي حقيقي نقل مستواي البرمجي بشكل ملحوظ! أنصح به بشدة.',
            isApproved: true,
          },
        });
      } catch (e) {}
    }

    const [userCount, courseCount, diplomaCount, bookCount, categoryCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.diploma.count(),
      prisma.digitalBook.count(),
      prisma.category.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة وملء قاعدة البيانات بنجاح بكل الكورسات والمذكرات والدبلومات وحسابات الإدارة!',
      counts: {
        users: userCount,
        courses: courseCount,
        diplomas: diplomaCount,
        books: bookCount,
        categories: categoryCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error during database setup:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

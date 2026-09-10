const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking Qimam Academy Database seed state...');
  
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already initialized. Updating platform WhatsApp contact settings without wiping data...');
      await prisma.platformSetting.upsert({
        where: { key: 'WHATSAPP_NUMBER' },
        create: { key: 'WHATSAPP_NUMBER', value: '01555791568', description: 'رقم الواتساب للتواصل والطلب الفوري' },
        update: { value: '01555791568' }
      });
      await prisma.platformSetting.upsert({
        where: { key: 'CONTACT_WHATSAPP' },
        create: { key: 'CONTACT_WHATSAPP', value: '01555791568', description: 'رقم الواتساب للدعم الفوري' },
        update: { value: '01555791568' }
      });
      await prisma.platformSetting.upsert({
        where: { key: 'CONTACT_PHONE' },
        create: { key: 'CONTACT_PHONE', value: '01555791568', description: 'رقم الهاتف المباشر' },
        update: { value: '01555791568' }
      });
      return;
    }
  } catch (e) {
    console.warn('Could not check user count, proceeding with seed:', e.message);
  }

  console.log('Seeding Qimam Academy Database for first-time setup...');
  
  const models = [
    'auditLog', 'emailLog', 'notification', 'ticketMessage', 'supportTicket',
    'chatMessage', 'conversation', 'certificate', 'certificateTemplate',
    'manualAccessGrant', 'couponUsage', 'coupon', 'payment', 'order',
    'review', 'wishlist', 'studentBookmark', 'studentNote', 'lessonProgress',
    'enrollment', 'quizAttempt', 'question', 'quiz', 'lessonSummary',
    'lesson', 'section', 'diplomaCourse', 'diploma', 'course', 'category',
    'parentContact', 'userSession', 'user', 'socialLink', 'platformSetting'
  ];
  
  for (const m of models) {
    if (prisma[m]) {
      try {
        await prisma[m].deleteMany();
      } catch (e) {}
    }
  }

  const adminPass = await bcrypt.hash('admin', 10);
  const instPass = await bcrypt.hash('instructor', 10);
  const studPass = await bcrypt.hash('student', 10);

  const admin = await prisma.user.create({
    data: {
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
      isEmailVerified: true
    }
  });

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@qimam.edu',
      passwordHash: instPass,
      role: 'INSTRUCTOR',
      firstName: 'محمد',
      fatherName: 'طارق',
      lastName: 'عبد العزيز',
      officialFullName: 'م. محمد طارق محمود عبد العزيز',
      username: 'instructor',
      phone: '+201109876543',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'مهندس برمجيات أول ومحاضر معتمد بخبرة أكثر من 10 سنوات',
      isEmailVerified: true
    }
  });

  const student = await prisma.user.create({
    data: {
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
      parentNotificationEnabled: true
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'sara@qimam.edu',
      passwordHash: studPass,
      role: 'STUDENT',
      firstName: 'سارة',
      fatherName: 'محمود',
      lastName: 'علي',
      officialFullName: 'سارة محمود حسن علي',
      username: 'sara_ali',
      phone: '+201509998877',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'مهندسة برمجيات طموحة متخصصة في تجربة المستخدم',
      isEmailVerified: true
    }
  });

  await prisma.parentContact.create({
    data: {
      userId: student.id,
      parentName: 'مصطفى كامل إبراهيم',
      parentEmail: 'parent.mostafa@gmail.com',
      relationship: 'Father',
      isVerified: true
    }
  });

  const catWeb = await prisma.category.create({
    data: {
      name: 'تطوير الويب والبرمجيات',
      slug: 'web-development',
      icon: 'Code2',
      description: 'تعلم أحدث أطر العمل مثل Next.js, React, Node.js و TypeScript لبناء تطبيقات ويب حديثة ومتكاملة.',
      orderIndex: 1
    }
  });

  const catAI = await prisma.category.create({
    data: {
      name: 'الذكاء الاصطناعي والبيانات',
      slug: 'ai-data-science',
      icon: 'BrainCircuit',
      description: 'دورات عملية في نماذج الذكاء الاصطناعي التوليدي، معالجة اللغات الطبيعية، وهندسة الأوامر.',
      orderIndex: 2
    }
  });

  const catUI = await prisma.category.create({
    data: {
      name: 'التصميم وتجربة المستخدم UI/UX',
      slug: 'ui-ux-design',
      icon: 'Palette',
      description: 'احتراف تصميم واجهات المستخدم والأنظمة التصميمية في Figma.',
      orderIndex: 3
    }
  });

  const course1 = await prisma.course.create({
    data: {
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
      certificateEnabled: true
    }
  });

  const sec1 = await prisma.section.create({
    data: {
      courseId: course1.id,
      title: 'الوحدة الأولى: البنية المعمارية وإعداد بيئة التطوير الحديثة',
      orderIndex: 1
    }
  });

  const sec2 = await prisma.section.create({
    data: {
      courseId: course1.id,
      title: 'الوحدة الثانية: معمارية الخادم وقواعد البيانات والـ ORM',
      orderIndex: 2
    }
  });

  const lesson1_1 = await prisma.lesson.create({
    data: {
      sectionId: sec1.id,
      title: '1. مقدمة في معمارية Next.js App Router و Server Components',
      slug: 'intro-to-nextjs-app-router',
      description: 'شرح مفصل لكيفية عمل معمارية المكونات من جانب الخادم والعميل وأهم الفروقات في الأداء.',
      durationMinutes: 18,
      orderIndex: 1,
      isFreePreview: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDurationSeconds: 1080,
      videoProvider: 'DIRECT',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      resourcesJson: JSON.stringify([
        { title: 'ملخص الدرس وملفات الأكواد', url: 'https://github.com', type: 'CODE', size: '2.4 MB' },
        { title: 'دليل مرجعي لمعمارية React Server Components', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'PDF', size: '1.1 MB' }
      ])
    }
  });

  await prisma.lessonSummary.create({
    data: {
      lessonId: lesson1_1.id,
      summaryText: 'في هذا الدرس، استعرضنا النقلة النوعية في Next.js App Router وكيف تتيح مكونات الخادم (RSC) إرسال كود JavaScript صفري إلى المتصفح للواجهات الثابتة، مما يحسن سرعة التحميل و SEO.',
      keyPointsJson: JSON.stringify([
        'مكونات الخادم Server Components تنفذ على السيرفر ولا ترسل كود JS إلى العميل',
        'مكونات العميل Client Components تستخدم توجيه use client عند الحاجة للتفاعل والـ Hooks',
        'تحسين أوقات الاستجابة TTFB وتقليل استهلاك موارد أجهزة المستخدمين'
      ]),
      definitionsJson: JSON.stringify([
        { term: 'RSC (React Server Components)', definition: 'مكونات تُعالج بالكامل على الخادم دون إرسال كودها إلى حزمة المتصفح.' },
        { term: 'Hydration', definition: 'عملية ربط معالجات الأحداث التفاعلية بـ HTML الذي تم إنشاؤه مسبقاً على السيرفر.' }
      ]),
      flashcardsJson: JSON.stringify([
        { question: 'ما هو التوجيه الأساسي لتحويل مكون خادم إلى مكون عميل في Next.js؟', answer: "'use client' في السطر الأول من الملف." },
        { question: 'هل يمكن لـ Server Component استدعاء قاعدة البيانات مباشرة دون الحاجة لـ API Route؟', answer: 'نعم، يمكن استدعاء Prisma أو قاعدة البيانات مباشرة داخل الـ Server Component.' }
      ])
    }
  });

  const quiz1_1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1_1.id,
      title: 'اختبار تقييمي: أساسيات Next.js و Server Components',
      timeLimitMinutes: 10,
      passingScorePercent: 75,
      maxAttempts: 3
    }
  });

  await prisma.question.create({
    data: {
      quizId: quiz1_1.id,
      questionText: 'أي من العبارات التالية صحيحة تماماً بخصوص React Server Components؟',
      questionType: 'MULTIPLE_CHOICE',
      optionsJson: JSON.stringify([
        { id: 'opt1', text: 'يتم إرسال كود الـ JavaScript الخاص بها إلى المتصفح دائماً' },
        { id: 'opt2', text: 'تعمل فقط على الخادم ولا تزيد من حجم الحزمة المرسلة للعميل' },
        { id: 'opt3', text: 'لا يمكنها استخدام async/await في جسم الدالة' }
      ]),
      correctAnswersJson: JSON.stringify(['opt2']),
      explanation: 'Server Components تنفذ بالكامل على الخادم دون زيادة حزمة المتصفح.',
      points: 1,
      orderIndex: 1
    }
  });

  await prisma.question.create({
    data: {
      quizId: quiz1_1.id,
      questionText: 'يمكن استخدام useState مباشرة داخل Server Components دون تحويلها إلى Client Component.',
      questionType: 'TRUE_FALSE',
      optionsJson: JSON.stringify([
        { id: 'true', text: 'صح' },
        { id: 'false', text: 'خطأ' }
      ]),
      correctAnswersJson: JSON.stringify(['false']),
      explanation: 'Hooks تعمل فقط في Client Components.',
      points: 1,
      orderIndex: 2
    }
  });

  const lesson1_2 = await prisma.lesson.create({
    data: {
      sectionId: sec1.id,
      title: '2. إعداد بيئة TypeScript و Tailwind CSS مع دعم كامل للـ RTL',
      slug: 'setup-typescript-tailwind-rtl',
      durationMinutes: 22,
      orderIndex: 2,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      videoDurationSeconds: 1320
    }
  });

  const lesson2_1 = await prisma.lesson.create({
    data: {
      sectionId: sec2.id,
      title: '3. نمذجة البيانات المعقدة وبناء الروابط بواسطة Prisma ORM',
      slug: 'prisma-orm-advanced-modeling',
      durationMinutes: 30,
      orderIndex: 1,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      videoDurationSeconds: 1800
    }
  });

  const courseFinalExam = await prisma.quiz.create({
    data: {
      courseFinalExamId: course1.id,
      title: 'الاختبار النهائي الشامل لدبلوم Next.js و TypeScript',
      timeLimitMinutes: 30,
      passingScorePercent: 80,
      maxAttempts: 2
    }
  });

  await prisma.question.create({
    data: {
      quizId: courseFinalExam.id,
      questionText: 'ما هي الطريقة الآمنة لحماية روابط الفيديو والملفات الخاصة في المنصة؟',
      questionType: 'MULTIPLE_CHOICE',
      optionsJson: JSON.stringify([
        { id: 'f1', text: 'كتابة الرابط المباشر في الواجهة' },
        { id: 'f2', text: 'استخدام روابط موقعة قصيرة الأجل وتوليدها عبر السيرفر بعد التحقق من الجلسة' },
        { id: 'f3', text: 'تعطيل الزر الأيمن للماوس' }
      ]),
      correctAnswersJson: JSON.stringify(['f2']),
      explanation: 'الروابط الموقعة قصيرة الصلاحية مع التحقق من الهوية من جانب الخادم هي المعيار الأمني الصحيح.',
      points: 5,
      orderIndex: 1
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'احتراف الذكاء الاصطناعي وهندسة الأوامر وتطوير النماذج',
      slug: 'ai-prompt-engineering-mastery',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
      shortDescription: 'تعلم كيفية دمج نماذج LLMs مثل GPT و Gemini في تطبيقاتك البرمجية باحترافية.',
      description: 'دورة شاملة في هندسة الأوامر المتقدمة وبناء تطبيقات RAG وربط الوكلاء الذكيين.',
      categoryId: catAI.id,
      level: 'ALL',
      durationHours: 25,
      price: 950,
      compareAtPrice: 1900,
      instructorId: instructor.id,
      status: 'PUBLISHED',
      completionThresholdPercent: 80,
      hasFinalExam: true,
      certificateEnabled: true
    }
  });

  const secAI = await prisma.section.create({
    data: { courseId: course2.id, title: 'القسم الأول: أساسيات النماذج وهندسة الأوامر', orderIndex: 1 }
  });

  await prisma.lesson.create({
    data: {
      sectionId: secAI.id,
      title: '1. مقدمة في معمارية Transformers والـ Tokens',
      slug: 'transformers-and-tokens-intro',
      durationMinutes: 20,
      orderIndex: 1,
      isFreePreview: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      videoDurationSeconds: 1200
    }
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'تصميم واجهات وتجربة المستخدم الاحترافية UI/UX من الصفر حتى الإتقان',
      slug: 'ui-ux-design-masterclass',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      shortDescription: 'صمم واجهات عصرية وأنظمة تصميمية متكاملة في Figma مع مراعاة المعايير العربية RTL.',
      description: 'دورة تطبيقية شاملة تركز على تجربة المستخدم والأنظمة التصميمية المتجاوبة.',
      categoryId: catUI.id,
      level: 'BEGINNER',
      durationHours: 20,
      price: 800,
      compareAtPrice: 1500,
      instructorId: instructor.id,
      status: 'PUBLISHED',
      completionThresholdPercent: 80,
      certificateEnabled: true
    }
  });

  const masterDiploma = await prisma.diploma.create({
    data: {
      title: 'دبلومة هندسة البرمجيات وتطوير الويب المتكاملة (Full-Stack Mastery Diploma)',
      slug: 'fullstack-software-engineering-diploma',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      shortDescription: 'الدبلومة الأكثر شمولاً في الوطن العربي لتأهيلك لسوق العمل العالمي كمهندس برمجيات محترف.',
      description: 'تتضمن هذه الدبلومة 3 مسارات تدريبية كاملة: تطوير الويب، تصميم الواجهات، وأساسيات الحماية.',
      categoryId: catWeb.id,
      level: 'ALL',
      durationHours: 75,
      price: 2200,
      compareAtPrice: 4500,
      status: 'PUBLISHED',
      certificateEnabled: true
    }
  });

  await prisma.diplomaCourse.create({ data: { diplomaId: masterDiploma.id, courseId: course1.id, orderIndex: 1 } });
  await prisma.diplomaCourse.create({ data: { diplomaId: masterDiploma.id, courseId: course2.id, orderIndex: 2 } });
  await prisma.diplomaCourse.create({ data: { diplomaId: masterDiploma.id, courseId: course3.id, orderIndex: 3 } });

  const certTemplate = await prisma.certificateTemplate.create({
    data: {
      name: 'القالب الملكي المعتمد لأكاديمية قِمَم',
      isDefault: true,
      primaryColor: '#7c3aed',
      accentColor: '#fbbf24',
      orientation: 'LANDSCAPE',
      fieldsConfigJson: JSON.stringify({
        showLogo: true,
        showQrCode: true,
        showStudentName: true,
        showCourseTitle: true,
        showInstructorName: true,
        showCompletionDate: true,
        showGrade: true,
        showTotalHours: true,
        showCertificateNumber: true
      })
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      type: 'COURSE',
      status: 'ACTIVE',
      accessType: 'LIFETIME',
      progressPercent: 65,
      isCompleted: false
    }
  });

  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lesson1_1.id,
      watchedSeconds: 1080,
      totalSeconds: 1080,
      watchedPercent: 100,
      isCompleted: true,
      completedAt: new Date()
    }
  });

  await prisma.quizAttempt.create({
    data: {
      quizId: quiz1_1.id,
      userId: student.id,
      score: 2,
      totalPoints: 2,
      percentage: 100,
      isPassed: true,
      timeSpentSeconds: 120,
      answersJson: JSON.stringify({ opt2: true, false: true })
    }
  });

  await prisma.enrollment.create({
    data: {
      userId: student2.id,
      courseId: course1.id,
      type: 'COURSE',
      status: 'ACTIVE',
      accessType: 'LIFETIME',
      progressPercent: 100,
      isCompleted: true,
      completedAt: new Date()
    }
  });

  const sampleCertId = 'QIMAM-CERT-2026-8942';
  await prisma.certificate.create({
    data: {
      certificateNumber: sampleCertId,
      userId: student2.id,
      courseId: course1.id,
      templateId: certTemplate.id,
      studentOfficialName: student2.officialFullName,
      title: course1.title,
      instructorName: instructor.officialFullName,
      grade: 'امتياز (98%)',
      totalHours: course1.durationHours,
      verificationUrl: 'http://localhost:3000/verify/' + sampleCertId,
      isValid: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'QIMAM50',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxUses: 500,
      usedCount: 12,
      isActive: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'FREE100',
      discountType: 'FREE_100',
      discountValue: 100,
      maxUses: 100,
      usedCount: 5,
      isActive: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'SAVE-7KX92P',
      discountType: 'FIXED',
      discountValue: 300,
      maxUses: 200,
      usedCount: 8,
      minOrderAmount: 1000,
      isActive: true
    }
  });

  const settings = [
    { key: 'PLATFORM_NAME', value: 'أكاديمية م / محمد إبراهيم', description: 'اسم المنصة الرسمي' },
    { key: 'PLATFORM_TAGLINE', value: 'بوابتك الاحترافية لاحتراف البرمجة والذكاء الاصطناعي والتصميم', description: 'الشعار التسويقي' },
    { key: 'INSTAPAY_ENABLED', value: 'true', description: 'تفعيل الدفع عبر InstaPay' },
    { key: 'INSTAPAY_ACCOUNT', value: 'qimam.edu@instapay', description: 'معرف حساب إنستاباي' },
    { key: 'INSTAPAY_NAME', value: 'منصة قِمَم التعليمية ذ.م.م', description: 'الاسم المعتمد في التحويل' },
    { key: 'INSTAPAY_INSTRUCTIONS', value: 'يرجى تحويل المبلغ بدقة إلى عنوان الدفع، ثم كتابة رقم المعاملة ورفع لقطة شاشة لإيصال التحويل للمراجعة الفورية.', description: 'تعليمات التحويل' },
    { key: 'VODAFONE_CASH_ENABLED', value: 'true', description: 'تفعيل الدفع عبر فودافون كاش' },
    { key: 'VODAFONE_CASH_NUMBER', value: '01001234567', description: 'رقم محفظة فودافون كاش' },
    { key: 'VODAFONE_CASH_NAME', value: 'أكاديمية قمم التعليمية', description: 'اسم صاحب المحفظة' },
    { key: 'VODAFONE_CASH_INSTRUCTIONS', value: 'قم بالتحويل لرقم المحفظة، وأدخل رقم المحفظة المحول منها ورقم العملية وصورة الإيصال.', description: 'تعليمات فودافون كاش' },
    { key: 'CONTACT_EMAIL', value: 'mehac196@gmail.com', description: 'البريد الرسمي للدعم' },
    { key: 'CONTACT_PHONE', value: '01555791568', description: 'رقم الهاتف المباشر' },
    { key: 'CONTACT_WHATSAPP', value: '01555791568', description: 'رقم الواتساب للدعم الفوري' },
    { key: 'WHATSAPP_NUMBER', value: '01555791568', description: 'رقم الواتساب للتواصل والطلب الفوري' },
    { key: 'WATERMARK_ENABLED', value: 'true', description: 'تفعيل العلامة المائية على مشغل الفيديو لمنع التسريب' },
    { key: 'LESSON_COMPLETION_THRESHOLD', value: '80', description: 'النسبة المئوية المطلوبة لاحتساب الدرس مكتملاً تلقائياً' }
  ];

  for (const s of settings) {
    await prisma.platformSetting.create({ data: s });
  }

  const socialLinks = [
    { platform: 'WHATSAPP', label: 'واتساب الدعم المباشر', url: 'https://wa.me/201555791568', icon: 'MessageCircle', isEnabled: true, orderIndex: 1 },
    { platform: 'TELEGRAM', label: 'قناة التليجرام الرسمية', url: 'https://t.me/qimam_academy', icon: 'Send', isEnabled: true, orderIndex: 2 },
    { platform: 'YOUTUBE', label: 'قناة اليوتيوب التعليمية', url: 'https://youtube.com', icon: 'Youtube', isEnabled: true, orderIndex: 3 },
    { platform: 'FACEBOOK', label: 'صفحة الفيسبوك', url: 'https://facebook.com', icon: 'Facebook', isEnabled: true, orderIndex: 4 },
    { platform: 'LINKEDIN', label: 'لينكد إن', url: 'https://linkedin.com', icon: 'Linkedin', isEnabled: true, orderIndex: 5 },
    { platform: 'X', label: 'منصة X', url: 'https://x.com', icon: 'Twitter', isEnabled: true, orderIndex: 6 }
  ];

  for (const sl of socialLinks) {
    await prisma.socialLink.create({ data: sl });
  }

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-1089',
      userId: student.id,
      courseId: course2.id,
      totalAmount: 950,
      discountAmount: 0,
      finalAmount: 950,
      status: 'PENDING'
    }
  });

  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      userId: student.id,
      amount: 950,
      paymentMethod: 'INSTAPAY',
      transactionId: 'IP-TXN-984321',
      screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      senderPhone: '01205551234',
      status: 'PENDING',
      adminNotes: 'بانتظار مطابقة كشف الحساب البنكي من قبل الإدارة'
    }
  });

  const sampleTicket = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TCK-2026-101',
      userId: student.id,
      subject: 'استفسار حول موعد تسليم مشروع التخرج في دبلوم Next.js',
      category: 'COURSE_CONTENT',
      priority: 'MEDIUM',
      status: 'OPEN'
    }
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: sampleTicket.id,
      senderId: student.id,
      senderRole: 'STUDENT',
      message: 'السلام عليكم ورحمة الله، هل يمكن تمديد مهلة تسليم المشروع النهائي لمدة يومين إضافيين لإنهاء ميزة الدفع؟ شكراً جزيلاً.'
    }
  });

  const conv = await prisma.conversation.create({
    data: {
      studentId: student.id,
      instructorId: instructor.id,
      status: 'OPEN',
      unreadAdminCount: 1
    }
  });

  await prisma.chatMessage.create({
    data: {
      conversationId: conv.id,
      senderId: student.id,
      senderRole: 'STUDENT',
      message: 'أهلاً بك م. محمد، شكراً على الشرح الرائع في درس Server Actions!'
    }
  });

  await prisma.announcement.create({
    data: {
      title: 'أهلاً بكم في الإصدار الجديد من أكاديمية قِمَم التعليمية!',
      content: 'يسرنا إطلاق المنصة المطورة بمشغل فيديو متقدم، ومساعد ذكاء اصطناعي فوري داخل الدروس، ونظام تحقق معتمد من الشهادات بالـ QR Code.',
      targetAudience: 'ALL',
      createdById: admin.id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      entity: 'PLATFORM',
      detailsJson: JSON.stringify({ message: 'تمت تهيئة المنصة وقواعد البيانات بنجاح' }),
      ipAddress: '127.0.0.1'
    }
  });

  console.log('[Seed] Database seeded successfully with real production-grade data!');
  console.log('----------------------------------------------------');
  console.log('Admin:       admin / admin (or admin@qimam.edu)');
  console.log('Instructor:  instructor / instructor (or instructor@qimam.edu)');
  console.log('Student:     student / student (or student@qimam.edu)');
  console.log('Student 2:   sara@qimam.edu / student');
  console.log('----------------------------------------------------');
}

main().catch(console.error).finally(() => prisma.$disconnect());
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`ai:${user.id}:${clientIp}`, { limit: 20, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد الاستفسارات المسموح بها مؤقتاً. يرجى الانتظار دقيقة.' },
        { status: 429 }
      );
    }

    const { lessonId, message } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'نص السؤال مطلوب' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'نص السؤال طويل جداً (الحد الأقصى 2000 حرف)' }, { status: 400 });
    }

    let lesson = null;
    if (lessonId && typeof lessonId === 'string') {
      lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { summary: true, section: { include: { course: true } } }
      });

      if (lesson) {
        // Enforce authorization for paid course lessons
        const isFree = lesson.isFreePreview || lesson.section.course.isFree || lesson.section.course.price === 0;
        const isOwnerOrAdmin = user.role === 'ADMIN' || lesson.section.course.instructorId === user.id;

        if (!isFree && !isOwnerOrAdmin) {
          const enrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: user.id,
                courseId: lesson.section.courseId,
              }
            }
          });

          if (!enrollment || enrollment.status !== 'ACTIVE') {
            return NextResponse.json(
              { error: 'عذراً، يجب الاشتراك في هذه الدورة للوصول إلى محتواها ومساعد الذكاء الاصطناعي.' },
              { status: 403 }
            );
          }
        }
      }
    }

    // Built-in Intelligent Arabic Educational Assistant Response Engine
    let reply = '';
    const qLower = message.toLowerCase();

    if (qLower.includes('ملخص') || qLower.includes('لخص') || qLower.includes('summary')) {
      reply = ` **ملخص مركز للدرس (${lesson?.title || 'الدرس الحالي'}):**\n\n` +
        (lesson?.summary?.summaryText || 'يركز هذا الدرس على بناء التطبيقات الحديثة باستخدام أفضل المعايير المعمارية، مع مراعاة فصل المهام بين الخادم والواجهة لتحقيق أعلى سرعة استجابة وأمان.') +
        `\n\n **نصيحة عملية:** احرص على تطبيق الكود بيدك وإعادة كتابة الأمثلة في بيئة التطوير الخاصة بك.`;
    } else if (qLower.includes('server') || qLower.includes('خادم') || qLower.includes('rsc')) {
      reply = ` **مكونات الخادم (React Server Components):**\n\nتُنفذ مباشرة على خادم Next.js، ولا يُرسل كودها المصدري إلى متصفح المستخدم، مما يعني:\n1. حزمة جافاسكريبت أصغر حجماً وسرعة تحميل فائقة.\n2. إمكانية الاستعلام المباشر والآمن من قاعدة البيانات دون الحاجة لـ API الوسيط.\n3. عند الحاجة للتفاعل والـ Hooks مثل useState، نستخدم التوجيه 'use client' أعلى الملف.`;
    } else if (qLower.includes('امتحان') || qLower.includes('اختبار') || qLower.includes('quiz')) {
      reply = ` **نصائح للاختبار التقييمي:**\n\n- اقرأ السؤال وخيارات الإجابة بعناية.\n- انتبه لأسئلة الاختيار المتعدد التي قد تحتوي أكثر من إجابة صحيحة.\n- يمكنك إعادة المحاولة إذا لم تحقق درجة النجاح المطلوبة.`;
    } else {
      reply = `مرحباً بك يا ${user.firstName}! \n\nبخصوص سؤالك حول **"${message.trim()}"** في سياق درس (${lesson?.title || 'المقرر'}):\n\nتطبيق هذه المفاهيم برمجياً يعتمد على فهم تدفق البيانات من الخادم وإدارتها بدقة. إذا كنت تواجه أي صعوبة في كتابة الأكواد، يمكنك أيضاً كتابة ملاحظاتك والاحتفاظ بنقاط التوقف (Timestamps) للرجوع إليها في أي وقت.`;
    }

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل معالجة استفسار الذكاء الاصطناعي' }, { status: 500 });
  }
}
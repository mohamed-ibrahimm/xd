import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, buildParentQuizEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`quiz_submit:${user.id}:${clientIp}`, { limit: 10, windowMs: 5 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد محاولات تسليم الاختبار المسموح بها مؤقتاً. يرجى الانتظار.' }, { status: 429 });
    }

    const { quizId, answers, timeSpentSeconds } = await req.json();

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        lesson: {
          include: {
            section: {
              include: { course: true }
            }
          }
        },
        courseFinalExam: true,
        diplomaFinalExam: true,
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
    }

    // Calculate score server-side
    let earnedPoints = 0;
    let totalPoints = 0;
    const questionResults: any[] = [];

    for (const q of quiz.questions) {
      totalPoints += q.points;
      const correctAnswers: string[] = JSON.parse(q.correctAnswersJson);
      const userSelected = answers[q.id]; // array or single string/boolean

      let isQuestionCorrect = false;

      if (q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'TRUE_FALSE') {
        const userChoice = String(userSelected || '');
        if (correctAnswers.includes(userChoice)) {
          isQuestionCorrect = true;
          earnedPoints += q.points;
        }
      } else if (q.questionType === 'MULTIPLE_ANSWERS') {
        const userArray: string[] = Array.isArray(userSelected) ? userSelected : (userSelected ? [userSelected] : []);
        const allCorrectSelected = correctAnswers.every((a) => userArray.includes(a));
        const noExtraIncorrect = userArray.every((a) => correctAnswers.includes(a));

        if (allCorrectSelected && noExtraIncorrect) {
          isQuestionCorrect = true;
          earnedPoints += q.points;
        }
      } else if (q.questionType === 'SHORT_ANSWER') {
        const userStr = String(userSelected || '').trim().toLowerCase();
        const matches = correctAnswers.some((ans) => ans.trim().toLowerCase() === userStr);
        if (matches) {
          isQuestionCorrect = true;
          earnedPoints += q.points;
        }
      }

      questionResults.push({
        questionId: q.id,
        questionText: q.questionText,
        isCorrect: isQuestionCorrect,
        explanation: q.explanation,
        correctAnswers,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = percentage >= quiz.passingScorePercent;

    // Save QuizAttempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: user.id,
        score: earnedPoints,
        totalPoints,
        percentage,
        isPassed,
        timeSpentSeconds: timeSpentSeconds || 0,
        answersJson: JSON.stringify(answers),
      }
    });

    // If passed and attached to a lesson, mark lesson progress as completed
    if (isPassed && quiz.lesson) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: quiz.lesson.id,
          }
        },
        create: {
          userId: user.id,
          lessonId: quiz.lesson.id,
          watchedPercent: 100,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        }
      });
    }

    // If passed and this is a course final exam, issue accredited certificate ONLY if student has active enrollment!
    let certificate: any = null;
    if (isPassed && quiz.courseFinalExam) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: quiz.courseFinalExam.id,
          status: 'ACTIVE',
        }
      });

      if (enrollment || user.role === 'ADMIN') {
        const course = await prisma.course.findUnique({
          where: { id: quiz.courseFinalExam.id },
          include: { instructor: true }
        });

        if (course) {
          const existingCert = await prisma.certificate.findFirst({
            where: { userId: user.id, courseId: course.id }
          });

        if (existingCert) {
          certificate = existingCert;
        } else {
          const certNumber = `QIMAM-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
          certificate = await prisma.certificate.create({
            data: {
              certificateNumber: certNumber,
              userId: user.id,
              courseId: course.id,
              studentOfficialName: user.officialFullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'الطالب',
              title: course.title,
              instructorName: course.instructor?.officialFullName || 'أكاديمية قمم',
              grade: `${percentage}% (${percentage >= 90 ? 'ممتاز' : percentage >= 80 ? 'جيد جداً' : 'جيد'})`,
              totalHours: course.durationHours || 20,
              verificationUrl: `/verify-certificate?number=${certNumber}`,
              isValid: true,
            }
          });
        }
      }
    }
  }

    // Check Parent Notification
    if (user.parentNotificationEnabled) {
      const parentContact = await prisma.parentContact.findFirst({
        where: { userId: user.id, isVerified: true }
      });

      if (parentContact && parentContact.notifyQuizResult) {
        const courseTitle = quiz.lesson?.section.course.title || quiz.courseFinalExam?.title || quiz.diplomaFinalExam?.title || 'المقرر التدريبي';
        const html = buildParentQuizEmail({
          parentName: parentContact.parentName,
          studentName: user.officialFullName,
          courseTitle,
          quizTitle: quiz.title,
          score: earnedPoints,
          totalPoints,
          percentage,
          isPassed,
          progressPercent: 75,
        });

        await sendEmail({
          to: parentContact.parentEmail,
          recipientName: parentContact.parentName,
          subject: `نتائج اختبار الطالب: ${user.officialFullName} - ${quiz.title}`,
          templateType: 'PARENT_QUIZ_RESULT',
          htmlContent: html,
        });
      }
    }

    const motivationalMessages = [
      'ممتاز! كمل بنفس القوة ',
      'أحسنت! خطوة كمان وتوصل للهدف ',
      'إنجاز رائع! استمر يا بطل ',
      'فخورين بيك! يلا على الدرس اللي بعده ',
      'عاش! قربت تخلص الكورس ',
    ];
    const motivationalMessage = isPassed
      ? motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
      : 'حاول مرة أخرى وركز في مفاهيم الدرس لتجتاز بنجاح!';

    return NextResponse.json({
      success: true,
      score: earnedPoints,
      totalPoints,
      percentage,
      isPassed,
      passingScorePercent: quiz.passingScorePercent,
      attemptId: attempt.id,
      questionResults,
      motivationalMessage,
      certificate,
    });
  } catch (error: any) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'فشل حفظ نتيجة الاختبار' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: { id: string };
}

async function verifyCourseAccess(courseId: string) {
  const user = await requireAuth(['ADMIN', 'INSTRUCTOR']);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, slug: true, title: true, instructorId: true }
  });

  if (!course) {
    return { error: 'الكورس غير موجود', status: 404 };
  }

  if (user.role === 'INSTRUCTOR' && course.instructorId !== user.id) {
    return { error: 'غير مصرح لك بتعديل محتوى هذا الكورس', status: 403 };
  }

  return { user, course };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const isFinalExam = searchParams.get('isFinalExam') === 'true';

    let quiz = null;
    if (isFinalExam) {
      quiz = await prisma.quiz.findUnique({
        where: { courseFinalExamId: params.id },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        }
      });
    } else if (lessonId) {
      quiz = await prisma.quiz.findUnique({
        where: { lessonId },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
        }
      });
    }

    return NextResponse.json({ success: true, quiz });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل جلب الاختبار' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const {
      type,
      lessonId,
      title,
      description,
      timeLimitMinutes = 15,
      passingScorePercent = 70,
      questions = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'عنوان الاختبار مطلوب' }, { status: 400 });
    }

    if (type === 'LESSON' && !lessonId) {
      return NextResponse.json({ error: 'معرّف الدرس مطلوب' }, { status: 400 });
    }

    let quiz;
    if (type === 'FINAL_EXAM') {
      quiz = await prisma.quiz.upsert({
        where: { courseFinalExamId: params.id },
        create: {
          courseFinalExamId: params.id,
          title: title.trim(),
          description: description?.trim() || null,
          timeLimitMinutes: parseInt(timeLimitMinutes) || 30,
          passingScorePercent: parseInt(passingScorePercent) || 75,
        },
        update: {
          title: title.trim(),
          description: description?.trim() || null,
          timeLimitMinutes: parseInt(timeLimitMinutes) || 30,
          passingScorePercent: parseInt(passingScorePercent) || 75,
        },
      });

      await prisma.course.update({
        where: { id: params.id },
        data: { hasFinalExam: true }
      });
    } else {
      quiz = await prisma.quiz.upsert({
        where: { lessonId },
        create: {
          lessonId,
          title: title.trim(),
          description: description?.trim() || null,
          timeLimitMinutes: parseInt(timeLimitMinutes) || 15,
          passingScorePercent: parseInt(passingScorePercent) || 70,
        },
        update: {
          title: title.trim(),
          description: description?.trim() || null,
          timeLimitMinutes: parseInt(timeLimitMinutes) || 15,
          passingScorePercent: parseInt(passingScorePercent) || 70,
        },
      });
    }

    await prisma.question.deleteMany({
      where: { quizId: quiz.id }
    });

    if (Array.isArray(questions) && questions.length > 0) {
      const questionsData = questions.map((q: any, idx: number) => {
        const optionsList = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['خيار 1', 'خيار 2'];
        const optionsObjects = optionsList.map((text: string, oIdx: number) => ({
          id: String(oIdx),
          text: String(text).trim()
        }));

        const correctAnswerId = String(q.correctAnswer ?? 0);

        return {
          quizId: quiz.id,
          questionText: String(q.questionText || `سؤال ${idx + 1}`).trim(),
          questionType: q.questionType || 'MULTIPLE_CHOICE',
          optionsJson: JSON.stringify(optionsObjects),
          correctAnswersJson: JSON.stringify([correctAnswerId]),
          explanation: q.explanation?.trim() || null,
          points: parseInt(q.points) || 1,
          orderIndex: idx + 1,
        };
      });

      await prisma.question.createMany({
        data: questionsData
      });
    }

    const savedQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } }
      }
    });

    revalidatePath(`/courses/${check.course.slug}`);
    revalidatePath(`/learn/${check.course.slug}`);

    return NextResponse.json({ success: true, quiz: savedQuiz });
  } catch (e: any) {
    console.error('Quiz creation error:', e);
    return NextResponse.json({ error: e?.message || 'فشل حفظ الاختبار' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'معرف الاختبار مطلوب' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          include: {
            section: true
          }
        }
      }
    });
    if (!quiz) {
      return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
    }

    const belongsToThisCourse =
      quiz.courseFinalExamId === params.id ||
      (quiz.lesson && quiz.lesson.section.courseId === params.id);

    if (!belongsToThisCourse) {
      return NextResponse.json({ error: 'هذا الاختبار لا ينتمي لهذا الكورس' }, { status: 403 });
    }

    await prisma.quiz.delete({ where: { id: quizId } });

    if (quiz.courseFinalExamId) {
      await prisma.course.update({
        where: { id: params.id },
        data: { hasFinalExam: false }
      });
    }

    revalidatePath(`/courses/${check.course.slug}`);
    revalidatePath(`/learn/${check.course.slug}`);

    return NextResponse.json({ success: true, message: 'تم حذف الاختبار بنجاح' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل حذف الاختبار' }, { status: 500 });
  }
}

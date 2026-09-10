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

    const sections = await prisma.section.findMany({
      where: { courseId: params.id },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            summary: true,
            quiz: { select: { id: true, title: true } }
          }
        }
      }
    });

    return NextResponse.json(
      { success: true, course: check.course, sections },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل جلب المنهج' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const { type } = body;

    if (type === 'SECTION') {
      const { title, description } = body;
      if (!title?.trim()) {
        return NextResponse.json({ error: 'عنوان الوحدة مطلوب' }, { status: 400 });
      }

      const count = await prisma.section.count({ where: { courseId: params.id } });
      const section = await prisma.section.create({
        data: {
          courseId: params.id,
          title: title.trim(),
          description: description?.trim() || null,
          orderIndex: count + 1,
        },
        include: { lessons: true }
      });

      revalidatePath(`/courses/${check.course.slug}`);
      return NextResponse.json({ success: true, section });
    }

    if (type === 'LESSON') {
      const {
        sectionId,
        title,
        description,
        durationMinutes,
        isFreePreview,
        videoUrl,
        videoProvider,
        pdfUrl
      } = body;

      if (!sectionId) {
        return NextResponse.json({ error: 'معرف الوحدة مطلوب' }, { status: 400 });
      }
      if (!title?.trim()) {
        return NextResponse.json({ error: 'عنوان الدرس مطلوب' }, { status: 400 });
      }

      const section = await prisma.section.findFirst({
        where: { id: sectionId, courseId: params.id }
      });
      if (!section) {
        return NextResponse.json({ error: 'الوحدة المحددة غير موجودة' }, { status: 404 });
      }

      const lessonCount = await prisma.lesson.count({ where: { sectionId } });
      const slug = `lesson-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;

      const lesson = await prisma.lesson.create({
        data: {
          sectionId,
          title: title.trim(),
          slug,
          description: description?.trim() || null,
          durationMinutes: parseInt(durationMinutes) || 10,
          videoDurationSeconds: (parseInt(durationMinutes) || 10) * 60,
          isFreePreview: Boolean(isFreePreview),
          videoUrl: videoUrl?.trim() || null,
          videoProvider: videoProvider || 'DIRECT',
          pdfUrl: pdfUrl?.trim() || null,
          orderIndex: lessonCount + 1,
        }
      });

      revalidatePath(`/courses/${check.course.slug}`);
      revalidatePath(`/learn/${check.course.slug}`);
      return NextResponse.json({ success: true, lesson });
    }

    return NextResponse.json({ error: 'نوع العملية غير معروف' }, { status: 400 });
  } catch (e: any) {
    console.error('Curriculum creation error:', e);
    return NextResponse.json({ error: e?.message || 'فشل إضافة العنصر' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const body = await req.json();
    const { type } = body;

    if (type === 'SECTION') {
      const { sectionId, title, description, orderIndex } = body;
      if (!sectionId) {
        return NextResponse.json({ error: 'معرف الوحدة مطلوب' }, { status: 400 });
      }

      const existingSection = await prisma.section.findFirst({
        where: { id: sectionId, courseId: params.id }
      });
      if (!existingSection) {
        return NextResponse.json({ error: 'الوحدة غير موجودة في هذا الكورس' }, { status: 404 });
      }

      const section = await prisma.section.update({
        where: { id: sectionId },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
          ...(orderIndex !== undefined ? { orderIndex: parseInt(orderIndex) } : {}),
        }
      });

      revalidatePath(`/courses/${check.course.slug}`);
      return NextResponse.json({ success: true, section });
    }

    if (type === 'LESSON') {
      const {
        lessonId,
        title,
        description,
        durationMinutes,
        isFreePreview,
        videoUrl,
        videoProvider,
        pdfUrl,
        orderIndex
      } = body;

      if (!lessonId) {
        return NextResponse.json({ error: 'معرف الدرس مطلوب' }, { status: 400 });
      }

      const existingLesson = await prisma.lesson.findFirst({
        where: { id: lessonId, section: { courseId: params.id } }
      });
      if (!existingLesson) {
        return NextResponse.json({ error: 'الدرس غير موجود في هذا الكورس' }, { status: 404 });
      }

      const lesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(description !== undefined ? { description: description?.trim() || null } : {}),
          ...(durationMinutes !== undefined ? {
            durationMinutes: parseInt(durationMinutes) || 1,
            videoDurationSeconds: (parseInt(durationMinutes) || 1) * 60,
          } : {}),
          ...(isFreePreview !== undefined ? { isFreePreview: Boolean(isFreePreview) } : {}),
          ...(videoUrl !== undefined ? { videoUrl: videoUrl?.trim() || null } : {}),
          ...(videoProvider ? { videoProvider } : {}),
          ...(pdfUrl !== undefined ? { pdfUrl: pdfUrl?.trim() || null } : {}),
          ...(orderIndex !== undefined ? { orderIndex: parseInt(orderIndex) } : {}),
        }
      });

      revalidatePath(`/courses/${check.course.slug}`);
      revalidatePath(`/learn/${check.course.slug}`);
      return NextResponse.json({ success: true, lesson });
    }

    return NextResponse.json({ error: 'نوع العملية غير معروف' }, { status: 400 });
  } catch (e: any) {
    console.error('Curriculum update error:', e);
    return NextResponse.json({ error: e?.message || 'فشل تحديث العنصر' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const check = await verifyCourseAccess(params.id);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const targetId = searchParams.get('id');

    if (!targetId) {
      return NextResponse.json({ error: 'معرف العنصر مطلوب' }, { status: 400 });
    }

    if (type === 'SECTION') {
      const existingSection = await prisma.section.findFirst({
        where: { id: targetId, courseId: params.id }
      });
      if (!existingSection) {
        return NextResponse.json({ error: 'الوحدة غير موجودة في هذا الكورس' }, { status: 404 });
      }

      await prisma.section.delete({ where: { id: targetId } });
      revalidatePath(`/courses/${check.course.slug}`);
      return NextResponse.json({ success: true, message: 'تم حذف الوحدة وجميع دروسها بنجاح' });
    }

    if (type === 'LESSON') {
      const existingLesson = await prisma.lesson.findFirst({
        where: { id: targetId, section: { courseId: params.id } }
      });
      if (!existingLesson) {
        return NextResponse.json({ error: 'الدرس غير موجود في هذا الكورس' }, { status: 404 });
      }

      await prisma.lesson.delete({ where: { id: targetId } });
      revalidatePath(`/courses/${check.course.slug}`);
      revalidatePath(`/learn/${check.course.slug}`);
      return NextResponse.json({ success: true, message: 'تم حذف الدرس بنجاح' });
    }

    return NextResponse.json({ error: 'نوع العنصر غير صالح' }, { status: 400 });
  } catch (e: any) {
    console.error('Curriculum delete error:', e);
    return NextResponse.json({ error: e?.message || 'فشل حذف العنصر' }, { status: 500 });
  }
}

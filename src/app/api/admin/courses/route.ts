import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await requireAuth(['ADMIN', 'INSTRUCTOR']);
    const where = user.role === 'ADMIN' ? {} : { instructorId: user.id };

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { officialFullName: true } },
        category: true,
        _count: { select: { sections: true, enrollments: true } }
      }
    });

    return NextResponse.json(
      { courses },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (e) {
    return NextResponse.json({ error: 'فشل جلب الكورسات' }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(['ADMIN', 'INSTRUCTOR']);
    const body = await req.json();
    const { title, slug, description, shortDescription, price, durationHours, level, categoryId, thumbnail } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'يرجى إدخال عنوان الكورس' }, { status: 400 });
    }

    const safeDescription = description?.trim() || shortDescription?.trim() || `دورة تدريبية متخصصة في ${title.trim()}`;

    // Generate safe unique slug
    let baseSlug = (slug?.trim() || title.trim().toLowerCase().replace(/[^\w\s\u0600-\u06FF-]/g, '').replace(/\s+/g, '-')).substring(0, 80);
    if (!baseSlug) {
      baseSlug = `course-${Date.now().toString().slice(-6)}`;
    }

    let finalSlug = baseSlug;
    const existing = await prisma.course.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    let targetInstructorId = user.id;
    if (user.role === 'ADMIN' && body.instructorId) {
      targetInstructorId = body.instructorId;
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        thumbnail: thumbnail || null,
        description: safeDescription,
        shortDescription: shortDescription?.trim() || null,
        price: parseFloat(price) || 0,
        durationHours: parseInt(durationHours) || 10,
        level: level || 'ALL',
        categoryId: categoryId || null,
        instructorId: targetInstructorId,
        status: 'PUBLISHED',
        sections: {
          create: {
            title: 'الوحدة الأولى: المدخل والأساسيات',
            orderIndex: 1,
            lessons: {
              create: {
                title: 'المحاضرة التمهيدية والترحيب بالطلاب',
                slug: `intro-${Date.now().toString().slice(-4)}`,
                durationMinutes: 15,
                isFreePreview: true,
                orderIndex: 1,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                description: `مرحباً بك في كورس ${title.trim()}. نستعرض في هذه المحاضرة التمهيدية المحاور الأساسية وخطة العمل التطبيقية للمسار.`,
              }
            }
          }
        }
      },
      include: {
        instructor: { select: { officialFullName: true } },
        _count: { select: { sections: true, enrollments: true } },
        sections: {
          include: {
            lessons: true
          }
        }
      }
    });

    try {
      revalidatePath('/instructor');
      revalidatePath('/courses');
      revalidatePath('/admin/courses');
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json(
      { success: true, course },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (e: any) {
    console.error('Course creation error:', e);
    return NextResponse.json({ error: e?.message || 'فشل حفظ الكورس' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth(['ADMIN', 'INSTRUCTOR']);
    const { searchParams } = new URL(req.url);
    let courseId = searchParams.get('id') || searchParams.get('courseId');

    if (!courseId) {
      try {
        const body = await req.json();
        courseId = body.courseId || body.id;
      } catch (e) {}
    }

    if (!courseId) {
      return NextResponse.json({ error: 'معرف الكورس مطلوب' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                quiz: true,
                summary: true,
              }
            }
          }
        },
        finalExam: true,
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'الكورس غير موجود أو تم حذفه مسبقاً' }, { status: 404 });
    }

    // Permission check: Instructors can only delete their own courses
    if (user.role === 'INSTRUCTOR' && course.instructorId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف كورس تابع لمعلم آخر' }, { status: 403 });
    }

    // Cascade delete in transaction to ensure total database integrity
    await prisma.$transaction(async (tx) => {
      // 1. Delete certificates associated with this course
      await tx.certificate.deleteMany({ where: { courseId: course.id } });

      // 2. Unlink or delete orders & payments
      const orders = await tx.order.findMany({ where: { courseId: course.id } });
      for (const order of orders) {
        await tx.payment.deleteMany({ where: { orderId: order.id } });
        await tx.couponUsage.deleteMany({ where: { orderId: order.id } });
        await tx.order.delete({ where: { id: order.id } });
      }

      // 3. Delete manual access grants
      await tx.manualAccessGrant.deleteMany({ where: { courseId: course.id } });

      // 4. Delete enrollments
      await tx.enrollment.deleteMany({ where: { courseId: course.id } });

      // 5. Delete reviews & wishlist
      await tx.review.deleteMany({ where: { courseId: course.id } });
      await tx.wishlist.deleteMany({ where: { courseId: course.id } });

      // 6. Delete diploma-course links
      await tx.diplomaCourse.deleteMany({ where: { courseId: course.id } });

      // 7. Delete lesson-level data (progresses, notes, bookmarks, quizzes, attempts)
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          await tx.lessonProgress.deleteMany({ where: { lessonId: lesson.id } });
          await tx.studentNote.deleteMany({ where: { lessonId: lesson.id } });
          await tx.studentBookmark.deleteMany({ where: { lessonId: lesson.id } });

          if (lesson.summary) {
            await tx.lessonSummary.delete({ where: { id: lesson.summary.id } });
          }

          if (lesson.quiz) {
            await tx.quizAttempt.deleteMany({ where: { quizId: lesson.quiz.id } });
            await tx.question.deleteMany({ where: { quizId: lesson.quiz.id } });
            await tx.quiz.delete({ where: { id: lesson.quiz.id } });
          }

          await tx.lesson.delete({ where: { id: lesson.id } });
        }
        await tx.section.delete({ where: { id: section.id } });
      }

      // 8. Delete course final exam if exists
      if (course.finalExam) {
        await tx.quizAttempt.deleteMany({ where: { quizId: course.finalExam.id } });
        await tx.question.deleteMany({ where: { quizId: course.finalExam.id } });
        await tx.quiz.delete({ where: { id: course.finalExam.id } });
      }

      // 9. Finally delete the course
      await tx.course.delete({ where: { id: course.id } });

      // 10. Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'COURSE_DELETED',
          entity: 'COURSE',
          entityId: course.id,
          detailsJson: JSON.stringify({
            title: course.title,
            deletedByRole: user.role,
            instructorId: course.instructorId,
          })
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف كورس "${course.title}" بنجاح وكافة بياناته المرتبطة.`,
    });
  } catch (error: any) {
    console.error('Course deletion error:', error);
    return NextResponse.json({ error: 'فشل حذف الكورس' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth(['ADMIN', 'INSTRUCTOR']);
    const body = await req.json();
    const { id, price, title, shortDescription, description, level, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف الكورس مطلوب' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: 'الكورس غير موجود' }, { status: 404 });
    }

    if (user.role === 'INSTRUCTOR' && course.instructorId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا الكورس' }, { status: 403 });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(price !== undefined && { price: parseFloat(price) || 0 }),
        ...(title && { title: title.trim() }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(level && { level }),
        ...(status && { status }),
      },
    });

    try {
      revalidatePath('/instructor');
      revalidatePath('/courses');
      revalidatePath(`/courses/${updated.slug}`);
    } catch (e) {}

    return NextResponse.json({ success: true, course: updated });
  } catch (e: any) {
    console.error('Course update error:', e);
    return NextResponse.json({ error: 'فشل تحديث بيانات وسعر الكورس' }, { status: 500 });
  }
}
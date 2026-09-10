import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// GET reviews for a course, diploma, or digital book
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const diplomaId = searchParams.get('diplomaId');
    const bookId = searchParams.get('bookId');

    const where: any = { isHidden: false };
    if (courseId) where.courseId = courseId;
    if (diplomaId) where.diplomaId = diplomaId;
    if (bookId) where.bookId = bookId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            officialFullName: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json({ error: 'فشل جلب التقييمات' }, { status: 500 });
  }
}

// POST: Student submits a review or comment
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك بالتقييم قبل تسجيل الدخول' }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`review:${user.id}:${clientIp}`, { limit: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد التقييمات المسموح بها في الساعة. يرجى الانتظار.' }, { status: 429 });
    }

    const { courseId, diplomaId, bookId, rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'يرجى اختيار تقييم صحيح من 1 إلى 5 نجوم' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return NextResponse.json({ error: 'يرجى كتابة تعليق تقييم لا يقل عن 3 أحرف' }, { status: 400 });
    }

    if (comment.length > 2000) {
      return NextResponse.json({ error: 'التعليق طويل جداً (الحد الأقصى 2000 حرف)' }, { status: 400 });
    }

    // SECURITY: Verify enrollment or purchase before allowing review
    if (user.role !== 'ADMIN') {
      let hasAccess = false;
      if (courseId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId: user.id, courseId, status: 'ACTIVE' }
        });
        hasAccess = Boolean(enrollment);
      } else if (diplomaId) {
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId: user.id, diplomaId, status: 'ACTIVE' }
        });
        hasAccess = Boolean(enrollment);
      } else if (bookId) {
        const purchase = await prisma.bookPurchase.findFirst({
          where: { userId: user.id, bookId }
        });
        hasAccess = Boolean(purchase);
      }

      if (!hasAccess) {
        return NextResponse.json({ error: 'عذراً، يجب أن تكون مشتركاً أو مشترياً للمحتوى لتتمكن من إضافة تقييمك' }, { status: 403 });
      }
    }

    // Upsert review so student can update their existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        ...(courseId ? { courseId } : diplomaId ? { diplomaId } : { bookId }),
      }
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          comment: comment.trim(),
          isApproved: true,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              officialFullName: true,
              avatarUrl: true,
            }
          }
        }
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId: user.id,
          courseId: courseId || null,
          diplomaId: diplomaId || null,
          bookId: bookId || null,
          rating: Number(rating),
          comment: comment.trim(),
          isApproved: true,
          isHidden: false,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              officialFullName: true,
              avatarUrl: true,
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'شكراً لك! تم تسجيل رأيك وتقييمك بنجاح ',
    });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'فشل حفظ التقييم' }, { status: 500 });
  }
}

// DELETE / PUT for Admin Manual Ratings Management
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');
    if (!reviewId) {
      return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true, message: 'تم حذف التقييم بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ error: 'فشل حذف التقييم' }, { status: 500 });
  }
}

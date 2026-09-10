import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`coupon:${user.id}:${clientIp}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد محاولات إدخال الكوبون المسموح بها. يرجى الانتظار قليلاً.' }, { status: 429 });
    }

    const { code, courseId, diplomaId, bookId } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'يرجى إدخال كود الكوبون' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: 'كود الكوبون غير صالح أو غير متاح' }, { status: 400 });
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ error: 'انتهت صلاحية هذا الكوبون' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'تم استنفاد الحد الأقصى لاستخدام هذا الكوبون' }, { status: 400 });
    }

    // Check instructor restriction if coupon is created by a specific instructor
    if (coupon.instructorId) {
      if (courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
        if (!course || course.instructorId !== coupon.instructorId) {
          return NextResponse.json({ error: 'هذا الكوبون خاص بكورسات محاضر آخر ولا ينطبق على هذا الكورس' }, { status: 400 });
        }
      } else if (bookId) {
        const book = await prisma.digitalBook.findUnique({ where: { id: bookId }, select: { instructorId: true } });
        if (!book || book.instructorId !== coupon.instructorId) {
          return NextResponse.json({ error: 'هذا الكوبون خاص بمذكرات محاضر آخر ولا ينطبق على هذه المذكرة' }, { status: 400 });
        }
      }
    }

    // Check user usage limit
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: user.id }
    });

    if (userUsageCount >= coupon.perUserLimit) {
      return NextResponse.json({ error: 'لقد استخدمت هذا الكوبون من قبل والحد الأقصى لكل مستخدم هو مرة واحدة' }, { status: 400 });
    }

    // Get item price
    let itemPrice = 0;
    if (bookId) {
      const book = await prisma.digitalBook.findUnique({ where: { id: bookId } });
      if (book) itemPrice = book.price;
    } else if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) itemPrice = course.price;
    } else if (diplomaId) {
      const diploma = await prisma.diploma.findUnique({ where: { id: diplomaId } });
      if (diploma) itemPrice = diploma.price;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (itemPrice * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = Math.min(itemPrice, coupon.discountValue);
    } else if (coupon.discountType === 'FREE_100') {
      discountAmount = itemPrice;
    }

    const finalAmount = Math.max(0, itemPrice - discountAmount);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      itemPrice,
      discountAmount,
      finalAmount,
      isFree: finalAmount === 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'فشل التحقق من الكوبون' }, { status: 500 });
  }
}
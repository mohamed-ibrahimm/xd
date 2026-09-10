import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Rate Limiting: 10 checkout submissions per minute per user
    const rateCheck = checkRateLimit(`checkout_${user.id}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد محاولات إتمام الطلب، يرجى الانتظار دقيقة' }, { status: 429 });
    }

    const {
      courseId,
      diplomaId,
      bookId,
      couponId,
      paymentMethod = 'INSTAPAY',
      senderPhone,
      transactionId,
      screenshotUrl,
    } = await req.json();

    // Fetch product details strictly from server DB
    let totalAmount = 0;
    let title = '';

    if (bookId) {
      const b = await prisma.digitalBook.findUnique({ where: { id: bookId } });
      if (!b) return NextResponse.json({ error: 'المذكرة غير موجودة' }, { status: 404 });
      totalAmount = Math.max(0, b.price);
      title = b.title;

      // Check if already purchased
      const existingBook = await prisma.bookPurchase.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId,
          }
        }
      });
      if (existingBook) {
        return NextResponse.json({ error: 'أنت تمتلك هذه المذكرة بالفعل في مكتبتك!' }, { status: 400 });
      }
    } else if (courseId) {
      const c = await prisma.course.findUnique({ where: { id: courseId } });
      if (!c) return NextResponse.json({ error: 'الكورس غير موجود' }, { status: 404 });
      totalAmount = Math.max(0, c.price);
      title = c.title;

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId,
          status: 'ACTIVE',
        }
      });
      if (existing) {
        return NextResponse.json({ error: 'أنت مسجل بالفعل في هذا الكورس!' }, { status: 400 });
      }
    } else if (diplomaId) {
      const d = await prisma.diploma.findUnique({ where: { id: diplomaId } });
      if (!d) return NextResponse.json({ error: 'الدبلومة غير موجودة' }, { status: 404 });
      totalAmount = Math.max(0, d.price);
      title = d.title;

      // Check if already enrolled
      const existing = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          diplomaId,
          status: 'ACTIVE',
        }
      });
      if (existing) {
        return NextResponse.json({ error: 'أنت مسجل بالفعل في هذه الدبلومة!' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'يرجى تحديد المنتج المطلوب' }, { status: 400 });
    }

    // Atomic Checkout Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Re-validate coupon strictly inside transaction
      let discountAmount = 0;
      let appliedCoupon: any = null;

      if (couponId) {
        appliedCoupon = await tx.coupon.findUnique({ where: { id: couponId } });
        
        if (!appliedCoupon || !appliedCoupon.isActive) {
          throw new Error('كود الكوبون غير صالح أو غير متاح');
        }

        if (appliedCoupon.validUntil && new Date() > appliedCoupon.validUntil) {
          throw new Error('انتهت صلاحية هذا الكوبون');
        }

        if (appliedCoupon.usedCount >= appliedCoupon.maxUses) {
          throw new Error('تم استنفاد الحد الأقصى لاستخدام هذا الكوبون');
        }

        if (appliedCoupon.instructorId) {
          if (courseId) {
            const course = await tx.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
            if (!course || course.instructorId !== appliedCoupon.instructorId) {
              throw new Error('هذا الكوبون خاص بكورسات محاضر آخر ولا ينطبق على هذا الكورس');
            }
          } else if (bookId) {
            const book = await tx.digitalBook.findUnique({ where: { id: bookId }, select: { instructorId: true } });
            if (!book || book.instructorId !== appliedCoupon.instructorId) {
              throw new Error('هذا الكوبون خاص بمذكرات محاضر آخر ولا ينطبق على هذه المذكرة');
            }
          }
        }

        const userUsageCount = await tx.couponUsage.count({
          where: { couponId: appliedCoupon.id, userId: user.id }
        });

        if (userUsageCount >= appliedCoupon.perUserLimit) {
          throw new Error('لقد تجاوزت الحد الأقصى المسموح به لاستخدام هذا الكوبون');
        }

        if (appliedCoupon.discountType === 'PERCENTAGE') {
          discountAmount = (totalAmount * appliedCoupon.discountValue) / 100;
        } else if (appliedCoupon.discountType === 'FIXED') {
          discountAmount = Math.min(totalAmount, appliedCoupon.discountValue);
        } else if (appliedCoupon.discountType === 'FREE_100') {
          discountAmount = totalAmount;
        }
      }

      const finalAmount = Math.max(0, totalAmount - discountAmount);
      const isFree = finalAmount === 0;
      const orderNumber = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          courseId: courseId || null,
          diplomaId: diplomaId || null,
          bookId: bookId || null,
          totalAmount,
          discountAmount,
          finalAmount,
          couponId: appliedCoupon ? appliedCoupon.id : null,
          status: isFree ? 'COMPLETED' : 'PENDING',
        }
      });

      // 3. Increment coupon usage
      if (appliedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCoupon.id,
            userId: user.id,
            orderId: order.id,
          }
        });
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // 4. Handle Free Order Access
      if (isFree) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            userId: user.id,
            amount: 0,
            paymentMethod: 'COUPON_100',
            status: 'APPROVED',
            adminNotes: `تم التفعيل التلقائي (${appliedCoupon?.code || 'مجاني'})`,
          }
        });

        if (bookId) {
          await tx.bookPurchase.create({
            data: {
              userId: user.id,
              bookId,
              amountPaid: 0,
            }
          });
          await tx.digitalBook.update({
            where: { id: bookId },
            data: { salesCount: { increment: 1 } }
          });
        } else {
          await tx.enrollment.create({
            data: {
              userId: user.id,
              courseId: courseId || null,
              diplomaId: diplomaId || null,
              type: courseId ? 'COURSE' : 'DIPLOMA',
              status: 'ACTIVE',
              accessType: 'LIFETIME',
              progressPercent: 0,
            }
          });
        }

        await tx.notification.create({
          data: {
            userId: user.id,
            title: ' تم تفعيل اشتراكك بنجاح!',
            message: `تم فتح ${title} لك فوراً في حسابك. يمكنك الوصول إليها الآن.`,
            link: bookId ? '/dashboard/library' : '/dashboard',
            type: bookId ? 'SYSTEM' : 'COURSE',
          }
        });

        return {
          order,
          isFree: true,
          redirectUrl: bookId ? '/dashboard/library' : '/dashboard',
        };
      }

      // 5. Handle Paid Order
      if (!transactionId || transactionId.trim().length < 4) {
        throw new Error('يرجى إدخال رقم معاملة صحيح (Transaction ID لا يقل عن 4 أرقام)');
      }

      const cleanTxnId = transactionId.trim();
      const duplicateTxn = await tx.payment.findUnique({
        where: { transactionId: cleanTxnId }
      });

      if (duplicateTxn) {
        throw new Error('رقم المعاملة هذا مسجل مسبقاً في عملية دفع أخرى');
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          userId: user.id,
          amount: finalAmount,
          paymentMethod: paymentMethod || 'INSTAPAY',
          transactionId: cleanTxnId,
          senderPhone: senderPhone?.trim() || null,
          screenshotUrl: screenshotUrl || null,
          status: 'PENDING',
        }
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'تم استلام طلب التحويل المالي ',
          message: `طلب رقم ${order.orderNumber} قيد مراجعة وتأكيد الإدارة. سيتم فتح المحتوى تلقائياً فور التحقق.`,
          link: `/checkout/confirmation/${order.id}`,
          type: 'PAYMENT',
        }
      });

      return {
        order,
        isFree: false,
        redirectUrl: `/checkout/confirmation/${order.id}`,
      };
    });

    return NextResponse.json({
      success: true,
      isFree: result.isFree,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      redirectUrl: result.redirectUrl,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error?.message || 'فشلت معالجة الطلب' }, { status: 400 });
  }
}
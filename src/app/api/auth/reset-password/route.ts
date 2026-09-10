import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { token, email, newPassword } = await req.json();
    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف وأرقام' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);

    // Rate Limiting: 5 attempts per 10 minutes per IP + email
    const rateCheck = checkRateLimit(`reset_pw_${ip}_${cleanEmail}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة لاحقاً' }, { status: 429 });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      }
    });

    return NextResponse.json({ success: true, message: 'تم تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' }, { status: 500 });
  }
}
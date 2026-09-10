import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);

    // Rate Limiting: 3 forgot-password requests per 15 minutes per IP + email
    const rateCheck = checkRateLimit(`forgot_pw_${ip}_${cleanEmail}`, { limit: 3, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد محاولات طلب الاستعادة، يرجى الانتظار 15 دقيقة قبل المحاولة مرة أخرى.' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (user) {
      // Cryptographically secure random token (64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: expires,
        }
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      await sendEmail({
        to: user.email,
        recipientName: user.officialFullName,
        subject: 'إعادة تعيين كلمة المرور - أكاديمية قِمَم',
        templateType: 'PASSWORD_RESET',
        htmlContent: `
          <div dir="rtl" style="font-family: 'Cairo', Tahoma, sans-serif; background-color: #0f0f13; color: #fff; padding: 24px; border-radius: 8px;">
            <h2>طلب استعادة كلمة المرور</h2>
            <p>مرحباً ${user.officialFullName}، لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في أكاديمية قِمَم.</p>
            <p><a href="${resetUrl}" style="background-color: #7c3aed; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">اضغط هنا لتعيين كلمة مرور جديدة</a></p>
            <p style="color: #a1a1aa; font-size: 13px;">الرابط صالح لمدة ساعة واحدة فقط.</p>
          </div>
        `
      });
    }

    // Always return generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور خلال دقائق.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'حدث خطأ، يرجى المحاولة لاحقاً' }, { status: 500 });
  }
}
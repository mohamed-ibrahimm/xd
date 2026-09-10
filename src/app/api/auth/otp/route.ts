import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, code, fullName, role = 'STUDENT' } = body;

    if (!email) {
      return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = getClientIp(req);

    if (action === 'send') {
      // Rate Limiting: 3 OTP send requests per 10 minutes per IP + email
      const rateCheck = checkRateLimit(`otp_send_${ip}_${cleanEmail}`, { limit: 3, windowMs: 10 * 60 * 1000 });
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: 'تم تجاوز عدد محاولات إرسال كود التحقق. يرجى الانتظار 10 دقائق قبل إعادة المحاولة.' },
          { status: 429 }
        );
      }

      // Generate cryptographically secure 6-digit OTP code
      const otpCode = crypto.randomInt(100000, 1000000).toString();

      let user = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });

      // Prevent passwordless takeover of ADMIN accounts via OTP
      if (user && user.role === 'ADMIN') {
        return NextResponse.json(
          { error: 'حسابات الإدارة تتطلب تسجيل الدخول المباشر بكلمة المرور المشفرة.' },
          { status: 403 }
        );
      }

      const requestedRole = role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';
      const isInstructor = requestedRole === 'INSTRUCTOR';
      const now = new Date();
      const trialEndsAt = isInstructor ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) : null;

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerificationToken: otpCode,
            passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
          }
        });
      } else {
        // Create pending/new user record for passwordless OTP registration
        const nameParts = (fullName || cleanEmail.split('@')[0]).trim().split(/\s+/);
        const firstName = nameParts[0] || 'مستخدم';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'جديد';
        const randomSuffix = crypto.randomInt(100, 1000);
        const username = `${cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')}_${randomSuffix}`.slice(0, 30);
        const randomPassword = crypto.randomBytes(24).toString('hex');
        const defaultPasswordHash = await hashPassword(randomPassword);

        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            firstName,
            lastName,
            officialFullName: fullName?.trim() || `${firstName} ${lastName}`,
            username,
            passwordHash: defaultPasswordHash,
            role: requestedRole,
            isEmailVerified: false,
            emailVerificationToken: otpCode,
            passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
            instructorStatus: isInstructor ? 'TRIAL' : 'TRIAL',
            trialEndsAt,
            subscriptionPlan: isInstructor ? 'FREE_TRIAL' : 'FREE_TRIAL',
          }
        });
      }

      // Log only in non-production for local simulation
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV ONLY - OTP CODE FOR ${cleanEmail}]: ${otpCode}`);
      }

      // In production, never return the code to the client
      return NextResponse.json({
        success: true,
        message: `تم إرسال كود الدخول والتحقق إلى ${cleanEmail}`,
      });
    }

    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'يرجى إدخال كود التحقق المكون من 6 أرقام' }, { status: 400 });
      }

      // Rate Limiting: 5 verification attempts per 10 minutes per IP + email
      const verifyRateCheck = checkRateLimit(`otp_verify_${ip}_${cleanEmail}`, { limit: 5, windowMs: 10 * 60 * 1000 });
      if (!verifyRateCheck.allowed) {
        return NextResponse.json(
          { error: 'تم تجاوز عدد محاولات التحقق الخاطئة. يرجى طلب كود جديد بعد 10 دقائق.' },
          { status: 429 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });

      if (!user) {
        return NextResponse.json({ error: 'البريد الإلكتروني غير مسجل، يرجى طلب كود جديد' }, { status: 404 });
      }

      if (user.role === 'ADMIN') {
        return NextResponse.json({ error: 'حسابات الإدارة تتطلب تسجيل الدخول بكلمة المرور' }, { status: 403 });
      }

      // Check expiration first
      if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return NextResponse.json({ error: 'انتهت صلاحية كود التحقق، يرجى طلب كود جديد' }, { status: 400 });
      }

      if (!user.emailVerificationToken || user.emailVerificationToken !== code.trim()) {
        return NextResponse.json({ error: 'كود التحقق غير صحيح، يرجى التأكد وإعادة المحاولة' }, { status: 400 });
      }

      // Mark user as verified and clear OTP
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          passwordResetExpires: null,
        }
      });

      // Issue JWT session token
      const token = await createSessionToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        username: updatedUser.username,
        officialFullName: updatedUser.officialFullName,
      });

      const response = NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول وتأكيد الحساب بنجاح',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          username: updatedUser.username,
          officialFullName: updatedUser.officialFullName,
        },
        redirectTo: updatedUser.role === 'INSTRUCTOR' ? '/instructor' : updatedUser.role === 'ADMIN' ? '/admin' : '/dashboard',
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error: any) {
    console.error('OTP Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة كود التحقق' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      firstName,
      fatherName,
      lastName,
      officialFullName,
      username,
      email,
      phone,
      password,
    } = body;

    // Support single full name field if sent from streamlined form
    if (body.fullName && !firstName) {
      const parts = body.fullName.trim().split(/\s+/);
      firstName = parts[0] || 'مستخدم';
      lastName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || 'جديد';
      officialFullName = body.fullName.trim();
    }

    if (!username && email) {
      const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
      username = `${prefix}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`register_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد محاولات التسجيل المسموح بها، يرجى المحاولة بعد دقيقة' }, { status: 429 });
    }

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن لا تقل عن 8 أحرف وأرقام' }, { status: 400 });
    }

    // Check duplicate email or username safely
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase().trim() },
            { username: (username || '').toLowerCase().trim() }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email.toLowerCase() === email.toLowerCase().trim()) {
          return NextResponse.json({ error: 'البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول' }, { status: 400 });
        }
        return NextResponse.json({ error: 'اسم المستخدم محجوز بالفعل' }, { status: 400 });
      }
    } catch (_) {}

    const calculatedOfficialName = officialFullName?.trim() || `${firstName.trim()} ${fatherName ? fatherName.trim() + ' ' : ''}${lastName.trim()}`.trim();
    const passwordHash = await hashPassword(password);

    const requestedRole = body.role === 'INSTRUCTOR' ? 'INSTRUCTOR' : 'STUDENT';
    const isInstructor = requestedRole === 'INSTRUCTOR';
    const isStudentTrack = isInstructor && (body.track === 'student' || body.isStudentInstructor === true);
    const now = new Date();
    // Student Instructors get 30 days trial; Senior/Pro get 14 days
    const trialDays = isStudentTrack ? 30 : 14;
    const trialEndsAt = isInstructor ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const subscriptionPlan = isStudentTrack ? 'STUDENT_PRO' : (isInstructor ? 'FREE_TRIAL' : 'FREE_TRIAL');

    let user: any = null;
    try {
      user = await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          fatherName: fatherName?.trim() || null,
          lastName: lastName.trim(),
          officialFullName: calculatedOfficialName,
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          passwordHash,
          role: requestedRole,
          isStudentInstructor: isStudentTrack,
          studentVerificationStatus: isStudentTrack ? 'PENDING' : null,
          instructorStatus: isInstructor ? 'TRIAL' : 'TRIAL',
          trialEndsAt: trialEndsAt,
          subscriptionPlan: subscriptionPlan,
          isEmailVerified: true,
        }
      });
    } catch (createErr: any) {
      console.error('Database user creation failed in register route:', createErr);
      return NextResponse.json({ error: 'فشل إنشاء الحساب، يرجى التأكد من البيانات والمحاولة مرة أخرى' }, { status: 500 });
    }

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      officialFullName: user.officialFullName,
    });

    // Log audit safely
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          entity: 'USER',
          entityId: user.id,
          detailsJson: JSON.stringify({ email: user.email, role: user.role }),
        }
      });
    } catch (_) {}

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        officialFullName: user.officialFullName,
      },
      redirectTo: isInstructor ? '/instructor' : '/dashboard',
    });

    const proto = req.headers.get('x-forwarded-proto') || '';
    const reqUrl = new URL(req.url);
    const isHttps = proto === 'https' || reqUrl.protocol === 'https:';

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل. يرجى مراجعة البيانات والمحاولة مرة أخرى' }, { status: 400 });
  }
}
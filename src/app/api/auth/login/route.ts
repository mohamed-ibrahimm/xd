import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const loginIdentifier = (body.loginIdentifier || body.identifier || body.email || '').trim();
    const password = body.password || '';

    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: 'يرجى إدخال البريد الإلكتروني أو اسم المستخدم وكلمة المرور' }, { status: 400 });
    }

    const identifier = loginIdentifier.toLowerCase();
    const ip = getClientIp(req);

    // Rate Limiting: 5 attempts per minute per IP + identifier
    const rateCheck = checkRateLimit(`login_${ip}_${identifier}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد محاولات الدخول المسموح بها، يرجى الانتظار دقيقة والمحاولة مرة أخرى' },
        { status: 429 }
      );
    }

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });
    } catch (dbErr) {
      console.error('Database user lookup failed in login API:', dbErr);
      return NextResponse.json({ error: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً' }, { status: 500 });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      officialFullName: user.officialFullName,
    });

    // Record session safely
    try {
      await prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });
    } catch (_) {}

    // Record Audit safely
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          entity: 'USER',
          entityId: user.id,
          detailsJson: JSON.stringify({ role: user.role }),
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
        avatarUrl: user.avatarUrl,
      }
    });

    const proto = req.headers.get('x-forwarded-proto') || '';
    const reqUrl = new URL(req.url);
    const isHttps = proto === 'https' || reqUrl.protocol === 'https:';

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let identifier = '';
    let password = '';
    let callbackUrl = '';

    const reqUrl = new URL(req.url);
    let host = req.headers.get('x-forwarded-host') || req.headers.get('host') || reqUrl.host || 'localhost:3000';
    if (host.startsWith('0.0.0.0')) {
      host = host.replace('0.0.0.0', '192.168.100.2');
    }
    const proto = req.headers.get('x-forwarded-proto') || (reqUrl.protocol ? reqUrl.protocol.replace(':', '') : 'http');
    const origin = `${proto}://${host}`;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      identifier = (formData.get('identifier') as string || formData.get('loginIdentifier') as string || '').trim().toLowerCase();
      password = (formData.get('password') as string || '');
      callbackUrl = (formData.get('callbackUrl') as string || '').trim();
    } else {
      const body = await req.json();
      identifier = (body.identifier || body.loginIdentifier || '').trim().toLowerCase();
      password = (body.password || '');
      callbackUrl = (body.callbackUrl || '').trim();
    }

    if (!identifier || !password) {
      const loginUrl = new URL('/login?error=missing_credentials', origin);
      return NextResponse.redirect(loginUrl, 303);
    }

    const ip = getClientIp(req);

    // Rate Limiting: 5 attempts per minute per IP + identifier
    const rateCheck = checkRateLimit(`form_login_${ip}_${identifier}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      const rateLimitUrl = new URL('/login?error=rate_limited', origin);
      return NextResponse.redirect(rateLimitUrl, 303);
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
      console.error('Prisma lookup failed in form-login:', dbErr);
      const errUrl = new URL('/login?error=db_error', origin);
      return NextResponse.redirect(errUrl, 303);
    }

    if (!user || !user.passwordHash) {
      const loginUrl = new URL('/login?error=invalid_credentials', origin);
      return NextResponse.redirect(loginUrl, 303);
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      const loginUrl = new URL('/login?error=invalid_credentials', origin);
      return NextResponse.redirect(loginUrl, 303);
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

    let target = '/dashboard';
    if (user.role === 'ADMIN') target = '/admin';
    else if (user.role === 'INSTRUCTOR') target = '/instructor';
    
    // Prevent open redirects: target must start with / and not //
    if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') && !callbackUrl.startsWith('/login')) {
      target = callbackUrl;
    }

    const redirectUrl = new URL(target, origin);
    const response = NextResponse.redirect(redirectUrl, 303);

    const isHttps = reqUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Form login error:', error);
    const reqUrl = new URL(req.url);
    const loginUrl = new URL('/login?error=invalid_credentials', reqUrl.origin);
    return NextResponse.redirect(loginUrl, 303);
  }
}

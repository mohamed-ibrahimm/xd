import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return new Uint8Array(32); // Fallback empty buffer in edge if env missing to prevent crashes, will fail verification
    }
    return new TextEncoder().encode('qimam-dev-only-local-jwt-secret-not-for-production-use-2026');
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF Protection: For state-changing API mutations, verify Origin / Referer matches Host
  // Excludes OAuth callback endpoints which use signed state/nonce cryptographic tokens
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/social/callback')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const forwardedHost = request.headers.get('x-forwarded-host') || host;

    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && originHost !== forwardedHost) {
          return NextResponse.json({ error: 'رفض الطلب: فشل التحقق من مصدر الطلب (CSRF)' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'مصدر الطلب غير صالح' }, { status: 403 });
      }
    } else if (referer) {
      try {
        const refererHost = new URL(referer).host;
        if (refererHost !== host && refererHost !== forwardedHost) {
          return NextResponse.json({ error: 'رفض الطلب: فشل التحقق من مرجع الطلب (CSRF)' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'مرجع الطلب غير صالح' }, { status: 403 });
      }
    }
  }

  const token = request.cookies.get('qimam_session')?.value;

  let userRole: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      userRole = (payload as any)?.role || null;
    } catch (e) {}
  }

  // Admin Routes protection
  if (pathname.startsWith('/admin')) {
    if (!token || userRole !== 'ADMIN') {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }
  }

  // Instructor Routes protection (Allow /instructor/plans publicly)
  if (pathname.startsWith('/instructor') && pathname !== '/instructor/plans') {
    if (!token || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'unauthorized_instructor');
      return NextResponse.redirect(url);
    }
  }

  // Student Dashboard & Learning Routes protection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/learn') || pathname.startsWith('/checkout')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect /api/admin API routes
  if (pathname.startsWith('/api/admin')) {
    if (pathname.startsWith('/api/admin/courses')) {
      if (!token || (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR')) {
        return NextResponse.json({ error: 'غير مصرح: هذا الإجراء يتطلب صلاحيات المحاضر أو المدير' }, { status: 403 });
      }
    } else if (!token || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح: هذا الإجراء يتطلب صلاحيات مدير المنصة' }, { status: 403 });
    }
  }

  // Protect /api/instructor API routes
  if (pathname.startsWith('/api/instructor')) {
    if (!token || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) {
      return NextResponse.json({ error: 'غير مصرح: هذا الإجراء يتطلب صلاحيات المحاضر' }, { status: 403 });
    }
  }

  // Strictly block /api/setup-database in production, require ADMIN in dev
  if (pathname.startsWith('/api/setup-database')) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'هذا المسار معطل تماماً في بيئة الإنتاج' }, { status: 403 });
    }
    if (!token || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح: يتطلب صلاحيات المدير' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/dashboard/:path*',
    '/learn/:path*',
    '/checkout/:path*',
    '/api/:path*',
  ],
};
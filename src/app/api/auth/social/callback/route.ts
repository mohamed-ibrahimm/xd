import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  verifyOAuthState,
  consumeOAuthState,
  verifyGoogleCode,
  verifyApplePayload,
  verifyFacebookCode,
  authenticateOrProvisionSocialUser,
  OAUTH_STATE_COOKIE,
  SocialProvider,
  sanitizeCallbackUrl,
  VerifiedSocialProfile,
} from '@/lib/social-auth';
import { createSessionToken, verifySessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function handleSocialCallback(req: Request, provider: SocialProvider, params: {
  code?: string;
  state?: string;
  idToken?: string;
  rawUser?: string | null;
  error?: string;
  isJson?: boolean;
}) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`social_callback_${ip}`, { limit: 30, windowMs: 60 * 1000 });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'تم تجاوز عدد المحاولات، يرجى المحاولة بعد قليل' },
      { status: 429 }
    );
  }

  // 1. Check for provider-level errors (e.g. user cancelled login)
  if (params.error) {
    const safeErrorUrl = `/login?error=oauth_denied`;
    if (params.isJson) {
      return NextResponse.json({ error: 'تم إلغاء عملية تسجيل الدخول من قبل المزود', code: params.error }, { status: 400 });
    }
    return NextResponse.redirect(new URL(safeErrorUrl, req.url));
  }

  const { code, state, idToken, rawUser } = params;

  if (!state) {
    if (params.isJson) {
      return NextResponse.json({ error: 'رمز التحقق من الحالة (OAuth state) مفقود' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/login?error=missing_state', req.url));
  }

  // 2. Verify State and Nonce cookie against CSRF and Replay attacks
  const cookieHeader = req.headers.get('cookie') || '';
  const cookiesMap = Object.fromEntries(
    cookieHeader.split('; ').filter(Boolean).map(c => {
      const idx = c.indexOf('=');
      return [c.slice(0, idx), c.slice(idx + 1)];
    })
  );
  const stateCookie = cookiesMap[OAUTH_STATE_COOKIE];

  const statePayload = verifyOAuthState(stateCookie, state, provider);
  if (!statePayload) {
    const errorResponse = params.isJson
      ? NextResponse.json({ error: 'فشل التحقق الأمني: حالة الطلب غير صالحة أو منتهية الصلاحية (CSRF)' }, { status: 400 })
      : NextResponse.redirect(new URL('/login?error=invalid_oauth_state', req.url));

    // Clear state cookie on invalid attempt
    errorResponse.cookies.set(OAUTH_STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return errorResponse;
  }

  // Single-use guarantee: Invalidate state immediately in memory cache
  consumeOAuthState(state);

  // 3. Inspect if user is currently logged in (for safe account linking)
  const currentSessionCookie = cookiesMap[AUTH_COOKIE_NAME];
  let authenticatedUserId: string | null = null;
  if (currentSessionCookie) {
    const sessionData = await verifySessionToken(currentSessionCookie);
    if (sessionData?.userId) {
      authenticatedUserId = sessionData.userId;
    }
  }

  // 4. Exchange code and verify profile from provider
  let verifiedProfile: VerifiedSocialProfile;
  try {
    switch (provider) {
      case 'google': {
        if (!code) throw new Error('رمز المصادقة من جوجل مفقود');
        verifiedProfile = await verifyGoogleCode(code, req, statePayload.nonce);
        break;
      }
      case 'apple': {
        verifiedProfile = await verifyApplePayload({ code, idToken, rawUser }, req, statePayload.nonce);
        break;
      }
      case 'facebook': {
        if (!code) throw new Error('رمز المصادقة من فيسبوك مفقود');
        verifiedProfile = await verifyFacebookCode(code, req);
        break;
      }
      default:
        throw new Error('مزود تسجيل دخول غير مدعوم');
    }
  } catch (err: any) {
    console.error(`Error verifying ${provider} OAuth credentials:`, err.message);
    const failUrl = `/login?error=oauth_verification_failed`;
    const response = params.isJson
      ? NextResponse.json({ error: err.message || 'فشل التحقق من بيانات الحساب الاجتماعي' }, { status: 400 })
      : NextResponse.redirect(new URL(failUrl, req.url));

    // Single-use: Always destroy state cookie to prevent replays
    response.cookies.set(OAUTH_STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return response;
  }

  // 5. Authenticate, link, or provision user in database
  let authenticatedUser;
  try {
    authenticatedUser = await authenticateOrProvisionSocialUser(verifiedProfile, authenticatedUserId);
  } catch (err: any) {
    console.error('Social User Provisioning Error:', err.message);
    const failUrl = `/login?error=oauth_provisioning_failed`;
    const response = params.isJson
      ? NextResponse.json({ error: err.message || 'فشل تسجيل أو ربط الحساب' }, { status: 409 })
      : NextResponse.redirect(new URL(failUrl, req.url));

    response.cookies.set(OAUTH_STATE_COOKIE, '', { maxAge: 0, path: '/' });
    return response;
  }

  // 6. Generate Session Token
  const sessionToken = await createSessionToken({
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    username: authenticatedUser.username,
    officialFullName: authenticatedUser.officialFullName,
  });

  // 7. Calculate target redirect URL securely
  let targetUrl = sanitizeCallbackUrl(statePayload.callbackUrl);
  if (authenticatedUser.role === 'ADMIN' && targetUrl === '/dashboard') {
    targetUrl = '/admin';
  } else if (authenticatedUser.role === 'INSTRUCTOR' && targetUrl === '/dashboard') {
    targetUrl = '/instructor';
  }

  // 8. Build success response
  const redirectTarget = new URL(targetUrl, req.url);
  const response = params.isJson
    ? NextResponse.json({
        success: true,
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          username: authenticatedUser.username,
          officialFullName: authenticatedUser.officialFullName,
        },
        redirectTo: targetUrl,
      })
    : NextResponse.redirect(redirectTarget, { status: 302 });

  // Set Session Cookie
  response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  // Single-use: Destroy OAuth state cookie to prevent replay
  response.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = (url.searchParams.get('provider')?.toLowerCase() || 'google') as SocialProvider;
  const code = url.searchParams.get('code') || undefined;
  const state = url.searchParams.get('state') || undefined;
  const error = url.searchParams.get('error') || undefined;
  const isJson = url.searchParams.get('format') === 'json';

  return handleSocialCallback(req, provider, {
    code,
    state,
    error,
    isJson,
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  let provider = (url.searchParams.get('provider')?.toLowerCase() || '') as SocialProvider;

  let code: string | undefined;
  let state: string | undefined;
  let idToken: string | undefined;
  let rawUser: string | null = null;
  let error: string | undefined;
  let isJson = false;

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    code = (formData.get('code') as string) || undefined;
    state = (formData.get('state') as string) || undefined;
    idToken = (formData.get('id_token') as string) || undefined;
    rawUser = (formData.get('user') as string) || null;
    error = (formData.get('error') as string) || undefined;
    if (!provider) provider = 'apple';
  } else if (contentType.includes('application/json')) {
    const body = await req.json();
    code = body.code;
    state = body.state;
    idToken = body.id_token || body.idToken;
    rawUser = body.user ? JSON.stringify(body.user) : null;
    error = body.error;
    if (body.provider) provider = body.provider.toLowerCase();
    isJson = true;
  }

  if (!provider || !['google', 'apple', 'facebook'].includes(provider)) {
    provider = 'apple';
  }

  return handleSocialCallback(req, provider, {
    code,
    state,
    idToken,
    rawUser,
    error,
    isJson,
  });
}

import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  generateSignedOAuthState,
  getAuthorizationUrl,
  getProviderConfig,
  getAppBaseUrl,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  SocialProvider,
  sanitizeCallbackUrl,
  ProviderConfigurationError
} from '@/lib/social-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`social_init_${ip}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز عدد محاولات الاتصال، يرجى المحاولة بعد دقيقة' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const providerParam = searchParams.get('provider')?.toLowerCase() as SocialProvider;
    const rawCallbackUrl = searchParams.get('callbackUrl');
    const returnJson = searchParams.get('json') === 'true' || searchParams.get('format') === 'json';

    if (!providerParam || !['google', 'apple', 'facebook'].includes(providerParam)) {
      return NextResponse.json(
        { error: 'مزود تسجيل الدخول غير مدعوم. المزودات المدعومة: google, apple, facebook' },
        { status: 400 }
      );
    }

    const callbackUrl = sanitizeCallbackUrl(rawCallbackUrl);
    const { state, nonce, cookieValue } = generateSignedOAuthState(providerParam, callbackUrl);

    let authUrl: string;
    try {
      authUrl = getAuthorizationUrl(providerParam, state, nonce, req);
    } catch (err: any) {
      if (err instanceof ProviderConfigurationError || err.code === 'PROVIDER_NOT_CONFIGURED') {
        const config = getProviderConfig(providerParam, req);
        const providerDisplayName = providerParam === 'google' ? 'Google' : providerParam === 'apple' ? 'Apple' : 'Facebook';
        const userMessage = `خدمة تسجيل الدخول عبر ${providerDisplayName} غير مهيأة بعد على هذا الخادم. يرجى تهيئة بيانات الاعتماد أو استخدام البريد وكلمة المرور.`;

        if (returnJson) {
          return NextResponse.json({
            success: false,
            error: userMessage,
            code: 'PROVIDER_NOT_CONFIGURED',
            provider: providerParam,
            missingFields: config.missingInitiateFields.length > 0 ? config.missingInitiateFields : config.missingFields,
            expectedRedirectUri: config.redirectUri,
          }, { status: 503 });
        }

        const safeRedirect = new URL('/login', getAppBaseUrl(req));
        safeRedirect.searchParams.set('error', 'oauth_provider_not_configured');
        safeRedirect.searchParams.set('provider', providerParam);
        return NextResponse.redirect(safeRedirect);
      }
      throw err;
    }

    if (returnJson) {
      const jsonResponse = NextResponse.json({
        success: true,
        provider: providerParam,
        authUrl,
        authorizationUrl: authUrl,
        state,
      });

      jsonResponse.cookies.set(OAUTH_STATE_COOKIE, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: OAUTH_STATE_MAX_AGE,
        path: '/',
      });

      return jsonResponse;
    }

    const redirectResponse = NextResponse.redirect(authUrl, { status: 302 });
    redirectResponse.cookies.set(OAUTH_STATE_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: OAUTH_STATE_MAX_AGE,
      path: '/',
    });

    return redirectResponse;
  } catch (error: any) {
    console.error('Social Auth Initiate Error:', error);
    return NextResponse.json({ error: 'فشل بدء عملية تسجيل الدخول الاجتماعي' }, { status: 500 });
  }
}

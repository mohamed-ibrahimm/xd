import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Legacy Social Endpoint:
 * For production-grade security, client-side unverified social payloads are disallowed.
 * Callers are redirected to the standardized OAuth initiate flow: /api/auth/social/initiate.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`legacy_social_${ip}`, { limit: 10, windowMs: 60 * 1000 });
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'تم تجاوز عدد المحاولات، يرجى المحاولة لاحقاً' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const provider = (body.provider || 'google').toLowerCase();

    return NextResponse.json({
      error: 'يرجى استخدام مسار المصادقة الآمن للمزود عبر /api/auth/social/initiate',
      initiateUrl: `/api/auth/social/initiate?provider=${encodeURIComponent(provider)}`,
    }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 403 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider') || 'google';
  return NextResponse.redirect(new URL(`/api/auth/social/initiate?provider=${encodeURIComponent(provider)}`, req.url));
}

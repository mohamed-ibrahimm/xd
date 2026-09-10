import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve list of linked social identities for the current user
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 });
    }

    const identities = await prisma.authIdentity.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        provider: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      identities,
    });
  } catch (error: any) {
    console.error('Fetch linked identities error:', error);
    return NextResponse.json({ error: 'فشل استرجاع الحسابات المرتبطة' }, { status: 500 });
  }
}

/**
 * DELETE: Unlink a specific social identity
 */
export async function DELETE(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`unlink_${ip}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'تجاوزت الحد المسموح من المحاولات' }, { status: 429 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح: يجب تسجيل الدخول' }, { status: 401 });
    }

    const { provider } = await req.json();
    if (!provider || !['GOOGLE', 'APPLE', 'FACEBOOK'].includes(provider.toUpperCase())) {
      return NextResponse.json({ error: 'مزود تسجيل الدخول غير صالح' }, { status: 400 });
    }

    const normalizedProvider = provider.toUpperCase();

    // Check if identity exists
    const identity = await prisma.authIdentity.findFirst({
      where: {
        userId: user.id,
        provider: normalizedProvider,
      },
    });

    if (!identity) {
      return NextResponse.json({ error: 'هذا المزود غير مرتبط بحسابك' }, { status: 404 });
    }

    await prisma.authIdentity.delete({
      where: { id: identity.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AUTH_IDENTITY_UNLINKED',
        entity: 'AUTH_IDENTITY',
        entityId: identity.id,
        detailsJson: JSON.stringify({ provider: normalizedProvider }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم إلغاء ربط حساب ${normalizedProvider} بنجاح`,
    });
  } catch (error: any) {
    console.error('Unlink identity error:', error);
    return NextResponse.json({ error: 'فشل إلغاء ربط الحساب' }, { status: 500 });
  }
}

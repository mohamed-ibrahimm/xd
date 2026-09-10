import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');

    const notes = await prisma.studentNote.findMany({
      where: {
        userId: user.id,
        ...(lessonId ? { lessonId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json({ error: 'فشل جلب الملاحظات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`notes:${user.id}:${clientIp}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز الحد المسموح به من الملاحظات. يرجى الانتظار قليلاً.' }, { status: 429 });
    }

    const { lessonId, timestampSeconds, content } = await req.json();
    if (!lessonId || !content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'محتوى الملاحظة طويل جداً (الحد الأقصى 5000 حرف)' }, { status: 400 });
    }

    const note = await prisma.studentNote.create({
      data: {
        userId: user.id,
        lessonId,
        timestampSeconds: timestampSeconds || 0,
        content: content.trim(),
      }
    });

    return NextResponse.json({ success: true, note });
  } catch (e) {
    return NextResponse.json({ error: 'فشل حفظ الملاحظة' }, { status: 500 });
  }
}
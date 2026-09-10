import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get('id');

    if (ticketId) {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: { select: { officialFullName: true, email: true } },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { officialFullName: true, role: true } } }
          }
        }
      });

      if (!ticket) {
        return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 });
      }

      // SECURITY: Ensure user owns ticket or is ADMIN
      if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
        return NextResponse.json({ error: 'غير مصرح لك بالاطلاع على هذه التذكرة' }, { status: 403 });
      }

      return NextResponse.json({ ticket });
    }

    const where = user.role === 'ADMIN' ? {} : { userId: user.id };
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { officialFullName: true, email: true } },
        _count: { select: { messages: true } }
      }
    });

    return NextResponse.json({ tickets });
  } catch (e) {
    return NextResponse.json({ error: 'فشل جلب التذاكر' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`support_post:${user.id}:${clientIp}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد التذاكر المسموح بإنشائها مؤقتاً. يرجى الانتظار.' }, { status: 429 });
    }

    const { subject, category, priority, message } = await req.json();
    if (!subject || !message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'يرجى كتابة عنوان وتفاصيل التذكرة' }, { status: 400 });
    }

    const ticketNumber = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.id,
        subject: subject.trim().slice(0, 200),
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      }
    });

    // Add first message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        senderRole: user.role,
        message: message.trim().slice(0, 5000),
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    return NextResponse.json({ error: 'فشل إنشاء التذكرة' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`support_put:${user.id}:${clientIp}`, { limit: 20, windowMs: 5 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز الحد المسموح به من الردود. يرجى الانتظار قليلاً.' }, { status: 429 });
    }

    const { ticketId, message, status } = await req.json();
    if (!ticketId) return NextResponse.json({ error: 'معرف التذكرة مطلوب' }, { status: 400 });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'التذكرة غير موجودة' }, { status: 404 });
    }

    // SECURITY: Ensure user owns ticket or is ADMIN before allowing updates
    if (user.role !== 'ADMIN' && ticket.userId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذه التذكرة' }, { status: 403 });
    }

    if (message) {
      await prisma.ticketMessage.create({
        data: {
          ticketId,
          senderId: user.id,
          senderRole: user.role,
          message: message.trim(),
        }
      });
    }

    if (status) {
      // Non-admins can only change status to CLOSED
      const safeStatus = user.role === 'ADMIN' ? status : 'CLOSED';
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: safeStatus, updatedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'فشل تحديث التذكرة' }, { status: 500 });
  }
}
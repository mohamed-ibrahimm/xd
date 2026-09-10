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
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // SECURITY: Check conversation ownership before returning messages (Prevent IDOR)
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!conv) {
        return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 });
      }

      if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR' && conv.studentId !== user.id) {
        return NextResponse.json({ error: 'غير مصرح لك بالاطلاع على هذه المحادثة' }, { status: 403 });
      }

      const messages = await prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, officialFullName: true, role: true, avatarUrl: true } }
        }
      });
      return NextResponse.json({ messages });
    }

    // List conversations
    let conversations = [];
    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      conversations = await prisma.conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: {
          student: { select: { id: true, officialFullName: true, email: true, username: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } }
        }
      });
    } else {
      // Find or create student conversation
      let conv = await prisma.conversation.findFirst({
        where: { studentId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { officialFullName: true, role: true } } }
          }
        }
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            studentId: user.id,
          },
          include: {
            messages: {
              include: { sender: { select: { officialFullName: true, role: true } } }
            }
          }
        });
      }

      return NextResponse.json({ conversation: conv });
    }

    return NextResponse.json({ conversations });
  } catch (e) {
    return NextResponse.json({ error: 'فشل جلب الرسائل' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`chat:${user.id}:${clientIp}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'تم تجاوز الحد المسموح به من الرسائل. يرجى الانتظار قليلاً.' }, { status: 429 });
    }

    const { conversationId, message, attachments } = await req.json();
    if (!conversationId || !message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'نص الرسالة مطلوب' }, { status: 400 });
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: 'نص الرسالة طويل جداً (الحد الأقصى 4000 حرف)' }, { status: 400 });
    }

    // SECURITY: Check conversation ownership before posting (Prevent IDOR message injection)
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conv) {
      return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR' && conv.studentId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بالإرسال في هذه المحادثة' }, { status: 403 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        senderRole: user.role,
        message: message.trim(),
        attachmentsJson: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        sender: { select: { id: true, officialFullName: true, role: true } }
      }
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadAdminCount: user.role === 'STUDENT' ? { increment: 1 } : undefined,
        unreadStudentCount: user.role !== 'STUDENT' ? { increment: 1 } : undefined,
      }
    });

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (e) {
    return NextResponse.json({ error: 'فشل إرسال الرسالة' }, { status: 500 });
  }
}
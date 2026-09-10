import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, fatherName, lastName, officialFullName, phone, bio, avatarUrl, currentPassword, newPassword } = body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (fatherName !== undefined) updateData.fatherName = fatherName ? fatherName.trim() : null;
    if (lastName) updateData.lastName = lastName.trim();
    if (officialFullName) updateData.officialFullName = officialFullName.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
    if (avatarUrl !== undefined) {
      const cleanAvatar = avatarUrl ? avatarUrl.trim() : null;
      if (cleanAvatar && !cleanAvatar.startsWith('/uploads/') && !cleanAvatar.startsWith('https://') && !cleanAvatar.startsWith('http://') && !cleanAvatar.startsWith('data:image/')) {
        return NextResponse.json({ error: 'رابط الصورة الرمزية غير صالح' }, { status: 400 });
      }
      updateData.avatarUrl = cleanAvatar;
    }

    // Change Password if requested
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف وأرقام' }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: 'يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور' }, { status: 400 });
      }
      const fullUser = await prisma.user.findUnique({ where: { id: currentUser.id } });
      if (!fullUser || !(await verifyPassword(currentPassword, fullUser.passwordHash))) {
        return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        fatherName: true,
        lastName: true,
        officialFullName: true,
        username: true,
        phone: true,
        avatarUrl: true,
        bio: true,
      }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'فشل تحديث البيانات' }, { status: 500 });
  }
}
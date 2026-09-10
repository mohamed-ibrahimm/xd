import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        isStudentInstructor: true,
        studentVerificationStatus: true,
        studentUniversity: true,
        studentFaculty: true,
        studentStudyYear: true,
        studentBirthDate: true,
        studentIdCardUrl: true,
        studentNationalIdUrl: true,
        studentVerificationNote: true,
        trialEndsAt: true,
        subscriptionPlan: true,
      }
    });

    return NextResponse.json({ success: true, studentData: userData });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'فشل جلب بيانات التوثيق' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const body = await req.json();
    const {
      university,
      faculty,
      studyYear,
      birthDate,
      studentIdCardUrl,
      nationalIdUrl,
    } = body;

    if (!university?.trim() || !faculty?.trim() || !studyYear?.trim() || !birthDate || !studentIdCardUrl) {
      return NextResponse.json({ error: 'يرجى إكمال جميع الحقول ورفع مستند إثبات الدراسة الحالي (كارنيه، جدول، أو إثبات قيد)' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { studentVerificationStatus: true, trialEndsAt: true }
    });

    if (currentUser?.studentVerificationStatus === 'APPROVED') {
      return NextResponse.json({ error: 'تم توثيق حسابك مسبقاً.' }, { status: 400 });
    }

    if (currentUser?.studentVerificationStatus === 'PENDING') {
      return NextResponse.json({ error: 'طلب التوثيق الخاص بك قيد المراجعة حالياً من قبل الإدارة.' }, { status: 400 });
    }

    const isValidDocUrl = (url: string) => url.startsWith('/uploads/') || url.startsWith('https://');
    if (!isValidDocUrl(studentIdCardUrl)) {
      return NextResponse.json({ error: 'رابط صورة الكارنيه غير صالح' }, { status: 400 });
    }
    if (nationalIdUrl && !isValidDocUrl(nationalIdUrl)) {
      return NextResponse.json({ error: 'رابط صورة بطاقة الرقم القومي غير صالح' }, { status: 400 });
    }

    // Strict Age Verification: Max 23 Years Old
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return NextResponse.json({ error: 'تاريخ الميلاد غير صالح' }, { status: 400 });
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // Fetch dynamic max age and trial days from settings
    const dbSettings = await prisma.platformSetting.findMany({
      where: { key: { in: ['STUDENT_MAX_AGE', 'STUDENT_TRIAL_DAYS'] } }
    });
    const settingsMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));
    const maxAge = Number(settingsMap['STUDENT_MAX_AGE']) || 22;
    const trialDays = Number(settingsMap['STUDENT_TRIAL_DAYS']) || 30;

    if (age > maxAge) {
      return NextResponse.json({
        error: `عذراً، باقة الطالب مخصصة لطلبة الجامعات والمدارس حتى سن ${maxAge} سنة (عمرك المسجل: ${age} سنة). يمكنك الاشتراك في باقة المدرسين والدكاترة العادية.`
      }, { status: 400 });
    }

    if (age < 12) {
      return NextResponse.json({ error: 'تاريخ الميلاد المدخل غير منطقي' }, { status: 400 });
    }

    // Only grant free trial if user has never received one before
    const trialDaysFromNow = currentUser?.trialEndsAt 
      ? currentUser.trialEndsAt 
      : new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isStudentInstructor: true,
        studentVerificationStatus: 'PENDING',
        studentUniversity: university.trim(),
        studentFaculty: faculty.trim(),
        studentStudyYear: studyYear.trim(),
        studentBirthDate: birth,
        studentIdCardUrl: studentIdCardUrl.trim(),
        studentNationalIdUrl: nationalIdUrl?.trim() || null,
        instructorStatus: 'TRIAL',
        trialEndsAt: trialDaysFromNow,
        subscriptionPlan: 'STUDENT_PRO',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك وتفعيل شهر كامل (30 يوماً مجاناً) في استوديو المحاضر بنجاح! سيتم مراجعة الكارنيه وتأكيد شارة التوثيق.',
      user: {
        isStudentInstructor: updatedUser.isStudentInstructor,
        studentVerificationStatus: updatedUser.studentVerificationStatus,
        trialEndsAt: updatedUser.trialEndsAt,
      }
    });
  } catch (e: any) {
    console.error('Student verification submission error:', e);
    return NextResponse.json({ error: e?.message || 'فشل إرسال طلب التوثيق' }, { status: 500 });
  }
}

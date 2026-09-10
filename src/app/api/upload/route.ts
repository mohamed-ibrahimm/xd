import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SAFE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const INSTRUCTOR_ALLOWED_TYPES = [
  ...SAFE_IMAGE_TYPES,
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  switch (mimeType) {
    case 'image/jpeg':
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    case 'image/webp':
      return (
        buffer.length >= 12 &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    case 'application/pdf':
      return buffer.toString('ascii', 0, 4) === '%PDF';
    case 'video/mp4':
    case 'video/quicktime':
      return (
        buffer.length >= 8 &&
        (buffer.toString('ascii', 4, 8) === 'ftyp' ||
          buffer.toString('ascii', 4, 8) === 'moov' ||
          buffer.toString('ascii', 4, 8) === 'wide')
      );
    case 'video/webm':
      return (
        buffer.length >= 4 &&
        buffer[0] === 0x1a &&
        buffer[1] === 0x45 &&
        buffer[2] === 0xdf &&
        buffer[3] === 0xa3
      );
    default:
      return false;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لرفع الملفات' }, { status: 401 });
    }

    // Rate Limiting: 10 uploads per minute per user
    const rateCheck = checkRateLimit(`upload_${user.id}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'تم تجاوز عدد مرات رفع الملفات المسموح بها في الدقيقة' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم استلام أي ملف' }, { status: 400 });
    }

    const isStudent = user.role === 'STUDENT';
    const isPrivileged = user.role === 'INSTRUCTOR' || user.role === 'ADMIN';

    // 1. Validate allowed MIME types by role
    const allowedTypes = isStudent ? SAFE_IMAGE_TYPES : (isPrivileged ? INSTRUCTOR_ALLOWED_TYPES : []);

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: isStudent
          ? 'غير مصرح للطلاب إلا برفع صور الحساب الشخصي (JPG, PNG, WebP) فقط'
          : 'نوع الملف غير مدعوم. الأنواع المدعومة: صور JPG/PNG/WebP، مستندات PDF، وملفات فيديو MP4/WebM',
      }, { status: 400 });
    }

    // 2. Enforce strict size limits
    const isVideo = file.type.startsWith('video/');
    const MAX_SIZE = isStudent
      ? 2 * 1024 * 1024 // 2 MB for student avatars
      : isVideo
      ? 500 * 1024 * 1024 // 500 MB for instructor videos
      : 25 * 1024 * 1024; // 25 MB for instructor docs/images

    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: isStudent
          ? 'الحد الأقصى لصورة الحساب هو 2 ميجابايت'
          : isVideo
          ? 'حجم الفيديو يتجاوز الحد الأقصى المسموح (500 ميجابايت)'
          : 'حجم الملف يتجاوز الحد الأقصى المسموح (25 ميجابايت)',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes to prevent MIME spoofing and disguised executables
    const isValidSignature = validateMagicBytes(buffer, file.type);
    if (!isValidSignature) {
      return NextResponse.json({
        error: 'محتوى الملف غير صالح أو لا يتطابق مع نوعه المصرّح به',
      }, { status: 400 });
    }

    // 3. Sanitize folder name and enforce student isolation
    const safeFolder = isStudent
      ? 'avatars'
      : requestedFolder.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'general';

    // 4. Determine verified file extension from MIME type to prevent extension spoofing
    const extension = MIME_EXTENSION_MAP[file.type] || '.png';
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const fileName = `${Date.now()}-${randomSuffix}${extension}`;

    // Try saving to public/uploads
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeFolder}/${fileName}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
        type: file.type,
      });
    } catch (fsError) {
      console.warn('Filesystem write failed, using data URI fallback:', fsError);
      const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName,
        size: file.size,
        type: file.type,
      });
    }
  } catch (error: any) {
    console.error('File upload route error:', error);
    return NextResponse.json({ error: 'فشل رفع الملف، يرجى المحاولة مرة أخرى' }, { status: 500 });
  }
}

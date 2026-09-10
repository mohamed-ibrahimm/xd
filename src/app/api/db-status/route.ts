import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  const isAdmin = user && user.role === 'ADMIN';

  let dbConnected = false;
  let userCount = 0;
  let courseCount = 0;
  let diplomaCount = 0;
  let bookCount = 0;

  try {
    userCount = await prisma.user.count();
    courseCount = await prisma.course.count();
    diplomaCount = await prisma.diploma.count();
    bookCount = await prisma.digitalBook.count();
    dbConnected = true;
  } catch (err: any) {
    dbConnected = false;
  }

  // Public sanitized response
  if (!isAdmin) {
    return NextResponse.json({
      status: dbConnected ? 'ok' : 'database_unavailable',
      connected: dbConnected,
      timestamp: new Date().toISOString(),
    }, { status: dbConnected ? 200 : 503 });
  }

  // Privileged diagnostic response for Admin only
  return NextResponse.json({
    status: dbConnected ? 'ok' : 'database_error',
    database: {
      connected: dbConnected,
      hasDatabaseUrlEnv: Boolean(process.env.DATABASE_URL),
      hasJwtSecretEnv: Boolean(process.env.JWT_SECRET),
      counts: {
        users: userCount,
        courses: courseCount,
        diplomas: diplomaCount,
        books: bookCount,
      }
    },
    timestamp: new Date().toISOString(),
  });
}
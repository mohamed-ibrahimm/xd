import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let isDbOk = false;

  try {
    // Lightweight DB check
    await prisma.$queryRaw`SELECT 1`;
    isDbOk = true;
  } catch (err) {
    try {
      await prisma.user.count();
      isDbOk = true;
    } catch {
      isDbOk = false;
    }
  }

  const statusCode = isDbOk ? 200 : 503;

  return NextResponse.json(
    {
      status: isDbOk ? 'ok' : 'service_degraded',
      services: {
        database: isDbOk ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

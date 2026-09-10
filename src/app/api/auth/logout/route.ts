import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function invalidateSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      await prisma.userSession.deleteMany({ where: { token } });
    }
  } catch (_) {}
}

export async function POST() {
  await invalidateSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export async function GET(request: Request) {
  await invalidateSession();
  const url = new URL('/login', request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
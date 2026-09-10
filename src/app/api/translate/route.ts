import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const texts: string[] = Array.isArray(body.texts)
      ? body.texts
      : typeof body.text === 'string'
      ? [body.text]
      : [];

    const translations: Record<string, string> = {};
    for (const text of texts) {
      translations[text] = text;
    }

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: {} });
  }
}

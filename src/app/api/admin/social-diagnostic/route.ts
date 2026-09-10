import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSocialConfigDiagnostic } from '@/lib/social-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // In production, require ADMIN authentication.
    // In development mode, allow diagnostic inspect for setup verification.
    const isDev = process.env.NODE_ENV !== 'production';

    if (!isDev) {
      try {
        await requireAuth(['ADMIN']);
      } catch (authErr: any) {
        return NextResponse.json(
          { error: 'غير مصرح لك بالوصول إلى لوحة التشخيص', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
    }

    const diagnostic = getSocialConfigDiagnostic(req);

    return NextResponse.json(
      {
        success: true,
        ...diagnostic,
        instructions: {
          google: {
            consoleUrl: 'https://console.cloud.google.com/apis/credentials',
            authorizedRedirectUris: [diagnostic.providers.google.expectedRedirectUri],
            requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
          },
          apple: {
            developerUrl: 'https://developer.apple.com/account/resources/identifiers/list/serviceId',
            authorizedRedirectUris: [diagnostic.providers.apple.expectedRedirectUri],
            requiredEnvVars: ['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY'],
          },
          facebook: {
            developersUrl: 'https://developers.facebook.com/apps',
            validOAuthRedirectUris: [diagnostic.providers.facebook.expectedRedirectUri],
            requiredEnvVars: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
          },
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Social Diagnostic Error:', error);
    return NextResponse.json(
      { error: 'فشل فحص تشخيص المصادقة الاجتماعية' },
      { status: 500 }
    );
  }
}

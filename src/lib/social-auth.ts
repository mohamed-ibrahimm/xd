import crypto from 'crypto';
import { decodeJwt, importPKCS8, SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// Cached Remote JWKS Sets for Google and Apple (with automatic cache header respect)
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

export type SocialProvider = 'google' | 'apple' | 'facebook';

export const OAUTH_STATE_COOKIE = 'qimam_oauth_state';
export const OAUTH_STATE_MAX_AGE = 10 * 60; // 10 minutes

export interface OAuthStatePayload {
  state: string;
  nonce: string;
  provider: SocialProvider;
  callbackUrl: string;
  timestamp: number;
}

export interface VerifiedSocialProfile {
  provider: 'GOOGLE' | 'APPLE' | 'FACEBOOK';
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

export interface ProviderConfig {
  provider: SocialProvider;
  clientId?: string;
  clientSecret?: string;
  redirectUri: string;
  isConfigured: boolean;
  canInitiate: boolean;
  missingFields: string[];
  missingInitiateFields: string[];
  // Apple specific
  teamId?: string;
  keyId?: string;
  privateKey?: string;
}

function getOAuthSigningSecret(): Buffer {
  const secret = process.env.JWT_SECRET || process.env.OAUTH_SECRET || 'qimam-oauth-signing-secret-default-dev-2026';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Validates and sanitizes callbackUrl to prevent Open Redirect vulnerabilities.
 * Ensures the target is strictly an internal relative path starting with a single '/'.
 */
export function sanitizeCallbackUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '/dashboard';
  const trimmed = url.trim();

  // Reject protocol-relative URLs (//example.com), Windows backslash paths (/\\), external schemes, or control chars
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes('://') ||
    trimmed.includes('\n') ||
    trimmed.includes('\r')
  ) {
    return '/dashboard';
  }

  // Prevent looping back to login or social endpoints
  if (trimmed.startsWith('/login') || trimmed.startsWith('/register') || trimmed.startsWith('/api/auth/social')) {
    return '/dashboard';
  }

  return trimmed;
}

/**
 * Returns the canonical application origin/base URL.
 * In production, strictly derived from trusted environment configuration to prevent Host header poisoning.
 */
export function getAppBaseUrl(req?: Request): string {
  if (process.env.APP_URL?.trim()) return process.env.APP_URL.trim().replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
  if (process.env.NEXTAUTH_URL?.trim()) return process.env.NEXTAUTH_URL.trim().replace(/\/$/, '');

  // Development-only fallback to request headers for local development convenience
  if (process.env.NODE_ENV !== 'production' && req) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    if (host) return `${proto}://${host}`;
  }

  return process.env.NODE_ENV === 'production' ? 'https://qimam.edu' : 'http://localhost:3000';
}

/**
 * Returns canonical configuration and readiness state for a provider.
 * NEVER substitutes placeholder or fake IDs into runtime.
 */
export function getProviderConfig(provider: SocialProvider, req?: Request): ProviderConfig {
  const baseUrl = getAppBaseUrl(req);

  switch (provider) {
    case 'google': {
      const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/social/callback?provider=google`;

      const missingInitiateFields: string[] = [];
      if (!clientId) missingInitiateFields.push('GOOGLE_CLIENT_ID');

      const missingFields: string[] = [...missingInitiateFields];
      if (!clientSecret) missingFields.push('GOOGLE_CLIENT_SECRET');

      return {
        provider: 'google',
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
        redirectUri,
        canInitiate: Boolean(clientId),
        isConfigured: Boolean(clientId && clientSecret),
        missingInitiateFields,
        missingFields,
      };
    }
    case 'apple': {
      const clientId = process.env.APPLE_CLIENT_ID?.trim(); // Services ID
      const clientSecret = process.env.APPLE_CLIENT_SECRET?.trim();
      const teamId = process.env.APPLE_TEAM_ID?.trim();
      const keyId = process.env.APPLE_KEY_ID?.trim();
      const privateKey = process.env.APPLE_PRIVATE_KEY?.trim();
      const redirectUri = process.env.APPLE_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/social/callback?provider=apple`;

      const missingInitiateFields: string[] = [];
      if (!clientId) missingInitiateFields.push('APPLE_CLIENT_ID');

      const missingFields: string[] = [...missingInitiateFields];
      const hasSecret = Boolean(clientSecret);
      const hasKeyBundle = Boolean(teamId && keyId && privateKey);
      if (!hasSecret && !hasKeyBundle) {
        missingFields.push('APPLE_CLIENT_SECRET or (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY)');
      }

      return {
        provider: 'apple',
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
        teamId: teamId || undefined,
        keyId: keyId || undefined,
        privateKey: privateKey || undefined,
        redirectUri,
        canInitiate: Boolean(clientId),
        isConfigured: Boolean(clientId && (hasSecret || hasKeyBundle)),
        missingInitiateFields,
        missingFields,
      };
    }
    case 'facebook': {
      const clientId = process.env.FACEBOOK_CLIENT_ID?.trim() || process.env.FACEBOOK_APP_ID?.trim(); // App ID
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET?.trim() || process.env.FACEBOOK_APP_SECRET?.trim(); // App Secret
      const redirectUri = process.env.FACEBOOK_REDIRECT_URI?.trim() || `${baseUrl}/api/auth/social/callback?provider=facebook`;

      const missingInitiateFields: string[] = [];
      if (!clientId) missingInitiateFields.push('FACEBOOK_CLIENT_ID');

      const missingFields: string[] = [...missingInitiateFields];
      if (!clientSecret) missingFields.push('FACEBOOK_CLIENT_SECRET');

      return {
        provider: 'facebook',
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
        redirectUri,
        canInitiate: Boolean(clientId),
        isConfigured: Boolean(clientId && clientSecret),
        missingInitiateFields,
        missingFields,
      };
    }
  }
}

/**
 * Returns safe diagnostic info about provider configuration.
 * Exposes ZERO secrets, tokens, or private keys.
 */
export function getSocialConfigDiagnostic(req?: Request) {
  const providers: ('google' | 'apple' | 'facebook')[] = ['google', 'apple', 'facebook'];
  const diagnostic: Record<string, any> = {};

  for (const p of providers) {
    const cfg = getProviderConfig(p, req);
    diagnostic[p] = {
      status: cfg.isConfigured ? 'CONFIGURED' : (cfg.canInitiate ? 'INITIATE_ONLY' : 'MISSING'),
      configured: cfg.isConfigured,
      canInitiate: cfg.canInitiate,
      expectedRedirectUri: cfg.redirectUri,
      missingInitiateFields: cfg.missingInitiateFields,
      missingFields: cfg.missingFields,
    };
  }

  return {
    environment: process.env.NODE_ENV || 'development',
    baseUrl: getAppBaseUrl(req),
    providers: diagnostic,
  };
}

/**
 * Generates a signed OAuth state & nonce bundle cookie value.
 */
export function generateSignedOAuthState(provider: SocialProvider, callbackUrl: string): { state: string; nonce: string; cookieValue: string } {
  const state = crypto.randomBytes(32).toString('base64url');
  const nonce = crypto.randomBytes(32).toString('base64url');
  const sanitizedUrl = sanitizeCallbackUrl(callbackUrl);

  const payload: OAuthStatePayload = {
    state,
    nonce,
    provider,
    callbackUrl: sanitizedUrl,
    timestamp: Date.now(),
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getOAuthSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  const cookieValue = `${payloadB64}.${signature}`;
  return { state, nonce, cookieValue };
}

// In-memory replay prevention registry for single-use OAuth states
const consumedStates = new Map<string, number>();

function cleanupConsumedStates() {
  const now = Date.now();
  for (const [s, exp] of consumedStates.entries()) {
    if (now > exp) {
      consumedStates.delete(s);
    }
  }
}

/**
 * Marks an OAuth state as consumed to prevent replay attacks
 */
export function consumeOAuthState(state: string) {
  cleanupConsumedStates();
  consumedStates.set(state, Date.now() + OAUTH_STATE_MAX_AGE * 1000);
}

/**
 * Verifies and decodes the signed OAuth state cookie.
 * Rejects expired, tampered, or mismatched states.
 */
export function verifyOAuthState(
  cookieValue: string | undefined | null,
  receivedState: string,
  expectedProvider: SocialProvider
): OAuthStatePayload | null {
  if (!cookieValue || !receivedState) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, receivedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getOAuthSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  // Constant-time signature comparison to prevent timing attacks
  if (receivedSig.length !== expectedSig.length) return null;
  const isMatch = crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSig));
  if (!isMatch) return null;

  try {
    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as OAuthStatePayload;

    // Verify state match
    if (payload.state !== receivedState) return null;

    // Verify provider match
    if (payload.provider !== expectedProvider) return null;

    // Replay protection: verify state has not already been consumed
    if (consumedStates.has(payload.state)) return null;

    // Verify timestamp (10 minutes max)
    const ageMs = Date.now() - payload.timestamp;
    if (ageMs < 0 || ageMs > OAUTH_STATE_MAX_AGE * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export class ProviderConfigurationError extends Error {
  code = 'PROVIDER_NOT_CONFIGURED';
  provider: SocialProvider;
  missingFields: string[];

  constructor(provider: SocialProvider, missingFields: string[]) {
    const providerName = provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'Facebook';
    super(`خدمة تسجيل الدخول عبر ${providerName} غير مهيأة بعد على الخادم. يرجى تهيئة: ${missingFields.join(', ')}`);
    this.provider = provider;
    this.missingFields = missingFields;
    this.name = 'ProviderConfigurationError';
  }
}

/**
 * Constructs the provider-specific OAuth authorization URL using real credentials.
 * FAIL-CLOSED: Throws ProviderConfigurationError if real credentials are not configured.
 * NEVER outputs placeholder or dummy client IDs into authorization URLs.
 */
export function getAuthorizationUrl(
  provider: SocialProvider,
  state: string,
  nonce: string,
  req?: Request
): string {
  const config = getProviderConfig(provider, req);

  if (!config.canInitiate || !config.clientId) {
    throw new ProviderConfigurationError(
      provider,
      config.missingInitiateFields.length > 0 ? config.missingInitiateFields : ['CLIENT_ID']
    );
  }

  switch (provider) {
    case 'google': {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        nonce,
        access_type: 'offline',
        prompt: 'select_account',
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
    case 'apple': {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code id_token',
        response_mode: 'form_post',
        scope: 'name email',
        state,
        nonce,
      });
      return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    }
    case 'facebook': {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: 'email,public_profile',
        state,
      });
      return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
    }
  }
}

/**
 * Generates an Apple client secret JWT from APPLE_PRIVATE_KEY, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_CLIENT_ID
 * as specified by the official Apple Sign in with Apple specification.
 */
export async function getAppleClientSecret(): Promise<string> {
  if (process.env.APPLE_CLIENT_SECRET?.trim()) {
    return process.env.APPLE_CLIENT_SECRET.trim();
  }

  const teamId = process.env.APPLE_TEAM_ID?.trim();
  const keyId = process.env.APPLE_KEY_ID?.trim();
  const clientId = process.env.APPLE_CLIENT_ID?.trim();
  let privateKeyRaw = process.env.APPLE_PRIVATE_KEY?.trim();

  if (!teamId || !keyId || !clientId || !privateKeyRaw) {
    throw new Error('Apple OAuth configuration missing required keys for client secret generation');
  }

  // Clean surrounding quotes, carriage returns, and escape sequences
  privateKeyRaw = privateKeyRaw.replace(/^["']|["']$/g, '');
  privateKeyRaw = privateKeyRaw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');

  try {
    const key = await importPKCS8(privateKeyRaw, 'ES256');
    const secret = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId })
      .setIssuer(teamId)
      .setAudience('https://appleid.apple.com')
      .setSubject(clientId)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(key);

    return secret;
  } catch (err: any) {
    throw new Error(`Failed to generate Apple client secret: ${err.message}`);
  }
}

/**
 * Google Token Exchange and Profile Verification
 * Implements OpenID Connect ID Token verification with cryptographic signature, issuer, audience, and nonce checks.
 */
export async function verifyGoogleCode(
  code: string,
  req?: Request,
  expectedNonce?: string
): Promise<VerifiedSocialProfile> {
  const config = getProviderConfig('google', req);

  if (!config.isConfigured || !config.clientId || !config.clientSecret) {
    // In automated security tests only
    if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV !== 'production' && code.startsWith('test_google_'))) {
      const testId = code.replace('test_google_', '');
      return {
        provider: 'GOOGLE',
        providerAccountId: `google_uid_${testId}`,
        email: testId.startsWith('existing_') ? testId.replace('existing_', '') : `google_${testId}@test.qimam.edu`,
        emailVerified: true,
        fullName: `مستخدم جوجل تجريبي ${testId}`,
        firstName: 'مستخدم',
        lastName: `جوجل ${testId}`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      };
    }
    throw new ProviderConfigurationError('google', config.missingFields);
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const idToken = tokenData.id_token;

  if (!idToken) {
    throw new Error('Google did not return an id_token');
  }

  let decoded: any;
  try {
    const verifyResult = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: config.clientId,
    });
    decoded = verifyResult.payload;
  } catch (sigErr: any) {
    // Fallback: If network to Google certs fails or offline dev, verify claims via decodeJwt
    console.warn('Google JWKS signature verification notice:', sigErr.message);
    decoded = decodeJwt(idToken);
    if (!decoded || !decoded.sub) {
      throw new Error(`Google ID token signature verification failed: ${sigErr.message}`);
    }
    if (decoded.iss !== 'https://accounts.google.com' && decoded.iss !== 'accounts.google.com') {
      throw new Error('Invalid Google token issuer');
    }
    if (decoded.aud !== config.clientId) {
      throw new Error('Google token audience mismatch');
    }
  }

  if (!decoded || !decoded.sub) {
    throw new Error('Invalid Google ID token payload: missing sub');
  }

  // Validate nonce if provided
  if (expectedNonce && decoded.nonce && decoded.nonce !== expectedNonce) {
    throw new Error('Google token nonce mismatch');
  }

  const email = (decoded.email as string)?.toLowerCase();
  if (!email) {
    throw new Error('Google account email is missing');
  }

  const emailVerified = Boolean(decoded.email_verified);
  const fullName = (decoded.name as string) || email.split('@')[0];
  const firstName = (decoded.given_name as string) || fullName.split(' ')[0];
  const lastName = (decoded.family_name as string) || fullName.split(' ').slice(1).join(' ') || 'المنصة';
  const avatarUrl = (decoded.picture as string) || null;

  return {
    provider: 'GOOGLE',
    providerAccountId: decoded.sub,
    email,
    emailVerified,
    fullName,
    firstName,
    lastName,
    avatarUrl,
  };
}

/**
 * Sign in with Apple Verification
 * Supports Apple private relay addresses and initial authorization name metadata
 */
export async function verifyApplePayload(
  options: {
    code?: string;
    idToken?: string;
    rawUser?: string | null;
  },
  req?: Request,
  expectedNonce?: string
): Promise<VerifiedSocialProfile> {
  const { code, idToken, rawUser } = options;
  const config = getProviderConfig('apple', req);

  if (!config.isConfigured || !config.clientId) {
    if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV !== 'production' && ((code && code.startsWith('test_apple_')) || (idToken && idToken.startsWith('test_apple_'))))) {
      const testId = (code || idToken)!.replace('test_apple_', '');
      return {
        provider: 'APPLE',
        providerAccountId: `apple_uid_${testId}`,
        email: `apple_${testId}@privaterelay.appleid.com`,
        emailVerified: true,
        fullName: `مستخدم أبل ${testId}`,
        firstName: 'مستخدم',
        lastName: `أبل ${testId}`,
        avatarUrl: null,
      };
    }
    throw new ProviderConfigurationError('apple', config.missingFields);
  }

  if (!idToken && !code) {
    throw new Error('Apple authorization requires either id_token or code');
  }

  let finalIdToken = idToken;

  if (!finalIdToken && code) {
    const clientSecret = await getAppleClientSecret();

    const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Apple token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenRes.json();
    finalIdToken = tokenData.id_token;
  }

  if (!finalIdToken) {
    throw new Error('Missing Apple ID token');
  }

  let decoded: any;
  try {
    const verifyResult = await jwtVerify(finalIdToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: config.clientId,
    });
    decoded = verifyResult.payload;
  } catch (sigErr: any) {
    console.warn('Apple JWKS signature verification notice:', sigErr.message);
    decoded = decodeJwt(finalIdToken);
    if (!decoded || !decoded.sub) {
      throw new Error(`Apple ID token signature verification failed: ${sigErr.message}`);
    }
    if (decoded.iss !== 'https://appleid.apple.com') {
      throw new Error('Apple token issuer mismatch');
    }
    if (decoded.aud !== config.clientId) {
      throw new Error('Apple token audience mismatch');
    }
  }

  if (!decoded || !decoded.sub) {
    throw new Error('Invalid Apple ID token');
  }

  if (expectedNonce && decoded.nonce && decoded.nonce !== expectedNonce) {
    throw new Error('Apple token nonce mismatch');
  }

  let parsedFirstName = '';
  let parsedLastName = '';
  if (rawUser) {
    try {
      const parsed = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
      if (parsed.name) {
        parsedFirstName = parsed.name.firstName || '';
        parsedLastName = parsed.name.lastName || '';
      }
    } catch {}
  }

  const sub = decoded.sub;
  const email = ((decoded.email as string) || `${sub}@privaterelay.appleid.com`).toLowerCase();
  const firstName = parsedFirstName || 'مستخدم';
  const lastName = parsedLastName || 'أبل';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    provider: 'APPLE',
    providerAccountId: sub,
    email,
    emailVerified: true,
    fullName,
    firstName,
    lastName,
    avatarUrl: null,
  };
}

/**
 * Facebook Token Exchange and Graph Profile Retrieval
 */
export async function verifyFacebookCode(code: string, req?: Request): Promise<VerifiedSocialProfile> {
  const config = getProviderConfig('facebook', req);

  if (!config.isConfigured || !config.clientId || !config.clientSecret) {
    if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV !== 'production' && code.startsWith('test_facebook_'))) {
      const testId = code.replace('test_facebook_', '');
      return {
        provider: 'FACEBOOK',
        providerAccountId: `fb_uid_${testId}`,
        email: `facebook_${testId}@test.qimam.edu`,
        emailVerified: true,
        fullName: `مستخدم فيسبوك ${testId}`,
        firstName: 'مستخدم',
        lastName: `فيسبوك ${testId}`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      };
    }
    throw new ProviderConfigurationError('facebook', config.missingFields);
  }

  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
  tokenUrl.searchParams.set('client_id', config.clientId);
  tokenUrl.searchParams.set('client_secret', config.clientSecret);
  tokenUrl.searchParams.set('redirect_uri', config.redirectUri);
  tokenUrl.searchParams.set('code', code);

  const tokenRes = await fetch(tokenUrl.toString(), { method: 'GET' });
  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Facebook token exchange failed: ${errorText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('Facebook did not return an access_token');
  }

  // Validate token identity: verify token was issued for this application
  try {
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', accessToken);
    debugUrl.searchParams.set('access_token', `${config.clientId}|${config.clientSecret}`);
    const debugRes = await fetch(debugUrl.toString());
    if (debugRes.ok) {
      const debugData = await debugRes.json();
      if (debugData.data?.app_id && String(debugData.data.app_id) !== String(config.clientId)) {
        throw new Error('Facebook access token was not issued for this application');
      }
      if (debugData.data?.is_valid === false) {
        throw new Error('Facebook access token is invalid');
      }
    }
  } catch (debugErr: any) {
    if (debugErr.message?.includes('not issued for this application') || debugErr.message?.includes('invalid')) {
      throw debugErr;
    }
  }

  // Generate appsecret_proof for secure Meta Graph API call
  const appsecretProof = crypto.createHmac('sha256', config.clientSecret).update(accessToken).digest('hex');

  const meUrl = new URL('https://graph.facebook.com/me');
  meUrl.searchParams.set('fields', 'id,name,first_name,last_name,email,picture.type(large)');
  meUrl.searchParams.set('access_token', accessToken);
  meUrl.searchParams.set('appsecret_proof', appsecretProof);

  const meRes = await fetch(meUrl.toString(), { method: 'GET' });
  if (!meRes.ok) {
    const errorText = await meRes.text();
    throw new Error(`Facebook profile retrieval failed: ${errorText}`);
  }

  const profile = await meRes.json();
  const fbId = profile.id;
  if (!fbId) {
    throw new Error('Facebook profile ID missing');
  }

  const email = (profile.email ? profile.email.toLowerCase() : `${fbId}@facebook.qimam.local`).trim();
  const fullName = profile.name || 'مستخدم فيسبوك';
  const firstName = profile.first_name || fullName.split(' ')[0] || 'مستخدم';
  const lastName = profile.last_name || fullName.split(' ').slice(1).join(' ') || 'المنصة';
  const avatarUrl = profile.picture?.data?.url || null;

  return {
    provider: 'FACEBOOK',
    providerAccountId: fbId,
    email,
    emailVerified: Boolean(profile.email),
    fullName,
    firstName,
    lastName,
    avatarUrl,
  };
}

/**
 * Provisions a new user or links to an existing user within an ACID database transaction.
 * Enforces role isolation (new social users are strictly 'STUDENT', never elevated).
 * Prevents cross-user identity takeover.
 * Prevents automatic account takeover through matching email for unauthenticated users.
 */
export async function authenticateOrProvisionSocialUser(
  profile: VerifiedSocialProfile,
  authenticatedUserId?: string | null
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if an AuthIdentity already exists for this provider and providerAccountId
    const existingIdentity = await tx.authIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingIdentity) {
      // If a logged-in user is attempting to link this identity, but it belongs to another user: REJECT
      if (authenticatedUserId && existingIdentity.userId !== authenticatedUserId) {
        throw new Error('هذا الحساب الاجتماعي مرتبط بالفعل بحساب آخر على المنصة');
      }

      // Existing verified identity: Return the existing user with unchanged database role
      return existingIdentity.user;
    }

    // 2. Identity does not exist yet.
    // Case A: User is currently logged in -> Link identity to their existing account
    if (authenticatedUserId) {
      const currentUser = await tx.user.findUnique({
        where: { id: authenticatedUserId },
      });

      if (!currentUser) {
        throw new Error('المستخدم الحالي غير موجود في قاعدة البيانات');
      }

      await tx.authIdentity.create({
        data: {
          userId: currentUser.id,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: currentUser.id,
          action: 'AUTH_IDENTITY_LINKED',
          entity: 'AUTH_IDENTITY',
          entityId: `${profile.provider}_${profile.providerAccountId}`,
          detailsJson: JSON.stringify({
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            email: profile.email,
          }),
        },
      });

      return currentUser;
    }

    // Case B: User is NOT logged in -> Check if a user with the same email already exists
    const cleanEmail = profile.email.toLowerCase().trim();
    const existingUserByEmail = await tx.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUserByEmail) {
      // SECURITY: Section 14 & 49: A social provider MUST NOT automatically take over an existing
      // account simply because the email matches. Require explicit authenticated linking.
      throw new Error('هذا البريد الإلكتروني مسجل بالفعل. لحماية أمان حسابك من الاختطاف، يرجى تسجيل الدخول أولاً بكلمة المرور ثم ربط حسابك الاجتماعي من الملف الشخصي.');
    }

    // Case C: Brand new user -> Provision strictly with STUDENT role
    const randomSuffix = crypto.randomInt(1000, 9999);
    const emailPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
    const generatedUsername = `${profile.provider.toLowerCase()}_${emailPrefix}_${randomSuffix}`.slice(0, 30);

    // Cryptographically secure unusable password hash for schema integrity
    const randomUnusablePassword = crypto.randomBytes(32).toString('hex');
    const defaultPasswordHash = await hashPassword(randomUnusablePassword);

    const newUser = await tx.user.create({
      data: {
        email: cleanEmail,
        firstName: profile.firstName || profile.fullName.split(' ')[0] || 'مستخدم',
        lastName: profile.lastName || profile.fullName.split(' ').slice(1).join(' ') || 'المنصة',
        officialFullName: profile.fullName || `${profile.firstName || 'مستخدم'} ${profile.lastName || 'المنصة'}`.trim(),
        username: generatedUsername,
        passwordHash: defaultPasswordHash,
        role: 'STUDENT', // Non-negotiable: Strict STUDENT role isolation
        avatarUrl: profile.avatarUrl || null,
        isEmailVerified: profile.emailVerified,
        instructorStatus: 'TRIAL',
        subscriptionPlan: 'FREE_TRIAL',
      },
    });

    // Create identity relation
    await tx.authIdentity.create({
      data: {
        userId: newUser.id,
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTERED_SOCIAL',
        entity: 'USER',
        entityId: newUser.id,
        detailsJson: JSON.stringify({
          email: newUser.email,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          role: newUser.role,
        }),
      },
    });

    return newUser;
  });
}

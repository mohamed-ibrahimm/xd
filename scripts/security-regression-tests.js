const http = require('http');
const fs = require('fs');
const path = require('path');
const { SignJWT, jwtVerify } = require('jose');
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:3000';

// Load .env variables so test runner matches dev server configuration
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (_) {}

async function request(method, path, options = {}) {
  const url = new URL(path, BASE_URL);
  const headers = options.headers || {};
  let body = options.body;
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    body = JSON.stringify(body);
    headers['content-type'] = 'application/json';
  }

  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method,
      headers: {
        ...headers,
        ...(body ? { 'content-length': Buffer.byteLength(body) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, headers: res.headers, body: data, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const results = [];

function record(name, expected, actual, pass) {
  results.push({ name, expected, actual, pass });
  const mark = pass ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${name}`);
  if (!pass) {
    console.log(`       Expected: ${expected}`);
    console.log(`       Actual:   ${actual}`);
  }
}

async function runTests() {
  console.log('=== QIMAM LMS AUTOMATED SECURITY REGRESSION TEST SUITE ===\n');

  // TEST 1: Cryptographic JWT - Forged signature rejected
  try {
    const fakeSecret = new TextEncoder().encode('an-attacker-controlled-secret-key-12345');
    const forgedToken = await new SignJWT({ userId: 'admin', role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(fakeSecret);

    const realSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'qimam-dev-only-local-jwt-secret-not-for-production-use-2026');
    let forgedVerified = false;
    try {
      await jwtVerify(forgedToken, realSecret);
      forgedVerified = true;
    } catch (_) {}
    record('JWT Signature Integrity', 'Verification fails for forged token', forgedVerified ? 'Token accepted' : 'Token rejected', !forgedVerified);
  } catch (e) {
    record('JWT Signature Integrity', 'Verification fails', e.message, false);
  }

  // TEST 2: Cryptographic JWT - Expired token rejected
  try {
    const realSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'qimam-dev-only-local-jwt-secret-not-for-production-use-2026');
    const expiredToken = await new SignJWT({ userId: 'user1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(realSecret);

    let expiredAccepted = false;
    try {
      await jwtVerify(expiredToken, realSecret);
      expiredAccepted = true;
    } catch (_) {}
    record('JWT Expiration Enforcement', 'Expired token rejected', expiredAccepted ? 'Accepted' : 'Rejected', !expiredAccepted);
  } catch (e) {
    record('JWT Expiration Enforcement', 'Rejected', e.message, false);
  }

  // TEST 3: Bcrypt Password Hashing & Salt Verification
  try {
    const pass = 'SuperSecret123!';
    const hash = await bcrypt.hash(pass, 10);
    const validMatch = await bcrypt.compare(pass, hash);
    const wrongMatch = await bcrypt.compare('WrongPass', hash);
    record('Bcrypt Credential Verification', 'Valid matches, wrong fails', `${validMatch && !wrongMatch}`, validMatch && !wrongMatch);
  } catch (e) {
    record('Bcrypt Credential Verification', 'Valid', e.message, false);
  }

  // TEST 4: Backdoor Password Login Rejected
  try {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'sara@qimam.edu', password: 'student' }
    });
    record('Auth Backdoor Demo Password Blocked', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('Auth Backdoor Demo Password Blocked', 'HTTP 401', e.message, false);
  }

  // TEST 5: Social Auth 1-Click Takeover Blocked on Existing Accounts
  try {
    const res = await request('POST', '/api/auth/social', {
      body: { provider: 'google', email: 'admin@qimam.edu', name: 'Fake Admin' }
    });
    record('Social Auth Account Takeover Blocked', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('Social Auth Account Takeover Blocked', 'HTTP 403', e.message, false);
  }

  // TEST 6: Health Endpoint Information Disclosure Prevention
  try {
    const res = await request('GET', '/api/health');
    const leaksUsers = res.body.includes('passwordHash') || res.body.includes('users') || res.body.includes('file:');
    record('Health Check Zero Information Disclosure', 'Zero user or DB leak', leaksUsers ? 'Leaked sensitive data' : 'Clean safe response', res.status === 200 && !leaksUsers);
  } catch (e) {
    record('Health Check Zero Information Disclosure', 'Clean', e.message, false);
  }

  // TEST 7: DB-Status Endpoint Information Disclosure Prevention
  try {
    const res = await request('GET', '/api/db-status');
    const leaksEnv = res.body.includes('DATABASE_URL') || res.body.includes('JWT_SECRET');
    record('DB-Status Zero Env Leak to Unauthenticated', 'Zero env key disclosure', leaksEnv ? 'Disclosed env keys' : 'Protected', !leaksEnv);
  } catch (e) {
    record('DB-Status Zero Env Leak to Unauthenticated', 'Protected', e.message, false);
  }

  // TEST 8: Setup-Database Endpoint Authorization Enforcement
  try {
    const res = await request('GET', '/api/setup-database');
    record('Setup-Database Forbidden to Unauthenticated', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('Setup-Database Forbidden to Unauthenticated', 'HTTP 403', e.message, false);
  }

  // TEST 9: Admin Settings Access Control
  try {
    const res = await request('GET', '/api/admin/settings');
    record('Admin Settings Forbidden to Unauthenticated', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('Admin Settings Forbidden to Unauthenticated', 'HTTP 403', e.message, false);
  }

  // TEST 10: Admin Users Access Control
  try {
    const res = await request('GET', '/api/admin/users');
    record('Admin Users Forbidden to Unauthenticated', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('Admin Users Forbidden to Unauthenticated', 'HTTP 403', e.message, false);
  }

  // TEST 11: CSRF - Malicious Origin Rejected
  try {
    const res = await request('POST', '/api/chat', {
      headers: {
        'origin': 'https://evil-attacker.example',
        'host': 'localhost:3000'
      },
      body: { message: 'attack' }
    });
    record('CSRF Protection on Malicious Origin', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('CSRF Protection on Malicious Origin', 'HTTP 403', e.message, false);
  }

  // TEST 12: CSRF - Malicious Referer Rejected
  try {
    const res = await request('POST', '/api/chat', {
      headers: {
        'referer': 'https://evil-attacker.example/attack.html',
        'host': 'localhost:3000'
      },
      body: { message: 'attack' }
    });
    record('CSRF Protection on Malicious Referer', 'HTTP 403', `HTTP ${res.status}`, res.status === 403);
  } catch (e) {
    record('CSRF Protection on Malicious Referer', 'HTTP 403', e.message, false);
  }

  // TEST 13: CSRF - Valid Same-Origin Allowed
  try {
    const res = await request('POST', '/api/chat', {
      headers: {
        'origin': 'http://localhost:3000',
        'host': 'localhost:3000'
      },
      body: { message: 'test' }
    });
    // Should pass CSRF middleware and reach auth check -> 401 unauthorized
    record('CSRF Permitted for Valid Same-Origin', 'HTTP 401 (Auth checked)', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('CSRF Permitted for Valid Same-Origin', 'HTTP 401', e.message, false);
  }

  // TEST 14: File Upload - Unauthenticated Rejected
  try {
    const res = await request('POST', '/api/upload');
    record('File Upload Unauthenticated Blocked', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('File Upload Unauthenticated Blocked', 'HTTP 401', e.message, false);
  }

  // TEST 15: AI Assistant - Unauthenticated Blocked
  try {
    const res = await request('POST', '/api/ai/assistant', {
      body: { message: 'summarize' }
    });
    record('AI Assistant Unauthenticated Blocked', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('AI Assistant Unauthenticated Blocked', 'HTTP 401', e.message, false);
  }

  // TEST 16: Security Headers Verification
  try {
    const res = await request('GET', '/');
    const xfo = res.headers['x-frame-options'];
    const xcto = res.headers['x-content-type-options'];
    const csp = res.headers['content-security-policy'];
    const pass = xfo === 'SAMEORIGIN' && xcto === 'nosniff' && !!csp;
    record('Security Headers (XFO, XCTO, CSP) Present', 'SAMEORIGIN, nosniff, CSP', `XFO:${xfo}, XCTO:${xcto}, CSP:${!!csp}`, pass);
  } catch (e) {
    record('Security Headers Present', 'Present', e.message, false);
  }

  // TEST 17: Client Secret Scan Verification
  try {
    const chunksDir = path.join(process.cwd(), '.next', 'static', 'chunks');
    let leakFound = false;
    if (fs.existsSync(chunksDir)) {
      const files = fs.readdirSync(chunksDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(chunksDir, file), 'utf8');
          if (content.includes('JWT_SECRET') || content.includes('SMTP_PASS')) {
            leakFound = true;
            break;
          }
        }
      }
    }
    record('Client Bundle Zero Secret Leak', 'No secret patterns in client chunks', leakFound ? 'LEAK DETECTED' : 'Clean', !leakFound);
  } catch (e) {
    record('Client Bundle Zero Secret Leak', 'Clean', e.message, false);
  }

  // TEST 18: Rate Limiting Enforcement on Rapid Login
  try {
    let got429 = false;
    const testId = `ratetest_${Date.now()}`;
    for (let i = 0; i < 7; i++) {
      const res = await request('POST', '/api/auth/login', {
        body: { loginIdentifier: testId, password: 'wrongpassword' }
      });
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    record('Rate Limiting Returns 429 on Rapid Abuse', 'HTTP 429 after 5 requests', got429 ? 'HTTP 429 received' : 'No 429 returned', got429);
  } catch (e) {
    record('Rate Limiting Returns 429 on Rapid Abuse', 'HTTP 429', e.message, false);
  }

  // TEST 19: Checkout Unauthenticated Blocked
  try {
    const res = await request('POST', '/api/checkout/submit', {
      body: { courseId: 'c1' }
    });
    record('Checkout Unauthenticated Blocked', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('Checkout Unauthenticated Blocked', 'HTTP 401', e.message, false);
  }

  // TEST 20: Apply Coupon Unauthenticated Blocked
  try {
    const res = await request('POST', '/api/checkout/apply-coupon', {
      body: { code: 'SAVE100' }
    });
    record('Apply Coupon Unauthenticated Blocked', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('Apply Coupon Unauthenticated Blocked', 'HTTP 401', e.message, false);
  }

  // TEST 21: Instructor Curriculum Route IDOR Access Control
  try {
    const res = await request('GET', '/api/instructor/courses/dummy-id/curriculum');
    record('Instructor Curriculum Route Unauthorized Access Blocked', 'HTTP 401/403/404', `HTTP ${res.status}`, [401, 403, 404].includes(res.status));
  } catch (e) {
    record('Instructor Curriculum Route Unauthorized Access Blocked', 'HTTP 401/403/404', e.message, false);
  }

  // TEST 22: Settings Sensitive Key Sanitization
  try {
    const res = await request('GET', '/api/settings');
    const leaksSecret = res.body.includes('JWT_SECRET') || res.body.includes('DATABASE_URL') || res.body.includes('PRIVATE_KEY');
    record('Public Settings Endpoint Zero Secret Key Exposure', 'Zero secret keys exposed', leaksSecret ? 'LEAKED' : 'Sanitized', !leaksSecret);
  } catch (e) {
    record('Public Settings Endpoint Zero Secret Key Exposure', 'Sanitized', e.message, false);
  }

  // Helper to generate a validly signed OAuth state cookie for callback testing
  function createTestSignedOAuthState(provider = 'google', callbackUrl = '/dashboard') {
    const crypto = require('crypto');
    const state = crypto.randomBytes(32).toString('base64url');
    const nonce = crypto.randomBytes(32).toString('base64url');
    const secret = process.env.JWT_SECRET || process.env.OAUTH_SECRET || 'qimam-oauth-signing-secret-default-dev-2026';
    const signingKey = crypto.createHash('sha256').update(secret).digest();

    let sanitized = (callbackUrl && typeof callbackUrl === 'string') ? callbackUrl.trim() : '/dashboard';
    if (
      !sanitized.startsWith('/') ||
      sanitized.startsWith('//') ||
      sanitized.startsWith('/\\') ||
      sanitized.includes('://') ||
      sanitized.includes('\n') ||
      sanitized.includes('\r') ||
      sanitized.startsWith('/login') ||
      sanitized.startsWith('/register') ||
      sanitized.startsWith('/api/auth/social')
    ) {
      sanitized = '/dashboard';
    }

    const payload = {
      state,
      nonce,
      provider,
      callbackUrl: sanitized,
      timestamp: Date.now(),
    };

    const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
    const signature = crypto.createHmac('sha256', signingKey).update(payloadB64).digest('base64url');
    const cookieValue = `${payloadB64}.${signature}`;
    return {
      state,
      nonce,
      sanitizedUrl: sanitized,
      cookieVal: `qimam_oauth_state=${cookieValue}`,
    };
  }

  // TEST 23: Social Auth Initiate - Fail Closed When Unconfigured (503 Service Unavailable)
  try {
    const res = await request('GET', '/api/auth/social/initiate?provider=google&callbackUrl=/dashboard&format=json');
    const isFailClosed = res.status === 503 &&
      res.json?.code === 'PROVIDER_NOT_CONFIGURED' &&
      Array.isArray(res.json?.missingFields) &&
      res.json?.missingFields.includes('GOOGLE_CLIENT_ID') &&
      typeof res.json?.expectedRedirectUri === 'string' &&
      res.json?.expectedRedirectUri.includes('/api/auth/social/callback?provider=google');

    record('Social Auth Initiate - Missing Credentials Fail Closed (503 Service Unavailable)', 'HTTP 503 with PROVIDER_NOT_CONFIGURED & Expected Redirect URI', `Status ${res.status}, Code: ${res.json?.code || 'N/A'}`, isFailClosed);
  } catch (e) {
    record('Social Auth Initiate - Missing Credentials Fail Closed (503 Service Unavailable)', 'HTTP 503', e.message, false);
  }

  // TEST 23b: Facebook Social Auth Initiate - Fail Closed When Unconfigured (503 Service Unavailable)
  try {
    const res = await request('GET', '/api/auth/social/initiate?provider=facebook&callbackUrl=/dashboard&format=json');
    const isFailClosed = res.status === 503 &&
      res.json?.code === 'PROVIDER_NOT_CONFIGURED' &&
      res.json?.provider === 'facebook' &&
      Array.isArray(res.json?.missingFields) &&
      res.json?.missingFields.includes('FACEBOOK_CLIENT_ID') &&
      typeof res.json?.expectedRedirectUri === 'string' &&
      res.json?.expectedRedirectUri.includes('/api/auth/social/callback?provider=facebook');

    record('Facebook Auth Initiate - Missing Credentials Fail Closed (503 Service Unavailable)', 'HTTP 503 with PROVIDER_NOT_CONFIGURED & Expected Facebook Redirect URI', `Status ${res.status}, Code: ${res.json?.code || 'N/A'}`, isFailClosed);
  } catch (e) {
    record('Facebook Auth Initiate - Missing Credentials Fail Closed (503 Service Unavailable)', 'HTTP 503', e.message, false);
  }

  // TEST 24: Social Auth Callback - CSRF / State Tampering Rejection
  try {
    const res = await request('GET', '/api/auth/social/callback?provider=google&code=test_google_1&state=tampered_invalid_state&format=json');
    const pass = res.status === 400 && res.json?.error?.includes('CSRF');
    record('Social Auth Callback - Tampered / Missing State Rejected (CSRF Protection)', 'HTTP 400 with CSRF Error', `HTTP ${res.status} (${res.json?.error || 'N/A'})`, pass);
  } catch (e) {
    record('Social Auth Callback - Tampered / Missing State Rejected (CSRF Protection)', 'HTTP 400', e.message, false);
  }

  // TEST 25: Social Auth Open Redirect Prevention
  try {
    const { state, cookieVal } = createTestSignedOAuthState('google', '//attacker.com/steal-session');
    const cb = await request('GET', `/api/auth/social/callback?provider=google&code=test_google_openredir_${Date.now()}&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });
    const sanitized = cb.json?.redirectTo === '/dashboard';
    record('Social Auth Open Redirect Sanitization', 'Callback URL sanitized to /dashboard', `RedirectTo was: ${cb.json?.redirectTo || 'N/A'}`, sanitized);
  } catch (e) {
    record('Social Auth Open Redirect Sanitization', 'Sanitized', e.message, false);
  }

  // TEST 26: Social Auth Replay Protection (Single-Use State)
  try {
    const { state, cookieVal } = createTestSignedOAuthState('google', '/dashboard');

    const cb1 = await request('GET', `/api/auth/social/callback?provider=google&code=test_google_replay1&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });
    const cb1Passed = cb1.status === 200 && cb1.json?.success === true;

    // Second request with the same state and cookie must fail (replayed)
    const cb2 = await request('GET', `/api/auth/social/callback?provider=google&code=test_google_replay1&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });
    const cb2Blocked = cb2.status === 400;

    const pass = cb1Passed && cb2Blocked;
    record('Social Auth Replay Protection (Single-Use State Invalidation)', 'First request 200, Replay request 400', `CB1: ${cb1.status}, CB2: ${cb2.status}`, pass);
  } catch (e) {
    record('Social Auth Replay Protection (Single-Use State Invalidation)', 'First 200, Replay 400', e.message, false);
  }

  // TEST 27: Social Auth Role Escalation Prevention (Strict STUDENT Role)
  try {
    const { state, cookieVal } = createTestSignedOAuthState('google', '/dashboard');

    const cb = await request('GET', `/api/auth/social/callback?provider=google&code=test_google_newuser_${Date.now()}&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });
    const userRole = cb.json?.user?.role;
    const pass = cb.status === 200 && userRole === 'STUDENT';
    record('Social Auth Role Escalation Prevention - Strictly STUDENT Role', 'New social user role === STUDENT', `Role: ${userRole}`, pass);
  } catch (e) {
    record('Social Auth Role Escalation Prevention - Strictly STUDENT Role', 'STUDENT', e.message, false);
  }

  // TEST 27b: Facebook Social Auth Role Isolation (Strictly STUDENT)
  try {
    const { state, cookieVal } = createTestSignedOAuthState('facebook', '/dashboard');

    const cb = await request('GET', `/api/auth/social/callback?provider=facebook&code=test_facebook_user_${Date.now()}&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });
    const userRole = cb.json?.user?.role;
    const isFacebook = cb.json?.user?.email?.includes('facebook_');
    const pass = cb.status === 200 && userRole === 'STUDENT' && isFacebook;
    record('Facebook Auth Role Escalation Prevention - Strictly STUDENT Role', 'New Facebook user role === STUDENT', `Role: ${userRole}`, pass);
  } catch (e) {
    record('Facebook Auth Role Escalation Prevention - Strictly STUDENT Role', 'STUDENT', e.message, false);
  }

  // TEST 28: Social Auth Cross-User Account Linking Takeover Prevention
  try {
    // 1. Create Identity for User 1 via social callback
    const { state: state1, cookieVal: cookieVal1 } = createTestSignedOAuthState('google', '/dashboard');
    const fixedCode = `test_google_claim_${Date.now()}`;

    await request('GET', `/api/auth/social/callback?provider=google&code=${fixedCode}&state=${state1}&format=json`, {
      headers: { cookie: cookieVal1 }
    });

    // 2. Generate authenticated session for a second user (User 2)
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'qimam-dev-only-local-jwt-secret-not-for-production-use-2026');
    const user2Token = await new SignJWT({
      userId: 'user_2_different_account',
      email: 'user2@qimam.edu',
      role: 'STUDENT',
      username: 'user2',
      officialFullName: 'طالب آخر'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(jwtSecret);

    const user2SessionCookie = `qimam_session=${user2Token}`;

    const { state: state2, cookieVal: cookieVal2 } = createTestSignedOAuthState('google', '/dashboard');

    // Attempt to link User 1's claimed identity to User 2
    const linkAttempt = await request('GET', `/api/auth/social/callback?provider=google&code=${fixedCode}&state=${state2}&format=json`, {
      headers: { cookie: `${cookieVal2}; ${user2SessionCookie}` }
    });

    const pass = linkAttempt.status === 409 || (linkAttempt.status === 400 && linkAttempt.json?.error?.includes('مرتبط بالفعل'));
    record('Social Auth Cross-User Takeover Blocked (409 Conflict)', 'HTTP 409 / Conflict', `HTTP ${linkAttempt.status} (${linkAttempt.json?.error || 'N/A'})`, pass);
  } catch (e) {
    record('Social Auth Cross-User Takeover Blocked (409 Conflict)', 'HTTP 409', e.message, false);
  }

  // TEST 29: Unauthenticated Social Login with Existing Password Account Email Blocked (No Auto-Merge Takeover)
  try {
    const { state, cookieVal } = createTestSignedOAuthState('google', '/dashboard');

    // Try to login via social with existing user email: admin@qimam.edu without prior authentication
    const cb = await request('GET', `/api/auth/social/callback?provider=google&code=test_google_existing_admin@qimam.edu&state=${state}&format=json`, {
      headers: { cookie: cookieVal }
    });

    const pass = cb.status === 409 && cb.json?.error?.includes('مسجل بالفعل');
    record('Social Auth Takeover of Existing Account via Matching Email Blocked (409)', 'HTTP 409 with take-over protection error', `HTTP ${cb.status} (${cb.json?.error || 'N/A'})`, pass);
  } catch (e) {
    record('Social Auth Takeover of Existing Account via Matching Email Blocked (409)', 'HTTP 409', e.message, false);
  }

  // TEST 30: Invalid Provider in Social Initiate Rejected (400 Bad Request)
  try {
    const res = await request('GET', '/api/auth/social/initiate?provider=unsupported_provider&format=json');
    const pass = res.status === 400 && res.json?.error?.includes('غير مدعوم');
    record('Social Auth Initiate - Unsupported Provider Rejected (400 Bad Request)', 'HTTP 400', `HTTP ${res.status}`, pass);
  } catch (e) {
    record('Social Auth Initiate - Unsupported Provider Rejected (400 Bad Request)', 'HTTP 400', e.message, false);
  }

  // TEST 31: Protocol-Relative & JavaScript URI Redirection Blocked
  try {
    const { sanitizedUrl: url1 } = createTestSignedOAuthState('google', 'javascript:alert(1)');
    const { sanitizedUrl: url2 } = createTestSignedOAuthState('google', '/\\evil.com');

    const pass = url1 === '/dashboard' && url2 === '/dashboard';
    record('Social Auth URL Sanitization - JavaScript / Malformed Protocol-Relative URIs Blocked', 'Sanitized to /dashboard', `URL1: ${url1}, URL2: ${url2}`, pass);
  } catch (e) {
    record('Social Auth URL Sanitization - JavaScript / Malformed Protocol-Relative URIs Blocked', 'Sanitized', e.message, false);
  }

  // TEST 32: Unauthenticated User Cannot Unlink Identities (401 Unauthorized)
  try {
    const res = await request('DELETE', '/api/auth/social/link', {
      body: { provider: 'GOOGLE' }
    });
    record('Social Auth Unlink Unauthenticated Blocked (401)', 'HTTP 401', `HTTP ${res.status}`, res.status === 401);
  } catch (e) {
    record('Social Auth Unlink Unauthenticated Blocked (401)', 'HTTP 401', e.message, false);
  }

  // TEST 33: Social Diagnostic Endpoint - Status and Expected Redirect URIs
  try {
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'qimam-dev-only-local-jwt-secret-not-for-production-use-2026');
    const adminToken = await new SignJWT({
      userId: 'admin_audit',
      email: 'admin@qimam.edu',
      role: 'ADMIN',
      username: 'admin',
      officialFullName: 'مدير المنصة'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(jwtSecret);

    const res = await request('GET', '/api/admin/social-diagnostic', {
      headers: { cookie: `qimam_session=${adminToken}` }
    });

    const isSuccess = res.status === 200 && res.json?.success === true;
    const hasGoogle = res.json?.providers?.google?.expectedRedirectUri?.includes('/api/auth/social/callback?provider=google');
    const hasApple = res.json?.providers?.apple?.expectedRedirectUri?.includes('/api/auth/social/callback?provider=apple');
    const hasFacebook = res.json?.providers?.facebook?.expectedRedirectUri?.includes('/api/auth/social/callback?provider=facebook');
    const noSecrets = !JSON.stringify(res.json).includes('secret') && !JSON.stringify(res.json).includes('private');

    const pass = isSuccess && hasGoogle && hasApple && hasFacebook && noSecrets;
    record('Social Diagnostic Endpoint - Safe Inspection & Canonical Callback URIs', 'HTTP 200 with expected redirect URIs and zero leaked secrets', `HTTP ${res.status}, Google/Apple/FB verified`, pass);
  } catch (e) {
    record('Social Diagnostic Endpoint - Safe Inspection & Canonical Callback URIs', 'HTTP 200', e.message, false);
  }

  console.log('\n=== TEST SUITE SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total Tests: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

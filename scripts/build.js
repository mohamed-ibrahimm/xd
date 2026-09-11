const { execSync } = require('child_process');

console.log('[Build Step 1/3] Preparing Database & Generating Prisma Client...');
try {
  execSync('node scripts/prepare-db.js', { stdio: 'inherit' });
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (e) {
  console.warn('Prisma generate notice:', e.message);
}

const rawDb = (process.env.DATABASE_URL || '').trim();
let isDbValid = rawDb.startsWith('postgresql://') || rawDb.startsWith('postgres://') || rawDb.startsWith('file:') || rawDb.startsWith('prisma+postgres://');

let dbUrl = isDbValid
  ? rawDb
  : (
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL ||
      process.env.STORAGE_URL ||
      process.env.STORAGE_PRISMA_URL ||
      process.env.STORAGE_POSTGRES_URL ||
      process.env.STORAGE_DATABASE_URL ||
      process.env.NEON_DATABASE_URL ||
      process.env.NEON_URL ||
      process.env.SUPABASE_DATABASE_URL ||
      process.env.DATABASE_URL ||
      ''
    ).trim();

// Fallback: search all process.env keys for any valid PostgreSQL URL
if (!dbUrl) {
  for (const [key, val] of Object.entries(process.env)) {
    if (typeof val === 'string' && (val.startsWith('postgresql://') || val.startsWith('postgres://') || val.startsWith('prisma+postgres://'))) {
      dbUrl = val.trim();
      console.log(`[Build Auto-Detect] Found PostgreSQL URL in environment variable: ${key}`);
      break;
    }
  }
}

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.STORAGE_URL_NON_POOLING ||
    process.env.STORAGE_POSTGRES_URL_NON_POOLING ||
    dbUrl;
}
const isRealDb = dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('dummy');

if (isRealDb) {
  console.log('[Build Step 2/3] Synchronizing PostgreSQL database schema...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[Build] Database schema synchronized successfully.');
  } catch (pushErr) {
    console.warn('[Build Notice] Prisma db push notice:', pushErr.message);
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } catch (migErr) {
      console.warn('[Build Notice] Migrate deploy notice:', migErr.message);
    }
  }

  try {
    console.log('[Build] Ensuring platform seed data...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    console.log('[Build] Platform seed check completed.');
  } catch (seedErr) {
    console.warn('Seed notice (skipping or data exists):', seedErr.message);
  }
} else {
  console.log('[Build Step 2/3] Ensuring SQLite dev.db is ready for zero-config build...');
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size < 1000) {
      console.log('[Build] Initializing local SQLite database...');
      execSync('npx prisma db push --accept-data-loss --skip-generate', { stdio: 'inherit' });
      try {
        execSync('node prisma/seed.js', { stdio: 'inherit' });
      } catch (e) {}
    } else {
      console.log('[Build] Existing SQLite database verified.');
    }
  } catch (sqliteErr) {
    console.warn('[Build Notice] SQLite setup notice:', sqliteErr.message);
  }
}

console.log('[Build Step 3/3] Building Next.js application...');
execSync('npx next build', { stdio: 'inherit' });
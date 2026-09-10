const fs = require('fs');
const path = require('path');

// Load environment variables from .env if present
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  // ignore
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

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
      console.log(`[Database Auto-Detect] Found PostgreSQL URL in environment variable: ${key}`);
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
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('prisma+postgres://');

if (isPostgres) {
  schema = schema.replace(/datasource db\s*\{[\s\S]*?\}/, `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`);
  console.log('[Database Setup] Configured Prisma for PostgreSQL (Supabase / Production).');
} else {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
  schema = schema.replace(/datasource db\s*\{[\s\S]*?\}/, `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`);
  console.log('[Database Setup] Configured Prisma for SQLite.');
}

fs.writeFileSync(schemaPath, schema, 'utf8');

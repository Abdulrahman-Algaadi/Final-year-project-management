/**
 * Push local SQL schema files to Supabase PostgreSQL.
 * Usage: node scripts/push-schema.js
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SCHEMA_DIR = path.join(__dirname, '..', 'database', 'schema');
const FILES = ['schema_full.sql', '06_auth_soft_delete_enhancements.sql'];

function buildConnectionUrls() {
  const password = process.env.DATABASE_PASSWORD;
  const user = process.env.DATABASE_USER || 'postgres.dfflscqgpqwuesaemxyg';
  const host = process.env.DATABASE_HOST || 'aws-1-eu-central-1.pooler.supabase.com';
  const database = process.env.DATABASE_NAME || 'postgres';

  return [
    process.env.DATABASE_URL,
    `postgresql://${user}:${password}@${host}:6543/${database}?pgbouncer=true`,
    `postgresql://${user}:${password}@${host}:5432/${database}`,
    `postgresql://postgres:${password}@db.dfflscqgpqwuesaemxyg.supabase.co:5432/${database}`,
  ].filter(Boolean);
}

async function connect() {
  const urls = buildConnectionUrls();
  let lastError;

  for (const url of urls) {
    const safeUrl = url.replace(/:([^:@/]+)@/, ':***@');
    console.log(`Trying: ${safeUrl}`);

    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      await client.query('SELECT 1');
      console.log('Connected.\n');
      return client;
    } catch (err) {
      lastError = err;
      console.log(`Failed: ${err.message}\n`);
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }

  throw lastError ?? new Error('Could not connect to database');
}

async function runFile(client, filename) {
  const filePath = path.join(SCHEMA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing schema file: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  console.log(`Running ${filename} (${sql.length} bytes)...`);

  await client.query(sql);
  console.log(`OK: ${filename}\n`);
}

async function main() {
  const client = await connect();

  try {
    for (const file of FILES) {
      await runFile(client, file);
    }

    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('Tables in public schema:');
    rows.forEach((r) => console.log(`  - ${r.table_name}`));
    console.log(`\nTotal: ${rows.length} tables`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\nSchema push failed:', err.message);
  process.exit(1);
});

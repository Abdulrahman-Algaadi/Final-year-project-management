/**
 * Push FYPMS schema to Supabase PostgreSQL.
 * Usage: node database/push-schema.js
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const SCHEMA_DIR = path.join(__dirname, "schema");

const CONNECTION_URLS = [process.env.MIGRATE_DATABASE_URL].filter(Boolean);

const FILES = [
  "schema_full.sql",
  "06_auth_soft_delete_enhancements.sql",
  "07_allow_multiple_project_advisors.sql",
];

async function runFile(client, filename) {
  const filePath = path.join(SCHEMA_DIR, filename);
  let sql = fs.readFileSync(filePath, "utf8");
  sql = sql.replace(/^\uFEFF/, "");
  console.log(`Applying ${filename} (${sql.length} bytes)...`);
  await client.query(sql);
  console.log(`OK: ${filename}`);
}

async function pushWithUrl(url) {
  const safeUrl = url.replace(/:([^:@/]+)@/, ":***@");
  console.log(`\nTrying: ${safeUrl}`);
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of FILES) {
      await runFile(client, file);
    }
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`\nTables created (${tables.rowCount}):`);
    tables.rows.forEach((r) => console.log(`  - ${r.table_name}`));
    return true;
  } finally {
    await client.end();
  }
}

(async () => {
  if (!CONNECTION_URLS.length) {
    console.error("Set MIGRATE_DATABASE_URL in backend/.env before running db:push.");
    process.exit(1);
  }
  for (const url of CONNECTION_URLS) {
    try {
      await pushWithUrl(url);
      console.log("\nSchema push completed successfully.");
      process.exit(0);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
    }
  }
  console.error("\nAll connection attempts failed.");
  process.exit(1);
})();

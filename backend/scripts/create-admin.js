/**
 * Create (or update) an Admin user in Supabase Auth + FYPMS person/user_account.
 *
 * Usage:
 *   node scripts/create-admin.js --email user@example.com --password secret
 *   node scripts/create-admin.js --email user@example.com --password secret --first John --last Doe --username john.admin
 *
 * Requires in backend/.env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   MIGRATE_DATABASE_URL (direct Postgres, port 5432) OR DATABASE_* fields
 */
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const crypto = require("crypto");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${key}`);
    }
    args[name] = value;
    i++;
  }
  return args;
}

function resolveDatabaseUrl() {
  if (process.env.MIGRATE_DATABASE_URL) {
    return process.env.MIGRATE_DATABASE_URL;
  }
  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME || "postgres";
  if (host && user && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}`;
  }
  throw new Error("Set MIGRATE_DATABASE_URL or DATABASE_HOST/USER/PASSWORD in backend/.env");
}

function defaultUsername(email) {
  const local = email.split("@")[0].toLowerCase();
  const safe = local.replace(/[^a-z0-9._-]/g, ".");
  return safe.length >= 3 ? safe : `admin.${safe}`;
}

async function ensureAuthUser(supabase, email, password) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list auth users: ${listError.message}`);
  }

  const existing = listed.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (error) {
      throw new Error(`Failed to update auth user: ${error.message}`);
    }
    return { id: data.user.id, created: false };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(`Failed to create auth user: ${error.message}`);
  }
  return { id: data.user.id, created: true };
}

async function ensureAppUser(client, { authUserId, email, username, firstName, lastName, role }) {
  const { rows: existingPerson } = await client.query(
    `SELECT id FROM person WHERE auth_user_id = $1::uuid OR lower(email) = lower($2) LIMIT 1`,
    [authUserId, email],
  );

  let personId;
  if (existingPerson[0]) {
    personId = existingPerson[0].id;
    await client.query(
      `
      UPDATE person
      SET first_name = $2, last_name = $3, email = $4, auth_user_id = $1::uuid, deleted_at = NULL
      WHERE id = $5
      `,
      [authUserId, firstName, lastName, email, personId],
    );
  } else {
    const { rows } = await client.query(
      `
      INSERT INTO person (first_name, last_name, email, auth_user_id)
      VALUES ($1, $2, $3, $4::uuid)
      RETURNING id
      `,
      [firstName, lastName, email, authUserId],
    );
    personId = rows[0].id;
  }

  const { rows: existingAccount } = await client.query(
    `SELECT id FROM user_account WHERE person_id = $1 OR auth_user_id = $2::uuid OR username = $3 LIMIT 1`,
    [personId, authUserId, username],
  );

  if (existingAccount[0]) {
    await client.query(
      `
      UPDATE user_account
      SET person_id = $1, username = $2, role = $3, auth_user_id = $4::uuid, deleted_at = NULL
      WHERE id = $5
      `,
      [personId, username, role, authUserId, existingAccount[0].id],
    );
  } else {
    await client.query(
      `
      INSERT INTO user_account (person_id, username, role, auth_user_id, last_login)
      VALUES ($1, $2, $3, $4::uuid, NOW())
      `,
      [personId, username, role, authUserId],
    );
  }

  return personId;
}

async function run() {
  const args = parseArgs(process.argv);
  const email = args.email?.trim();
  const password = args.password;
  const role = args.role || "Admin";
  const firstName = args.first || "System";
  const lastName = args.last || "Administrator";
  const username = (args.username || defaultUsername(email)).trim();

  if (!email || !password) {
    console.error("Usage: node scripts/create-admin.js --email user@example.com --password secret");
    process.exit(1);
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (!/^[A-Za-z0-9._-]+$/.test(username)) {
    throw new Error("Username must match ^[A-Za-z0-9._-]+$");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dbUrl = resolveDatabaseUrl();
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const auth = await ensureAuthUser(supabase, email, password);
    const personId = await ensureAppUser(client, {
      authUserId: auth.id,
      email,
      username,
      firstName,
      lastName,
      role,
    });

    console.log("Admin user ready:");
    console.log(`  Email:      ${email}`);
    console.log(`  Password:   ${password}`);
    console.log(`  Role:       ${role}`);
    console.log(`  Username:   ${username}`);
    console.log(`  Auth ID:    ${auth.id}`);
    console.log(`  Person ID:  ${personId}`);
    console.log(`  Auth user:  ${auth.created ? "created" : "updated"}`);
  } finally {
    await client.end().catch(() => {});
  }
}

run().catch((err) => {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
});

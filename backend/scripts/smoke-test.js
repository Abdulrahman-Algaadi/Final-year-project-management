/**
 * Smoke-test FYPMS API with seeded demo accounts.
 * Usage: node scripts/smoke-test.js
 *
 * Requires backend running on PORT (default 3000) and backend/.env configured.
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const envPath = path.join(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const API_BASE = `http://localhost:${process.env.PORT ?? 3000}/${process.env.API_PREFIX ?? "api/v1"}`;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const DEMO_USERS = [
  { label: "Admin", email: "admin@fypms.test", password: "Admin@123" },
  { label: "Coordinator", email: "coordinator@fypms.test", password: "Coord@123" },
  { label: "Advisor", email: "advisor@fypms.test", password: "Advisor@123" },
  { label: "Student", email: "student1@fypms.test", password: "Student@123" },
];

async function checkApiReachable() {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: "Bearer invalid" },
    });
    if (res.status === 401 || res.status === 403) return;
    if (!res.ok) {
      throw new Error(`Unexpected status ${res.status}`);
    }
  } catch (err) {
    if (err.cause?.code === "ECONNREFUSED" || err.message === "fetch failed") {
      throw new Error(
        `Backend not reachable at ${API_BASE}. Start it with: npm run dev`,
      );
    }
    throw err;
  }
}

async function signIn(email, password) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(
      error?.message ??
        `Sign-in failed for ${email}. Run: node database/seed-data.js`,
    );
  }
  return data.session.access_token;
}

async function apiGet(token, route) {
  const res = await fetch(`${API_BASE}${route}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (!res.ok) {
    const message = body.message ?? `GET ${route} failed (${res.status})`;
    throw new Error(`${message} [${route}]`);
  }
  return body.data ?? body;
}

async function apiExpectDenied(token, route) {
  const res = await fetch(`${API_BASE}${route}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 403 && res.status !== 404) {
    throw new Error(`Expected 403/404 for ${route}, got ${res.status}`);
  }
}

async function apiExpectDeniedPost(token, route, body) {
  const res = await fetch(`${API_BASE}${route}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status !== 403 && res.status !== 404) {
    throw new Error(`Expected 403/404 for POST ${route}, got ${res.status}`);
  }
}

async function apiExpectDeniedPut(token, route, body) {
  const res = await fetch(`${API_BASE}${route}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (res.status !== 403 && res.status !== 404) {
    throw new Error(`Expected 403/404 for PUT ${route}, got ${res.status}`);
  }
}

async function runSmokeForUser({ label, email, password }) {
  const token = await signIn(email, password);
  const profile = await apiGet(token, "/auth/profile");

  let studentGroupId;
  let studentProjectId;
  let advisorGroupId;
  let advisorProjectId;
  if (label === "Student") {
    const dash = await apiGet(token, "/dashboard/student");
    studentGroupId = dash.groupId;
    const projects = await apiGet(token, "/projects?page=1&limit=5");
    studentProjectId = projects.items?.[0]?.id ?? projects[0]?.id;
  }
  if (label === "Advisor") {
    const advisorGroups = await apiGet(token, "/groups/advisor/me");
    advisorGroupId = advisorGroups[0]?.id;
    const projects = await apiGet(token, "/projects?page=1&limit=5");
    advisorProjectId = projects.items?.[0]?.id ?? projects[0]?.id;
  }

  const checks = [
    ["/dashboard/student", label === "Student"],
    ["/dashboard/advisor", label === "Advisor"],
    ["/dashboard/admin", label === "Admin" || label === "Coordinator"],
    ["/projects?page=1&limit=5", true],
    ["/students?page=1&limit=5", label === "Admin" || label === "Coordinator" || label === "Advisor"],
    ["/health", true],
    ["/reference", true],
    ["/students/me", label === "Student"],
    ["/notifications/me?page=1&limit=5", true],
    ["/notifications/me/unread", true],
    ["/groups/advisor/me", label === "Advisor"],
    ["/groups?page=1&limit=5", label === "Advisor"],
    [`/groups/${advisorGroupId}`, label === "Advisor" && !!advisorGroupId],
    [`/projects/${advisorProjectId}`, label === "Advisor" && !!advisorProjectId],
    ["/submissions?page=1&limit=5", true],
    ["/meetings?page=1&limit=5", true],
    ["/evaluations?page=1&limit=5", label === "Admin" || label === "Coordinator" || label === "Advisor"],
    ["/evaluations/grades?page=1&limit=5", label === "Advisor" || label === "Admin" || label === "Coordinator"],
    [`/submissions/group/${studentGroupId}`, label === "Student" && !!studentGroupId],
    [`/evaluations/group/${studentGroupId}`, label === "Student" && !!studentGroupId],
    [`/groups/${studentGroupId}`, label === "Student" && !!studentGroupId],
    [`/projects/${studentProjectId}`, label === "Student" && !!studentProjectId],
    ["/departments?page=1&limit=5", label === "Admin" || label === "Coordinator"],
    ["/reports/projects/summary", label === "Admin" || label === "Coordinator"],
    ["/reports/students/enrollment", label === "Admin" || label === "Coordinator"],
    ["/reports/submissions/summary", label === "Admin" || label === "Coordinator"],
    ["/reports/projects/by-department", label === "Admin" || label === "Coordinator"],
    ["/reports/evaluations/summary", label === "Admin" || label === "Coordinator"],
    ["/audit?page=1&limit=5", label === "Admin" || label === "Coordinator"],
  ];

  for (const [route, shouldRun] of checks) {
    if (!shouldRun) continue;
    await apiGet(token, route);
  }

  return { label, role: profile.role, username: profile.username };
}

async function runNegativeAccessTests() {
  const studentToken = await signIn("student1@fypms.test", "Student@123");
  const advisorToken = await signIn("advisor@fypms.test", "Advisor@123");
  const adminToken = await signIn("admin@fypms.test", "Admin@123");

  const studentDash = await apiGet(studentToken, "/dashboard/student");
  const studentProjects = await apiGet(studentToken, "/projects?page=1&limit=5");
  const advisorProjects = await apiGet(advisorToken, "/projects?page=1&limit=5");
  const advisorGroups = await apiGet(advisorToken, "/groups?page=1&limit=20");
  const adminProjects = await apiGet(adminToken, "/projects?page=1&limit=20");
  const adminGroups = await apiGet(adminToken, "/groups?page=1&limit=20");
  const evaluations = await apiGet(adminToken, "/evaluations?page=1&limit=5");
  const advisorProfile = await apiGet(advisorToken, "/auth/profile");

  const studentIds = new Set(
    (studentProjects.items ?? studentProjects).map((p) => p.id),
  );
  const advisorIds = new Set(
    (advisorProjects.items ?? advisorProjects).map((p) => p.id),
  );
  const advisorGroupIds = new Set(
    (advisorGroups.items ?? advisorGroups).map((g) => g.id),
  );
  const foreignProjectForStudent = (adminProjects.items ?? adminProjects).find(
    (p) => !studentIds.has(p.id),
  );
  const foreignProjectForAdvisor = (adminProjects.items ?? adminProjects).find(
    (p) => !advisorIds.has(p.id),
  );
  const foreignGroup = (adminGroups.items ?? adminGroups).find(
    (g) => g.id !== studentDash.groupId,
  );
  const foreignGroupForAdvisor = (adminGroups.items ?? adminGroups).find(
    (g) => !advisorGroupIds.has(g.id),
  );
  const evaluationId = (evaluations.items ?? evaluations)[0]?.id;

  if (foreignProjectForStudent) {
    await apiExpectDenied(studentToken, `/projects/${foreignProjectForStudent.id}`);
  }
  if (foreignGroup) {
    await apiExpectDenied(studentToken, `/groups/${foreignGroup.id}`);
  }
  if (foreignProjectForAdvisor) {
    await apiExpectDeniedPut(advisorToken, `/projects/${foreignProjectForAdvisor.id}`, {
      title: "Unauthorized update",
    });
  }
  if (evaluationId) {
    await apiExpectDeniedPut(advisorToken, `/evaluations/${evaluationId}`, {
      name: "Unauthorized update",
    });
  }
  if (foreignGroupForAdvisor && advisorProfile.personId) {
    await apiExpectDeniedPost(advisorToken, "/meetings", {
      groupId: foreignGroupForAdvisor.id,
      advisorId: advisorProfile.personId,
      meetingDate: new Date(Date.now() + 86_400_000).toISOString(),
    });
  }
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend/.env");
    process.exit(1);
  }

  console.log(`API base: ${API_BASE}`);

  try {
    await checkApiReachable();
  } catch (err) {
    console.error(`\n${err.message}`);
    process.exit(1);
  }

  const results = [];

  for (const user of DEMO_USERS) {
    process.stdout.write(`Testing ${user.label} (${user.email})... `);
    try {
      const result = await runSmokeForUser(user);
      results.push({ ...result, ok: true });
      console.log("OK");
    } catch (err) {
      results.push({ label: user.label, ok: false, error: err.message });
      console.log(`FAIL — ${err.message}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- Summary ---");
  for (const r of results) {
    console.log(r.ok ? `✓ ${r.label} (${r.role})` : `✗ ${r.label}: ${r.error}`);
  }

  if (!failed.length) {
    process.stdout.write("Testing negative access controls... ");
    try {
      await runNegativeAccessTests();
      console.log("OK");
    } catch (err) {
      console.log(`FAIL — ${err.message}`);
      failed.push({ label: "Negative access", ok: false, error: err.message });
    }
  }

  if (failed.length) {
    process.exit(1);
  }
  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

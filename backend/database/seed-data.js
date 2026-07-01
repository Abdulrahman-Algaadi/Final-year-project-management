/**
 * Seed FYPMS demo data + Supabase Auth users.
 * Usage: node database/seed-data.js
 */
const { Client } = require("pg");

const CONNECTION_URLS = [process.env.MIGRATE_DATABASE_URL].filter(Boolean);

/** Fixed auth UUIDs so re-runs stay consistent */
const AUTH_USERS = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@fypms.test",
    password: "Admin@123",
    role: "Admin",
    username: "admin",
    firstName: "System",
    lastName: "Administrator",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "coordinator@fypms.test",
    password: "Coord@123",
    role: "Coordinator",
    username: "coordinator",
    firstName: "Sarah",
    lastName: "Hassan",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "advisor@fypms.test",
    password: "Advisor@123",
    role: "Advisor",
    username: "advisor.ali",
    firstName: "Dr. Ali",
    lastName: "Khan",
    isAdvisor: true,
    designation: "Professor",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "advisor2@fypms.test",
    password: "Advisor@123",
    role: "Advisor",
    username: "advisor.sara",
    firstName: "Dr. Sara",
    lastName: "Malik",
    isAdvisor: true,
    designation: "Associate Professor",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "student1@fypms.test",
    password: "Student@123",
    role: "Student",
    username: "student.ahmad",
    firstName: "Ahmad",
    lastName: "Raza",
    isStudent: true,
    regNo: "FYP-2024-001",
    isLeader: true,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    email: "student2@fypms.test",
    password: "Student@123",
    role: "Student",
    username: "student.fatima",
    firstName: "Fatima",
    lastName: "Noor",
    isStudent: true,
    regNo: "FYP-2024-002",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    email: "student3@fypms.test",
    password: "Student@123",
    role: "Student",
    username: "student.usman",
    firstName: "Usman",
    lastName: "Iqbal",
    isStudent: true,
    regNo: "FYP-2024-003",
  },
];

async function lookupId(client, category, value) {
  const { rows } = await client.query(
    `SELECT id FROM lookup WHERE category = $1 AND value = $2`,
    [category, value],
  );
  if (!rows[0]) throw new Error(`Lookup not found: ${category}/${value}`);
  return rows[0].id;
}

async function statusId(client, name) {
  const { rows } = await client.query(
    `SELECT id FROM project_status WHERE status_name = $1`,
    [name],
  );
  if (!rows[0]) throw new Error(`Project status not found: ${name}`);
  return rows[0].id;
}

async function clearSeedData(client) {
  await client.query(`
    TRUNCATE TABLE
      audit_log,
      notification,
      meeting,
      submission,
      group_evaluation,
      project_advisor,
      group_project,
      group_student,
      evaluation,
      project,
      student_group,
      user_account,
      student,
      advisor,
      person,
      department,
      semester
    RESTART IDENTITY CASCADE
  `);

  await client.query(`
    DELETE FROM auth.identities
    WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@fypms.test')
  `);
  await client.query(`DELETE FROM auth.users WHERE email LIKE '%@fypms.test'`);
}

async function createAuthUser(client, user) {
  await client.query(
    `
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', $1::uuid, 'authenticated', 'authenticated', $2,
      crypt($3, gen_salt('bf')), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}', '{}',
      NOW(), NOW(), '', '', '', ''
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      encrypted_password = EXCLUDED.encrypted_password,
      email_confirmed_at = NOW(),
      updated_at = NOW()
    `,
    [user.id, user.email, user.password],
  );

  const identityData = JSON.stringify({ sub: user.id, email: user.email });
  await client.query(
    `
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      $1::uuid, $1::uuid, $2::jsonb, 'email', $1::text,
      NOW(), NOW(), NOW()
    )
    ON CONFLICT (provider, provider_id) DO UPDATE SET
      identity_data = EXCLUDED.identity_data,
      updated_at = NOW()
    `,
    [user.id, identityData],
  );
}

async function seed(client) {
  await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  console.log("Clearing previous seed data...");
  await clearSeedData(client);

  console.log("Creating Supabase Auth users...");
  for (const user of AUTH_USERS) {
    await createAuthUser(client, user);
  }

  const genderMale = await lookupId(client, "Gender", "Male");
  const genderFemale = await lookupId(client, "Gender", "Female");
  const studentActive = await lookupId(client, "StudentStatus", "Active");
  const roleSupervisor = await lookupId(client, "AdvisorRole", "Supervisor");
  const roleCoSupervisor = await lookupId(client, "AdvisorRole", "Co-Supervisor");
  const profId = await lookupId(client, "Designation", "Professor");
  const assocProfId = await lookupId(client, "Designation", "Associate Professor");
  const ongoingStatus = await statusId(client, "Ongoing");
  const approvedStatus = await statusId(client, "Approved");
  const completedStatus = await statusId(client, "Completed");

  const { rows: deptRows } = await client.query(
    `
    INSERT INTO department (name, code) VALUES
      ('Computer Science', 'CS'),
      ('Software Engineering', 'SE'),
      ('Information Technology', 'IT')
    RETURNING id, code
    `,
  );
  const csDept = deptRows.find((d) => d.code === "CS").id;
  const seDept = deptRows.find((d) => d.code === "SE").id;

  const { rows: semRows } = await client.query(
    `
    INSERT INTO semester (name, academic_year, start_date, end_date) VALUES
      ('Fall 2025', '2025-2026', '2025-09-01', '2026-01-31'),
      ('Spring 2026', '2025-2026', '2026-02-01', '2026-06-30')
    RETURNING id, name
    `,
  );
  const fallSem = semRows.find((s) => s.name === "Fall 2025").id;

  const personIds = {};
  for (const user of AUTH_USERS) {
    const gender =
      user.firstName === "Fatima" || user.firstName === "Sara" ? genderFemale : genderMale;
    const { rows } = await client.query(
      `
      INSERT INTO person (first_name, last_name, gender_id, email, contact_no, address, auth_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        user.firstName,
        user.lastName,
        gender,
        user.email,
        "+923001234567",
        "University Campus, Block A",
        user.id,
      ],
    );
    personIds[user.username] = rows[0].id;

    await client.query(
      `
      INSERT INTO user_account (person_id, username, role, auth_user_id, last_login)
      VALUES ($1, $2, $3, $4, NOW())
      `,
      [rows[0].id, user.username, user.role, user.id],
    );
  }

  const advisorAliId = personIds["advisor.ali"];
  const advisorSaraId = personIds["advisor.sara"];

  await client.query(
    `INSERT INTO advisor (id, department_id, designation_id, salary) VALUES ($1, $2, $3, 150000)`,
    [advisorAliId, csDept, profId],
  );
  await client.query(
    `INSERT INTO advisor (id, department_id, designation_id, salary) VALUES ($1, $2, $3, 130000)`,
    [advisorSaraId, seDept, assocProfId],
  );

  const studentIds = [
    personIds["student.ahmad"],
    personIds["student.fatima"],
    personIds["student.usman"],
  ];
  const regNos = ["FYP-2024-001", "FYP-2024-002", "FYP-2024-003"];
  for (let i = 0; i < studentIds.length; i++) {
    await client.query(
      `INSERT INTO student (id, registration_no, department_id, semester_id, enrollment_year)
       VALUES ($1, $2, $3, $4, 2024)`,
      [studentIds[i], regNos[i], csDept, fallSem],
    );
  }

  const { rows: projectRows } = await client.query(
    `
    INSERT INTO project (title, description, semester_id, status_id) VALUES
      (
        'AI-Powered Final Year Project Management System',
        'A web platform for managing FYP proposals, submissions, evaluations, and advisor meetings.',
        $1, $2
      ),
      (
        'Smart Campus IoT Monitoring',
        'IoT sensors and dashboards for energy and occupancy monitoring across campus buildings.',
        $1, $3
      ),
      (
        'Blockchain Academic Credential Verification',
        'Decentralized verification of degrees and transcripts using smart contracts.',
        $1, $4
      )
    RETURNING id, title
    `,
    [fallSem, ongoingStatus, approvedStatus, completedStatus],
  );
  const mainProjectId = projectRows[0].id;
  const iotProjectId = projectRows[1].id;

  const { rows: groupRows } = await client.query(
    `
    INSERT INTO student_group (group_name) VALUES
      ('Team Alpha - FYPMS'),
      ('Team Beta - IoT')
    RETURNING id, group_name
    `,
  );
  const alphaGroupId = groupRows[0].id;
  const betaGroupId = groupRows[1].id;

  await client.query(
    `
    INSERT INTO group_student (group_id, student_id, is_leader, status_id, assignment_date) VALUES
      ($1, $2, TRUE,  $5, CURRENT_DATE - 30),
      ($1, $3, FALSE, $5, CURRENT_DATE - 28),
      ($1, $4, FALSE, $5, CURRENT_DATE - 28),
      ($6, $3, TRUE,  $5, CURRENT_DATE - 20)
    `,
    [alphaGroupId, studentIds[0], studentIds[1], studentIds[2], studentActive, betaGroupId],
  );

  await client.query(
    `INSERT INTO group_project (group_id, project_id, assigned_date) VALUES ($1, $2, CURRENT_DATE - 25)`,
    [alphaGroupId, mainProjectId],
  );
  await client.query(
    `INSERT INTO group_project (group_id, project_id, assigned_date) VALUES ($1, $2, CURRENT_DATE - 15)`,
    [betaGroupId, iotProjectId],
  );

  await client.query(
    `
    INSERT INTO project_advisor (advisor_id, project_id, advisor_role_id, assignment_date) VALUES
      ($1, $3, $5, CURRENT_DATE - 25),
      ($2, $3, $6, CURRENT_DATE - 20),
      ($1, $4, $5, CURRENT_DATE - 15)
    `,
    [advisorAliId, advisorSaraId, mainProjectId, iotProjectId, roleSupervisor, roleCoSupervisor],
  );

  const { rows: evalRows } = await client.query(
    `
    INSERT INTO evaluation (name, total_marks, weight) VALUES
      ('Proposal Defense', 20, 15),
      ('Mid-Term Progress', 30, 25),
      ('Final Presentation', 50, 60)
    RETURNING id, name, total_marks
    `,
  );

  await client.query(
    `
    INSERT INTO group_evaluation (
      group_id, evaluation_id, obtained_marks, evaluation_date, evaluated_by,
      comments, is_published, attachment_path
    ) VALUES
      ($1, $2, 17, CURRENT_DATE - 14, $5, 'Strong problem statement and scope.', TRUE, NULL),
      ($1, $3, 24, CURRENT_DATE - 7,  $5, 'Good progress; improve documentation.', TRUE, NULL),
      ($1, $4, 0,  CURRENT_DATE,       $5, 'Scheduled for next week.', FALSE, NULL)
    `,
    [
      alphaGroupId,
      evalRows[0].id,
      evalRows[1].id,
      evalRows[2].id,
      advisorAliId,
    ],
  );

  await client.query(
    `
    INSERT INTO submission (
      group_id, title, file_path, version_no, submitted_at,
      submission_type, status, storage_bucket, file_size, mime_type, reviewed_by, reviewed_at
    ) VALUES
      (
        $1, 'FYP Proposal v1', 'submissions/alpha/proposal-v1.pdf', 1, NOW() - INTERVAL '20 days',
        'Proposal', 'Approved', 'submissions', 245760, 'application/pdf', $2, NOW() - INTERVAL '18 days'
      ),
      (
        $1, 'Progress Report - Month 1', 'submissions/alpha/progress-m1.pdf', 2, NOW() - INTERVAL '10 days',
        'ProgressReport', 'Approved', 'submissions', 512000, 'application/pdf', $2, NOW() - INTERVAL '8 days'
      ),
      (
        $1, 'Final Report Draft', 'submissions/alpha/final-draft.pdf', 3, NOW() - INTERVAL '2 days',
        'FinalReport', 'Pending', 'submissions', 1048576, 'application/pdf', NULL, NULL
      ),
      (
        $3, 'IoT Proposal', 'submissions/beta/iot-proposal.pdf', 1, NOW() - INTERVAL '12 days',
        'Proposal', 'RevisionRequired', 'submissions', 198432, 'application/pdf', $4, NOW() - INTERVAL '10 days'
      )
    `,
    [alphaGroupId, advisorAliId, betaGroupId, advisorSaraId],
  );

  await client.query(
    `
    INSERT INTO meeting (
      group_id, advisor_id, meeting_date, location, notes, status, online_link
    ) VALUES
      (
        $1, $2, NOW() - INTERVAL '15 days', 'CS Lab 3',
        'Reviewed proposal milestones and deliverables.', 'Completed', NULL
      ),
      (
        $1, $2, NOW() + INTERVAL '3 days', 'Online',
        'Mid-term progress review and demo walkthrough.', 'Scheduled', 'https://meet.example.com/fyp-alpha'
      ),
      (
        $3, $4, NOW() + INTERVAL '5 days', 'SE Conference Room',
        'IoT architecture discussion.', 'Scheduled', NULL
      )
    `,
    [alphaGroupId, advisorAliId, betaGroupId, advisorSaraId],
  );

  const adminPersonId = personIds.admin;
  const coordinatorPersonId = personIds.coordinator;
  await client.query(
    `
    INSERT INTO notification (person_id, title, message, is_read, created_at) VALUES
      ($1, 'Welcome to FYPMS', 'Your administrator account is ready. Explore the dashboard to manage the system.', FALSE, NOW() - INTERVAL '1 day'),
      ($2, 'Semester deadline reminder', 'Final submission deadline is in 2 weeks for Fall 2025 projects.', FALSE, NOW() - INTERVAL '3 hours'),
      ($3, 'Meeting scheduled', 'Your advisor scheduled a progress review meeting in 3 days.', TRUE, NOW() - INTERVAL '2 days'),
      ($4, 'Submission approved', 'Your Progress Report - Month 1 has been approved.', TRUE, NOW() - INTERVAL '8 days'),
      ($5, 'Revision required', 'Please update the IoT proposal methodology section.', FALSE, NOW() - INTERVAL '10 days')
    `,
    [
      adminPersonId,
      coordinatorPersonId,
      studentIds[0],
      studentIds[0],
      studentIds[1],
    ],
  );

  const { rows: adminAccount } = await client.query(
    `SELECT id FROM user_account WHERE username = 'admin'`,
  );
  await client.query(
    `
    INSERT INTO audit_log (table_name, record_id, action_type, performed_by, action_date) VALUES
      ('project', $1, 'INSERT', $2, NOW() - INTERVAL '25 days'),
      ('submission', 1, 'INSERT', $2, NOW() - INTERVAL '20 days'),
      ('group_evaluation', 1, 'UPDATE', $2, NOW() - INTERVAL '14 days'),
      ('user_account', $2, 'LOGIN', $2, NOW() - INTERVAL '1 hour')
    `,
    [mainProjectId, adminAccount[0].id],
  );

  const counts = await client.query(`
    SELECT 'department' AS tbl, COUNT(*)::int AS cnt FROM department
    UNION ALL SELECT 'semester', COUNT(*)::int FROM semester
    UNION ALL SELECT 'person', COUNT(*)::int FROM person
    UNION ALL SELECT 'student', COUNT(*)::int FROM student
    UNION ALL SELECT 'advisor', COUNT(*)::int FROM advisor
    UNION ALL SELECT 'user_account', COUNT(*)::int FROM user_account
    UNION ALL SELECT 'project', COUNT(*)::int FROM project
    UNION ALL SELECT 'student_group', COUNT(*)::int FROM student_group
    UNION ALL SELECT 'group_student', COUNT(*)::int FROM group_student
    UNION ALL SELECT 'group_project', COUNT(*)::int FROM group_project
    UNION ALL SELECT 'project_advisor', COUNT(*)::int FROM project_advisor
    UNION ALL SELECT 'evaluation', COUNT(*)::int FROM evaluation
    UNION ALL SELECT 'group_evaluation', COUNT(*)::int FROM group_evaluation
    UNION ALL SELECT 'submission', COUNT(*)::int FROM submission
    UNION ALL SELECT 'meeting', COUNT(*)::int FROM meeting
    UNION ALL SELECT 'notification', COUNT(*)::int FROM notification
    UNION ALL SELECT 'audit_log', COUNT(*)::int FROM audit_log
    UNION ALL SELECT 'lookup', COUNT(*)::int FROM lookup
    UNION ALL SELECT 'project_status', COUNT(*)::int FROM project_status
    ORDER BY tbl
  `);

  return counts.rows;
}

async function run() {
  if (!CONNECTION_URLS.length) {
    console.error("Set MIGRATE_DATABASE_URL in backend/.env before running seed.");
    process.exit(1);
  }
  for (const url of CONNECTION_URLS) {
    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log(`Connected: ${url.replace(/:([^:@/]+)@/, ":***@")}\n`);
      const counts = await seed(client);
      console.log("Row counts after seed:\n");
      for (const row of counts) {
        console.log(`  ${row.tbl.padEnd(18)} ${row.cnt}`);
      }
      console.log("\n--- Login credentials (use email + password on /login) ---\n");
      for (const u of AUTH_USERS) {
        console.log(`  ${u.role.padEnd(12)} ${u.email.padEnd(28)} ${u.password}`);
      }
      process.exit(0);
    } catch (err) {
      console.error(`Failed: ${err.message}`);
      if (err.detail) console.error(err.detail);
    } finally {
      await client.end().catch(() => {});
    }
  }
  process.exit(1);
}

run();

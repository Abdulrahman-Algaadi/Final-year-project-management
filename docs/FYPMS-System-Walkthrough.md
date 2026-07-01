# FYPMS — Complete System Walkthrough

**Final Year Project Management System**  
Document version: 1.0 | June 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Authentication Flow](#5-authentication-flow)
6. [Demo Mode vs Live Mode](#6-demo-mode-vs-live-mode)
7. [End-to-End Project Lifecycle](#7-end-to-end-project-lifecycle)
8. [Role-Based Walkthroughs](#8-role-based-walkthroughs)
9. [Module-by-Module Flow](#9-module-by-module-flow)
10. [API & Security Model](#10-api--security-model)
11. [Database & Infrastructure](#11-database--infrastructure)
12. [Setup & Deployment](#12-setup--deployment)
13. [Viva / Demo Script (15 minutes)](#13-viva--demo-script-15-minutes)
14. [Appendix: Login Credentials](#14-appendix-login-credentials)

---

## 1. Executive Summary

FYPMS is a full-stack web application that helps universities manage **Final Year Projects (FYP)**. It connects four stakeholder roles — **Student**, **Advisor**, **Coordinator**, and **Admin** — through a single portal.

### What the system does

- Registers students and organizes them into **project groups**
- Assigns **projects** and **advisors** to groups
- Tracks **submissions** (proposals, reports, presentations) with file upload
- Schedules **advisor meetings** and records **evaluations/grades**
- Sends **notifications** when events occur (meeting scheduled, submission reviewed)
- Provides **reports** and **audit logs** for administrators
- Supports **English and Arabic** UI with light/dark themes

### Access URLs

| Mode | URL |
|------|-----|
| Live login | http://localhost:3001/login |
| Demo (no backend) | http://localhost:3001/dashboard?demo=true&role=Student |
| API documentation | http://localhost:3000/docs |
| Health check | http://localhost:3000/api/v1/health |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│              Next.js Frontend (Port 3001)                        │
│   React 19 · TanStack Query · Supabase Auth Client               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST (JWT Bearer Token)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              NestJS Backend API (Port 3000)                      │
│   api/v1 · RBAC Guards · Validation · Swagger                    │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌───────────────────────────────────┐
│  PostgreSQL (Supabase)│    │  Supabase Auth + Storage           │
│  TypeORM entities     │    │  JWT tokens · submission files     │
└──────────────────────┘    └───────────────────────────────────┘
```

### Request flow (live mode)

1. User signs in via **Supabase Auth** on the frontend
2. Frontend receives a **JWT access token**
3. Every API call includes `Authorization: Bearer <token>`
4. Backend **JwtAuthGuard** validates the token with Supabase
5. **PermissionsGuard** checks role-based permissions (RBAC)
6. **Service layer** applies data scoping (user sees only their data)
7. Response returned as JSON with consistent `{ success, data, message }` envelope

---

## 3. Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Framer Motion, Recharts |
| Backend | NestJS 10, TypeORM, class-validator, Swagger, Helmet, Throttler |
| Database | PostgreSQL (hosted on Supabase) |
| Authentication | Supabase Auth (email/password) |
| File storage | Supabase Storage (submission uploads) |
| i18n | English + Arabic locale files |

---

## 4. User Roles & Permissions

### Role overview

| Role | Primary responsibility |
|------|------------------------|
| **Student** | View own group, project, submit work, see grades & meetings |
| **Advisor** | Supervise assigned groups, review submissions, schedule meetings, grade |
| **Coordinator** | Manage departments, groups, projects, students (operational admin) |
| **Admin** | Full system access including audit, reports, user management |

### Navigation access by role

| Page | Student | Advisor | Coordinator | Admin |
|------|:-------:|:-------:|:-----------:|:-----:|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Projects | ✓ | ✓ | ✓ | ✓ |
| Groups | — | ✓ | ✓ | ✓ |
| Students | — | ✓ | ✓ | ✓ |
| Submissions | ✓ | ✓ | ✓ | ✓ |
| Evaluations | ✓ | ✓ | ✓ | ✓ |
| Meetings | ✓ | ✓ | ✓ | ✓ |
| Departments | — | — | ✓ | ✓ |
| Reports | — | — | ✓ | ✓ |
| Audit Log | — | — | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | ✓ | ✓ |

### Data scoping rules

- **Student** — sees only their group, group's project, group's submissions/meetings/grades
- **Advisor** — sees only groups/projects assigned via `project_advisor` table
- **Coordinator / Admin** — sees all records; can mutate groups, projects, departments
- **Mutations** — group create/edit, evaluation templates, department CRUD are privileged-only

---

## 5. Authentication Flow

```
[Landing Page] → [Login Page]
       │
       ├─ Live: Enter email + password
       │         └─ Supabase signInWithPassword()
       │         └─ JWT stored in session
       │         └─ Redirect to /dashboard
       │
       └─ Demo: Click "View dashboard UI" OR add ?demo=true
                 └─ Mock user profile loaded locally
                 └─ No API calls (uses in-memory mock data)
```

### Live login steps

1. Open http://localhost:3001/login
2. Enter seeded credentials (see Appendix)
3. Frontend middleware checks Supabase session on protected routes
4. Unauthenticated users redirected to `/login`
5. Profile fetched from `GET /api/v1/auth/profile`

### Session & security

- JWT validated on every protected API endpoint
- Role and permissions loaded from `user_account` + `ROLE_PERMISSIONS` map
- Password change available in Settings (live mode only)
- Demo mode bypasses auth middleware when `?demo=true` is present

---

## 6. Demo Mode vs Live Mode

| Aspect | Demo Mode | Live Mode |
|--------|-----------|-----------|
| Trigger | `?demo=true&role=Student` | Normal login |
| Backend required | No | Yes (port 3000) |
| Data source | `app-data-provider.tsx` mock data | PostgreSQL via REST API |
| Auth | Simulated role switcher in Settings | Supabase JWT |
| File upload | Simulated | Supabase Storage |
| Notifications/Audit | Static mock / placeholder | Real DB records |
| Best for | UI walkthrough, viva without internet | Full integration demo |

### Switching demo roles

Settings → Demo role switcher → Student / Advisor / Admin / Coordinator

---

## 7. End-to-End Project Lifecycle

This is the core business flow of FYPMS from semester start to completion.

```
Phase 1: SETUP (Coordinator/Admin)
──────────────────────────────────
Create Departments → Create Semester → Create Projects
       ↓
Register Students → Form Groups → Assign Members + Leader
       ↓
Assign Project to Group → Assign Advisor(s) to Project

Phase 2: ACTIVE PROJECT (Student + Advisor)
────────────────────────────────────────────
Student submits Proposal → Advisor reviews (Approve/Revision/Reject)
       ↓
Advisor schedules Meetings → Students receive notification
       ↓
Student submits Progress Reports → Advisor reviews
       ↓
Advisor records Evaluation grades → Publishes grades → Students notified

Phase 3: COMPLETION (Coordinator/Admin)
────────────────────────────────────────
Final submission approved → Project status → Completed
       ↓
Reports generated (by department, enrollment, submissions, evaluations)
       ↓
Audit log records all critical mutations
```

### Status transitions (projects)

`Pending` → `Approved` → `Ongoing` → `Completed` (or `Rejected` / `Archived`)

### Submission statuses

`Pending` → `Approved` | `Rejected` | `RevisionRequired`

---

## 8. Role-Based Walkthroughs

### 8.1 Student Flow

**Goal:** Complete and track the final year project as a group member.

1. **Login** as `student1@fypms.test`
2. **Dashboard** — see project title, group name, supervisor, next meeting, submission count, average grade
3. **Projects** — view only the project assigned to your group
4. **Submissions** — upload proposal/report files; track review status
5. **Meetings** — view scheduled meetings with advisor (read-only)
6. **Evaluations** — view published grades only
7. **Notifications** — unread badge; mark as read
8. **Settings** — edit profile (demo) or change password (live)

**Typical student journey:**
```
Dashboard → Submissions → Upload file → Wait for review
         → Notifications (submission reviewed)
         → Evaluations (grades published)
```

---

### 8.2 Advisor Flow

**Goal:** Supervise assigned student groups.

1. **Login** as `advisor@fypms.test`
2. **Dashboard** — assigned projects, upcoming meetings, pending submissions, evaluations to publish
3. **Groups** — view only groups linked to your assigned projects
4. **Students** — view students in your scope
5. **Submissions** — review group submissions (approve/reject/request revision)
6. **Meetings** — create meetings for your groups (notification sent to students)
7. **Evaluations** — record marks per rubric; publish grades
8. **Projects** — view/update assigned projects

**Typical advisor journey:**
```
Dashboard → Submissions (pending) → Review submission
         → Meetings → Schedule new meeting
         → Evaluations → Enter marks → Publish
```

---

### 8.3 Coordinator Flow

**Goal:** Operate the FYP program day-to-day.

1. **Login** as `coordinator@fypms.test`
2. **Dashboard** — institution-wide stats (students, projects, groups, pending reviews)
3. **Groups** — create groups, add/remove members, assign projects
4. **Students** — browse student registry
5. **Projects** — create and manage all projects
6. **Departments** — CRUD department records
7. **Reports** — project summary, enrollment, submissions, evaluations, by-department charts
8. **Audit** — view system activity log

**Typical coordinator journey:**
```
Groups → Create "Team Alpha" → Add members → Assign project
      → Reports → View enrollment summary
      → Audit → Verify recent actions
```

---

### 8.4 Admin Flow

**Goal:** Full system governance (same as Coordinator plus user management capabilities).

Admin has **all permissions**. Use for:
- Evaluation template (rubric) management
- Department/semester configuration
- Global notification oversight
- Audit trail review

---

## 9. Module-by-Module Flow

### 9.1 Projects Module

| Action | Who can do it |
|--------|---------------|
| List projects | All roles (scoped) |
| Create project | Admin, Coordinator |
| Edit/delete project | Admin, Coordinator; Advisor (assigned only, update) |
| View project detail | Scoped by role |

**API:** `GET/POST /projects`, `GET/PUT/DELETE /projects/:id`

---

### 9.2 Groups Module

| Action | Who can do it |
|--------|---------------|
| List groups | Admin, Coordinator (all); Advisor (assigned); Student (own via /groups/me) |
| Create group | Admin, Coordinator |
| Add/remove members | Admin, Coordinator |
| Assign project to group | Admin, Coordinator |
| View group detail | Scoped by membership or advisor assignment |

**API:** `GET /groups`, `GET /groups/me`, `POST /groups/:id/members`, `POST /groups/:id/project`

---

### 9.3 Submissions Module

| Action | Who can do it |
|--------|---------------|
| Upload file | Student (own group) |
| List submissions | Scoped by group |
| Review (approve/reject) | Advisor (assigned), Admin, Coordinator |
| Download file | Scoped access + signed Supabase URL |

**Flow:**
```
Student uploads → status: Pending
Advisor reviews → status: Approved / RevisionRequired / Rejected
                → Notification sent to group
                → Audit log entry created
```

**API:** `POST /submissions/upload`, `GET /submissions`, `PUT /submissions/:id/review`

---

### 9.4 Meetings Module

| Action | Who can do it |
|--------|---------------|
| Create meeting | Advisor (own groups), Admin, Coordinator |
| List meetings | Scoped by role |
| Update/cancel | Advisor (own meetings), Admin, Coordinator |

**On create:** audit log + notification to all group students.

**API:** `POST /meetings`, `GET /meetings`, `GET /meetings/group/:groupId`

---

### 9.5 Evaluations Module

| Action | Who can do it |
|--------|---------------|
| Manage rubrics (templates) | Admin, Coordinator only |
| Record group grade | Advisor (assigned), Admin, Coordinator |
| Publish grade | Advisor, Admin, Coordinator |
| View grades | Student (published only); Advisor (all for their groups) |

**API:** `GET /evaluations`, `POST /evaluations/group`, `PUT /evaluations/group/:id`

---

### 9.6 Notifications Module

| Action | Who can do it |
|--------|---------------|
| View own notifications | All authenticated users |
| Mark as read | Owner only |
| Auto-created on | Meeting scheduled, submission reviewed |

**API:** `GET /notifications/me`, `PATCH /notifications/:id/read`

---

### 9.7 Reports Module (Admin/Coordinator)

- Projects summary
- Student enrollment by department
- Submissions summary
- Evaluations summary
- Projects by department (chart data)

**API:** `GET /reports/projects/summary`, `/reports/students/enrollment`, etc.

---

### 9.8 Audit Module (Admin/Coordinator)

Records INSERT/UPDATE actions on meetings and submission reviews (extensible).

**API:** `GET /audit?page=1&limit=20`

---

## 10. API & Security Model

### Permission model

Each role has a defined permission set (e.g. `project:read`, `submission:approve`, `group:update`). Endpoints declare required permissions via `@RequirePermissions()`. The guard uses **any-match** logic (user needs at least one listed permission).

### Access scoping pattern

```
Controller receives @CurrentUser()
       ↓
Service.findAllForUser(user, query)  OR  findByIdForUser(user, id)
       ↓
Advisor: filter by project_advisor joins
Student: filter by group membership
Admin/Coordinator: no filter
```

### Reference data endpoint

`GET /api/v1/reference` returns role-scoped lookup maps (departments, students, groups, etc.) used by the frontend to display names without calling admin-only list endpoints.

### Negative access controls (tested in smoke script)

- Student cannot access another group's project
- Student cannot access foreign group detail
- Advisor cannot update unassigned project
- Advisor cannot create meeting for unassigned group
- Advisor cannot modify evaluation templates

---

## 11. Database & Infrastructure

### Key entities

| Entity | Purpose |
|--------|---------|
| person | Base identity (name, email) |
| user_account | Login account linked to person + role |
| student | Student profile + department |
| advisor | Advisor profile + department |
| project | FYP project definition |
| student_group | Team working on a project |
| group_student | Group membership (with leader flag) |
| group_project | Links group to project |
| project_advisor | Links advisor to project |
| submission | Uploaded documents |
| meeting | Scheduled advisor meetings |
| evaluation | Grading rubric template |
| group_evaluation | Marks per group per rubric |
| notification | In-app messages |
| audit_log | System activity trail |

### Setup commands

```powershell
cd backend
npm run db:push      # Apply schema
npm run db:storage   # Create Supabase bucket
npm run db:seed      # Insert demo data + auth users
npm run smoke        # Verify API (backend must be running)
```

---

## 12. Setup & Deployment

### Local development

```powershell
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Environment files

- `backend/.env` — database, Supabase keys, CORS, port
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL`, Supabase public keys

### Docker (optional)

```powershell
docker compose up --build
```

### CI pipeline

GitHub Actions runs `npm run build` for both backend and frontend on push/PR.

---

## 13. Viva / Demo Script (15 minutes)

### Recommended presentation order

| Time | Section | What to show |
|------|---------|--------------|
| 0:00 | Introduction | Problem statement: FYP management is fragmented |
| 1:00 | Architecture | Show architecture diagram (section 2) |
| 2:00 | Demo mode | Open `?demo=true&role=Student` — no backend needed |
| 4:00 | Student view | Dashboard → Submissions → Notifications |
| 6:00 | Switch to Advisor | Settings role switcher or new demo URL |
| 8:00 | Advisor view | Review submission → Schedule meeting → Record grade |
| 10:00 | Coordinator view | Groups management → Reports page |
| 12:00 | Live mode | Login with real credentials; show API docs at /docs |
| 14:00 | Security | Mention RBAC, scoping, smoke tests |
| 15:00 | Q&A | Refer to this document |

### Key talking points for examiners

1. **Why Supabase?** — Managed auth + storage + Postgres reduces infrastructure overhead
2. **Why RBAC + scoping?** — Defense in depth: permission guard + service-level data filter
3. **Demo vs Live** — Same UI components; `isDemo` flag switches data source
4. **Scalability** — Paginated APIs, throttling, soft deletes, audit trail
5. **i18n** — EN/AR support for bilingual university environments

---

## 14. Appendix: Login Credentials

*Available after running `npm run db:seed`*

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fypms.test | Admin@123 |
| Coordinator | coordinator@fypms.test | Coord@123 |
| Advisor | advisor@fypms.test | Advisor@123 |
| Student | student1@fypms.test | Student@123 |

### Quick URLs

| Purpose | URL |
|---------|-----|
| Login | http://localhost:3001/login |
| Student demo | http://localhost:3001/dashboard?demo=true&role=Student |
| Advisor demo | http://localhost:3001/dashboard?demo=true&role=Advisor |
| Admin demo | http://localhost:3001/dashboard?demo=true&role=Admin |
| API Swagger | http://localhost:3000/docs |

---

*End of document — FYPMS Final Year Project Management System*

# FYPMS — Final Year Project Management System

Full-stack monorepo for managing final-year projects: students, advisors, coordinators, and admins.

| Layer | Stack | Port |
|-------|-------|------|
| Frontend | Next.js 16, React 19, TanStack Query, Supabase Auth | **3001** |
| Backend | NestJS 10, TypeORM, PostgreSQL (Supabase) | **3000** |
| API prefix | `api/v1` | |

## Quick start

### 1. Environment

```powershell
# Backend — copy and fill in Supabase credentials
copy backend\.env.example backend\.env

# Frontend
copy frontend\.env.local.example frontend\.env.local
```

Set `MIGRATE_DATABASE_URL` in `backend/.env` to your Supabase **direct** Postgres URL (port 5432) for migrations and seeding.

### 2. Database setup (first time)

```powershell
cd backend
npm install
npm run db:push      # apply schema
npm run db:storage   # create Supabase storage bucket
npm run db:seed      # demo users + sample data
```

### 3. Run locally

```powershell
# Terminal 1 — API
cd backend
npm run dev

# Terminal 2 — UI
cd frontend
npm install
npm run dev
```

- **Live app:** http://localhost:3001/login  
- **API docs:** http://localhost:3000/docs  
- **Health:** http://localhost:3000/api/v1/health  

### 4. Demo mode (no backend required)

http://localhost:3001/dashboard?demo=true&role=Student

Roles: `Student` | `Advisor` | `Admin` | `Coordinator`

### 5. Smoke test (backend must be running)

```powershell
cd backend
npm run smoke
```

## Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@fypms.test` | `Admin@123` |
| Coordinator | `coordinator@fypms.test` | `Coord@123` |
| Advisor | `advisor@fypms.test` | `Advisor@123` |
| Student | `student1@fypms.test` | `Student@123` |

## Project structure

```
backend/          NestJS API, TypeORM entities, smoke tests
frontend/         Next.js dashboard UI
backend/database/ Schema SQL, seed script, storage setup
```

## Features

- Role-based dashboards and navigation
- Projects, groups, students, submissions (file upload)
- Meetings, evaluations, notifications
- Reports and audit log (admin/coordinator)
- English / Arabic UI
- Demo mode for offline presentations
- API access scoping per role

## Production & deployment

### Frontend → Vercel

Vercel hosts the **Next.js app only**. The NestJS API must run elsewhere (Render, Railway, VPS, etc.).

1. **Push to GitHub** (ensure `.env` files are not committed).
2. **Vercel** → [vercel.com/new](https://vercel.com/new) → Import repository.
3. Set **Root Directory** to `frontend`.
4. **Environment variables** (Production + Preview):

   | Variable | Example |
   |----------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `NEXT_PUBLIC_API_URL` | `https://fypms-api.onrender.com/api/v1` |

5. Deploy. Note your URL: `https://your-app.vercel.app`.

6. **Supabase Auth** → Authentication → URL Configuration:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`, `http://localhost:3001/**`

### Backend → Render (recommended)

Use the included `render.yaml` blueprint:

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect repo.
2. Set secret env vars (`DATABASE_URL`, Supabase keys, `SUPABASE_JWT_SECRET`).
3. Set `CORS_ORIGINS` to your Vercel URL: `https://your-app.vercel.app`
4. After deploy, copy the API URL into Vercel's `NEXT_PUBLIC_API_URL`.

Preview deployments on `*.vercel.app` are allowed automatically (`CORS_ALLOW_VERCEL=true`).

### Manual production build

```powershell
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm run start
```

### Security checklist

- Set `NODE_ENV=production` on the API host
- Restrict `CORS_ORIGINS` to your real Vercel domain in production
- Set `SUPABASE_JWT_SECRET` on the API for faster auth
- Never commit `.env` / `.env.local` with real secrets
- Rotate credentials if they were ever exposed

## Production notes (local)

- Set `NODE_ENV=production` and restrict `CORS_ORIGINS`
- Use `npm run build` + `npm run start:prod` for backend
- Use `npm run build` + `npm run start` for frontend
- Never commit `.env` files with real secrets
- Rotate credentials if they were ever exposed in scripts

## Scripts

| Command | Where | Description |
|---------|-------|-------------|
| `npm run dev` | backend / frontend | Development server |
| `npm run build` | backend / frontend | Production build |
| `npm run db:push` | backend | Apply database schema |
| `npm run db:seed` | backend | Seed demo data |
| `npm run db:storage` | backend | Setup Supabase bucket |
| `npm run smoke` | backend | API smoke test |
| `npm test` | backend | Unit tests |

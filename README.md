# Builders' Circle — Final Architecture

Three separate processes, three folders:

```
builders-circle/
├── backend/            FastAPI · port 8000  (the API layer)
├── frontend/           Next.js · port 3001  (internal DRI controller)
└── frontend-public/    Next.js · port 3000  (public site for applicants)
```

**How they talk to each other:**

```
                ┌──────────────────────┐
                │   frontend-public     │   Public site (port 3000)
                │  ─ Landing            │   - Applicants sign up / sign in
                │  ─ Apply form         │   - Uses Supabase Auth for auth
                │  ─ Status             │   - Calls FastAPI to SUBMIT applications
                └──────────┬───────────┘
                           │  POST /api/applications
                           ▼
                ┌──────────────────────┐
                │       backend         │   FastAPI (port 8000)
                │  ─ /api/applications  │   - Single source of truth for
                │  ─ /api/ingest        │     application writes & decisions
                │  ─ /api/match         │   - Talks to Supabase
                │  ─ /api/introductions │
                └──────────┬───────────┘
                           │  POST /accept   POST /reject   POST /hold
                           ▲
                ┌──────────────────────┐
                │       frontend        │   Internal DRI controller (port 3001)
                │  ─ Dashboard          │   - No login required (local-only)
                │  ─ Applications       │   - Reads applications direct from Supabase
                │  ─ Builders / Matches │   - Writes (accept/reject) go via FastAPI
                │  ─ Introductions      │
                └──────────────────────┘
```

---

## ONE-TIME SETUP

### 1. Run the migration in Supabase

Open Supabase → SQL Editor → New query → paste `backend/db/migration_applications.sql` → Run.

This is **idempotent** — safe to run even if you've already run an earlier version. It creates `applications` and `newsletter_subscribers` tables, links `applications.user_id` to `auth.users`.

✅ Verify in Table Editor: you should see `applications` and `newsletter_subscribers` tables.

### 2. Disable email confirmation in Supabase Auth

Supabase → **Authentication** → **Sign In / Up** → toggle **"Confirm email" OFF** → Save.

(This lets applicants sign up + get a session instantly. Re-enable for production.)

### 3. Create three `.env.local` files

Each folder has a `.env.local.example` — copy it to `.env.local` and fill in your Supabase keys:

```powershell
# from repo root
Copy-Item backend/.env.local.example backend/.env.local
Copy-Item frontend/.env.local.example frontend/.env.local
Copy-Item frontend-public/.env.local.example frontend-public/.env.local
```

Then edit each one and replace `your-anon-key-here` / `your-service-role-key-here` with the real keys from your Supabase dashboard (Settings → API).

### 4. Install dependencies (once each)

```powershell
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ..

# Internal frontend
cd frontend
npm install
cd ..

# Public frontend
cd frontend-public
npm install
cd ..
```

---

## RUNNING THE STACK

You need **three terminals**, one for each process:

**Terminal 1 — Backend (FastAPI on port 8000):**
```powershell
cd backend
.venv\Scripts\activate
uvicorn main:app --reload-exclude ".venv" --port 8000
```

**Terminal 2 — Internal controller (port 3001):**
```powershell
cd frontend
npm run dev
```
→ Opens at http://localhost:**3001**

**Terminal 3 — Public site (port 3000):**
```powershell
cd frontend-public
npm run dev
```
→ Opens at http://localhost:**3000**

---

## END-TO-END TEST

Two browser tabs make this easiest.

**Tab 1 — Public site** (http://localhost:3000)
1. Click **Apply** in the nav → redirected to `/signup`
2. Fill out signup with any test email + password ≥ 6 chars → **Create account**
3. Lands on `/apply` with name + email prefilled → fill the 5-step form → **Submit**
4. Lands on `/apply/video` → click **Skip the video** → lands on `/status` showing "Under review"

**Tab 2 — Internal controller** (http://localhost:3001)
5. Walks straight in (no login). Click **Applications** in the sidebar.
6. Your test submission is at the top. Click it.
7. Click **Accept** → confirm.

Behind the scenes: Tab 2's Accept button calls `POST http://localhost:8000/api/applications/{id}/accept`. FastAPI creates a row in `founders` and `founder_profiles`, then marks the application as accepted.

8. In the internal controller, click **Builders** — the accepted user is now in the matching pool.
9. Back to Tab 1, refresh `/status` (or sign back in) — now shows the **Welcome to the Circle** view with the copy-to-clipboard LinkedIn post.

---

## WHAT EACH PIECE OWNS

| Piece | Owns | Talks to |
|---|---|---|
| **frontend-public** | Public landing, applicant accounts, application submission UI | Supabase Auth (signup/signin/session), FastAPI (submit application), Supabase (read own application) |
| **frontend** (internal) | DRI dashboard, applications review, builders, matches, introductions, events | Supabase (all reads — applications, founders, matches), FastAPI (accept/reject/hold applications, create introductions) |
| **backend** (FastAPI) | All writes with side effects; the API contract between the two frontends | Supabase (the only thing it talks to) |

Note: a few reads in the internal controller still go direct to Supabase via `lib/queries.ts` (Marc's existing pattern). This is intentional — reads with no side effects don't need a layer. Writes always go through FastAPI.

---

## TROUBLESHOOTING

**"Failed to fetch" when submitting an application** — Backend isn't running. Start it in Terminal 1.

**"CORS error"** — Check `backend/main.py` includes both `http://localhost:3000` and `http://localhost:3001` in `allow_origins`. Restart uvicorn after changes.

**"Email not confirmed" on signin** — Disable email confirmation in Supabase Auth settings (one-time setup step 2).

**Internal controller shows 0 applications but you submitted one** — Open `/applications` filter to "All". If still missing, check the application reached Supabase: Table Editor → `applications` table.

**Login form on internal controller** — There shouldn't be one. If you see `/login`, delete `app/login/`, `middleware.ts`, and `lib/auth.ts` from `frontend/` — these belong to an older version.

**Port already in use** — Something else is on 3000/3001/8000. Kill it (`netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`).

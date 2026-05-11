<<<<<<< HEAD
# Builders Circle

Co-founder matchmaking platform for b2venture VC. Founders apply via form, an LLM pipeline enriches their profile, a rules engine generates ranked matches, a DRI reviews and approves introductions, and an email is sent via Resend.

All LLM inference runs locally via Ollama. No founder data leaves the infrastructure.

---

## Academic partnership

This project was developed as part of an academic collaboration between ESADE alumni and b2venture VC.

**Company mentors at b2venture**
- Dominik Perisa — dominik.perisa@b2venture.vc
- Karim El-Ghawi — karim.el-ghawi@b2venture.vc

**Project team — ESADE alumni**
- Amat Montoto Viladrich — amat.montoto@alumni.esade.edu
- Patricia Unger — patricia.unger@alumni.esade.edu
- Federica Selvini — federica.selvini@alumni.esade.edu
- Marc Sarda Masriera — marc.sarda2@alumni.esade.edu
- Vera Kannewischer — vera.kannwischer@alumni.esade.edu

---

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Git
- Ollama installed and running (https://ollama.com/download)
- A Supabase project (https://supabase.com)
- A Resend account for emails (https://resend.com)

---

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/builders-circle.git
cd builders-circle
=======
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
>>>>>>> origin/feat/amat
```

---

<<<<<<< HEAD
## 2. Database setup

Open the Supabase SQL Editor and run the following files in order:
- backend/db/schema.sql
- backend/db/anon_read_tables.sql
- backend/db/indexes.sql

---

## 3. Pull the LLM models

Ollama must be installed and running before this step.

```bash
ollama pull llama3.2:3b
ollama pull mistral:7b
```

Verify they are available:

```bash
ollama list
```

---

## 4. Backend setup

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

On Windows (PowerShell):
```powershell
.venv\Scripts\activate
```

On macOS or Linux:
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```bash
cp .env.example .env.local
```

Fill in the values in `backend/.env.local`:
- SUPABASE_URL=https://YOUR_PROJECT.supabase.co
- SUPABASE_SERVICE_KEY=your_service_role_key
- OLLAMA_BASE_URL=http://localhost:11434
- RESEND_API_KEY=re_your_key

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

Verify it is running:
    http://localhost:8000/health

Expected response: `{"status": "ok"}`

API documentation is available at:
    http://localhost:8000/docs

---

## 5. Frontend setup

```bash
cd frontend
npm install
```

Create the environment file:

```bash
cp .env.example .env.local
```

Fill in the values in `frontend/.env.local`:
    NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

Start the frontend:

```bash
npm run dev
```

Open the dashboard:
    http://localhost:3000

---

## 6. Seed mock data (optional)

From the root of the project, with the backend virtual environment active:

```bash
python scripts/seed_mock_data.py --count 30
```

---

## 7. Run the matching engine

Via the API (use the Swagger UI at `/docs`):
    POST http://localhost:8000/api/match
        Body: { "dry_run": true }

Or via the CLI script:

```bash
python scripts/run_matching.py --dry-run
python scripts/run_matching.py --send
```

---

## Project structure

```
backend/
  main.py                    FastAPI entrypoint
  pipeline/
    ingestion.py             LangGraph ingestion pipeline (llama3.2:3b + mistral:7b)
    matching.py              Rules engine and soft scoring
  models/
    founder.py               Pydantic schemas for founder profile
    match.py                 Pydantic schemas for match
  routes/
    ingest.py                POST /api/ingest
    match.py                 POST /api/match
    introductions.py         POST /api/introductions
  db/
    schema.sql               Source of truth for DB schema
    indexes.sql              Performance indexes
    anon_read_tables.sql     RLS policies for anon access

frontend/
  app/                       Next.js App Router pages
  components/                Shared UI components
  lib/                       Supabase client, queries, server actions

scripts/
  seed_mock_data.py          Generate mock founders for development
  run_matching.py            CLI trigger for matching run
  anon_read_tables.sql       RLS policies, run once in Supabase SQL editor
  indexing_db.sql            Performance indexes, run once in Supabase SQL editor
```

---

## Enabling introduction emails

Emails are disabled by default. To activate them, open `backend/routes/introductions.py` and set:

```python
EMAILS_ENABLED = True
```

The Resend API key must be set in `backend/.env.local` before enabling this.

---

## Key rules

- Never alter tables directly in the Supabase UI. Edit `schema.sql` and run the migration.
- No secrets in code. All keys go in `.env.local` files, which are gitignored.
- DRI approval is required before any introduction email is sent. There is no auto-send.
- Hard filter failures are silent by design. A pair that fails a hard filter is never shown to the DRI.
- Matching is deterministic. The same input always produces the same score.


# backend/.env.example
Set-Content backend/.env.example "SUPABASE_URL=
SUPABASE_SERVICE_KEY=
OLLAMA_BASE_URL=http://localhost:11434
RESEND_API_KEY="

# frontend/.env.example
Set-Content frontend/.env.example "NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY="
=======
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
>>>>>>> origin/feat/amat

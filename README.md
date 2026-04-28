# Builders Circle

Co-founder matchmaking platform for b2venture VC. Founders apply via form, an LLM pipeline enriches their profile, a rules engine generates ranked matches, a DRI reviews and approves introductions, and an email is sent via Resend.

All LLM inference runs locally via Ollama. No founder data leaves the infrastructure.

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
```

---

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
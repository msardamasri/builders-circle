-- =====================================================================
-- Builders' Circle — migration for applicant accounts & application flow
-- Idempotent: safe to run multiple times. Run in Supabase → SQL Editor.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1) applications — every application submitted via the public site
-- ---------------------------------------------------------------------
create table if not exists applications (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,

  full_name           text not null,
  email               text not null,
  linkedin            text,

  founder_section     jsonb not null default '{}'::jsonb,
  idea_section        jsonb not null default '{}'::jsonb,
  personal_section    jsonb not null default '{}'::jsonb,

  video_url           text,
  video_questions     text[],
  video_deadline      timestamptz,
  video_submitted_at  timestamptz,

  status              text not null default 'pending_review',

  reviewed_at         timestamptz,
  reviewed_by         text,
  decision_reason     text,
  dri_notes           text,

  founder_id          uuid references founders(id),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_applications_status     on applications(status);
create index if not exists idx_applications_email      on applications(email);
create index if not exists idx_applications_user_id    on applications(user_id);
create index if not exists idx_applications_created_at on applications(created_at desc);

-- ---------------------------------------------------------------------
-- 2) newsletter_subscribers — captured from the landing page
-- ---------------------------------------------------------------------
create table if not exists newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  source          text not null default 'landing',
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) Auto-update updated_at on applications
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'applications_updated_at') then
    create trigger applications_updated_at
      before update on applications
      for each row execute function update_updated_at();
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 4) RLS disabled (matches the rest of your schema)
-- ---------------------------------------------------------------------
alter table applications disable row level security;
alter table newsletter_subscribers disable row level security;

create extension if not exists "pgcrypto";

-- Events first (matches depends on it)
create table events (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  location        text,
  event_date      date,
  created_at      timestamptz not null default now()
);

-- Raw form submissions
create table founders (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  full_name       text not null,
  raw_form_json   jsonb not null,
  status          text not null default 'received',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Enriched JSON post-LLM
create table founder_profiles (
  id              uuid primary key default gen_random_uuid(),
  founder_id      uuid not null references founders(id) on delete cascade,
  profile_json    jsonb not null,
  raw_summary     text,
  validated       boolean not null default false,
  processed_at    timestamptz not null default now()
);

-- Match pairs
create table matches (
  id              uuid primary key default gen_random_uuid(),
  founder_a_id    uuid not null references founders(id),
  founder_b_id    uuid not null references founders(id),
  score           float not null,
  recommendation  text,
  match_thesis    text,
  main_concern    text,
  status          text not null default 'pending_review',
  dri             text,
  event_id        uuid references events(id),
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

-- Sent introductions
create table introductions (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references matches(id),
  founder_a_id    uuid not null references founders(id),
  founder_b_id    uuid not null references founders(id),
  sent_at         timestamptz not null default now(),
  feedback_a      text,
  feedback_b      text
);

-- Auto-update updated_at on founders
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger founders_updated_at
  before update on founders
  for each row execute function update_updated_at();
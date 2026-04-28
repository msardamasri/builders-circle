-- Matching query: fetch active profiles fast
create index if not exists idx_founders_status
  on founders(status);

-- Profile lookup by founder_id (used in every match computation)
create index if not exists idx_founder_profiles_founder_id
  on founder_profiles(founder_id);

-- Match queries: filter by status for DRI dashboard
create index if not exists idx_matches_status
  on matches(status);

-- Match queries: find pending matches per founder (max-3 guard)
create index if not exists idx_matches_founder_a
  on matches(founder_a_id, status);
create index if not exists idx_matches_founder_b
  on matches(founder_b_id, status);

-- Introductions: exclude already-introduced pairs
create index if not exists idx_introductions_pair
  on introductions(founder_a_id, founder_b_id);

-- Event-based filtering
create index if not exists idx_matches_event
  on matches(event_id) where event_id is not null;

-- Profile JSONB: index logistics commitment for hard filter pre-screening
create index if not exists idx_profiles_commitment
  on founder_profiles using gin (profile_json jsonb_path_ops);
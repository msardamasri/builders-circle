-- Allow anon to read all tables (DRI dashboard is internal)
create policy "anon read founders"
  on founders for select to anon using (true);

create policy "anon read founder_profiles"
  on founder_profiles for select to anon using (true);

create policy "anon read matches"
  on matches for select to anon using (true);

create policy "anon read introductions"
  on introductions for select to anon using (true);

create policy "anon read events"
  on events for select to anon using (true);

-- Allow anon to insert (for form submissions)
create policy "anon insert founders"
  on founders for insert to anon with check (true);

-- Allow anon to update matches (DRI approve/reject)
create policy "anon update matches"
  on matches for update to anon using (true);
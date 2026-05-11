import { unstable_cache } from "next/cache";
import { supabase } from "./supabase";

// ── Dashboard metrics ──────────────────────────────────────────────────────

export const getDashboardMetrics = unstable_cache(
  async () => {
    const [founders, pending, intros, strong, awaitingApps] = await Promise.all([
      supabase.from("founders").select("id", { count: "exact", head: true }),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("introductions").select("id", { count: "exact", head: true }),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("recommendation", "strong").eq("status", "pending_review"),
      supabase.from("applications").select("id", { count: "exact", head: true }).in("status", ["pending_review", "video_pending"]),
    ]);

    return {
      totalFounders: founders.count ?? 0,
      pendingMatches: pending.count ?? 0,
      introsSent: intros.count ?? 0,
      strongMatches: strong.count ?? 0,
      awaitingApplications: awaitingApps.count ?? 0,
    };
  },
  ["dashboard-metrics"],
  { revalidate: 60 }
);

// ── Matches ────────────────────────────────────────────────────────────────

export async function getPendingMatches() {
  const { data: matchData, error } = await supabase
    .from("matches")
    .select(`
      id, score, recommendation, match_thesis, main_concern, status, created_at,
      founder_a:founders!matches_founder_a_id_fkey(id, full_name, email),
      founder_b:founders!matches_founder_b_id_fkey(id, full_name, email)
    `)
    .eq("status", "pending_review")
    .order("score", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  if (!matchData) return [];

  const founderIds = [...new Set(matchData.flatMap(m => [
    (m.founder_a as any)?.id, (m.founder_b as any)?.id
  ]).filter(Boolean))];

  const { data: profiles } = await supabase
    .from("founder_profiles")
    .select("founder_id, profile_json")
    .in("founder_id", founderIds);

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.founder_id, p.profile_json]));

  return matchData.map(m => ({
    ...m,
    profileA: profileMap[(m.founder_a as any)?.id] ?? null,
    profileB: profileMap[(m.founder_b as any)?.id] ?? null,
  }));
}

// ── Builders ───────────────────────────────────────────────────────────────

export const getBuilders = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("founders")
      .select(`
        id, full_name, email, status, created_at,
        founder_profiles(profile_json)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ["builders-list"],
  { revalidate: 30 }
);

// ── Introductions ──────────────────────────────────────────────────────────

export const getIntroductions = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from("introductions")
      .select(`
        id, sent_at, feedback_a, feedback_b,
        match:matches(score, recommendation),
        founder_a:founders!introductions_founder_a_id_fkey(full_name, email),
        founder_b:founders!introductions_founder_b_id_fkey(full_name, email)
      `)
      .order("sent_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ["introductions-list"],
  { revalidate: 120 }
);

// ── Applications (NEW) ─────────────────────────────────────────────────────

export async function getApplications(statusFilter?: string[]) {
  let q = supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (statusFilter && statusFilter.length > 0) q = q.in("status", statusFilter);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getApplicationById(id: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

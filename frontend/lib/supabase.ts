import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single client for all server queries (no cookies needed — RLS via anon key)
export const supabase = createClient(url, anon);

// Alias for server components
export async function createSupabaseServer() {
  return supabase;
}
"use server";

import { revalidateTag } from "next/cache";
import { supabase } from "./supabase";

export async function updateMatchStatus(
  matchId: string,
  status: "approved" | "rejected",
  dri: string = "DRI"
) {
  const { error } = await supabase
    .from("matches")
    .update({ status, dri, reviewed_at: new Date().toISOString() })
    .eq("id", matchId);

  if (error) throw new Error(error.message);

  if (status === "approved") {
    try {
      await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/introductions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
    } catch (e) {
      console.error("Intro email failed:", e);
    }
  }

  revalidateTag("dashboard-metrics");
  return { success: true };
}
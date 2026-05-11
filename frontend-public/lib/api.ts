// All write operations from the public site go through the FastAPI backend.
// Configure NEXT_PUBLIC_API_URL in .env.local (defaults to http://localhost:8000).

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApplicationPayload = {
  user_id: string;
  full_name: string;
  email: string;
  linkedin?: string;
  founder_section: any;
  idea_section: any;
  personal_section: any;
};

export async function submitApplication(payload: ApplicationPayload) {
  try {
    const res = await fetch(`${API_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false as const, error: text || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true as const, id: data.application_id as string };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "Network error" };
  }
}

export async function subscribeNewsletter(email: string) {
  // Newsletter goes direct to Supabase since it's a single trivial insert with no side effects.
  // If you'd rather route it through FastAPI too, add a /api/newsletter route and call it here.
  const { supabase } = await import("./supabase");
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Please enter a valid email" };
  }
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: email.trim().toLowerCase(), source: "landing" }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

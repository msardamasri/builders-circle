"use server";

import { revalidatePath } from "next/cache";

const API_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function postJson(path: string, body: any = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: text || `HTTP ${res.status}` };
  }
  return { ok: true as const, data: await res.json() };
}

export async function acceptApplication(applicationId: string) {
  const res = await postJson(`/api/applications/${applicationId}/accept`, {
    dri: "b2venture-team",
  });
  if (!res.ok) return res;
  revalidatePath("/applications");
  revalidatePath("/builders");
  revalidatePath("/dashboard");
  return res;
}

export async function rejectApplication(applicationId: string, reason: string) {
  const res = await postJson(`/api/applications/${applicationId}/reject`, {
    reason, dri: "b2venture-team",
  });
  if (!res.ok) return res;
  revalidatePath("/applications");
  return res;
}

export async function holdApplication(applicationId: string, note: string) {
  const res = await postJson(`/api/applications/${applicationId}/hold`, {
    reason: note, dri: "b2venture-team",
  });
  if (!res.ok) return res;
  revalidatePath("/applications");
  return res;
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "profiled":            { label: "Profiled",       color: "#4b5563", bg: "#f3f4f6" },
  "Searching now":       { label: "Searching now",  color: "#15803d", bg: "#f0fdf4" },
  "received":            { label: "Received",       color: "#2563eb", bg: "#eff6ff" },
  "ingestion_failed":    { label: "Failed",         color: "#dc2626", bg: "#fef2f2" },
  "needs_manual_review": { label: "Review needed",  color: "#d97706", bg: "#fffbeb" },
};

export default function FounderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [founder, setFounder] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      supabase.from("founders").select("*").eq("id", id).single(),
      supabase.from("founder_profiles").select("profile_json, raw_summary").eq("founder_id", id).maybeSingle(),
      supabase.from("matches")
        .select("id, score, recommendation, status, founder_a_id, founder_b_id, created_at")
        .or(`founder_a_id.eq.${id},founder_b_id.eq.${id}`)
        .order("created_at", { ascending: false }),
    ]).then(async ([f, p, m]) => {
      setFounder(f.data);
      setProfile(p.data?.profile_json ?? null);
      setNotes((f.data as any)?.notes ?? "");

      // Get partner names for matches
      if (m.data && m.data.length > 0) {
        const partnerIds = m.data.map((row: any) =>
          row.founder_a_id === id ? row.founder_b_id : row.founder_a_id
        );
        const { data: partners } = await supabase
          .from("founders")
          .select("id, full_name")
          .in("id", partnerIds);
        const partnerMap = Object.fromEntries((partners ?? []).map(p => [p.id, p.full_name]));
        setMatches(m.data.map((row: any) => ({
          ...row,
          partner_name: partnerMap[row.founder_a_id === id ? row.founder_b_id : row.founder_a_id] ?? "Unknown",
          partner_id: row.founder_a_id === id ? row.founder_b_id : row.founder_a_id,
        })));
      }
      setLoading(false);
    });
  }, [id]);

  async function saveNotes() {
    setSavingNotes(true);
    await supabase.from("founders").update({ notes }).eq("id", id);
    setSavingNotes(false);
  }

  if (loading) {
    return (
      <div style={{ color: "var(--gray-400)", fontSize: 13 }}>Loading...</div>
    );
  }

  if (!founder) {
    return (
      <div>
        <Link href="/builders" style={{ fontSize: 12, color: "var(--gray-500)" }}>← Back to builders</Link>
        <p style={{ marginTop: 16, color: "var(--gray-500)" }}>Founder not found.</p>
      </div>
    );
  }

  const sc = STATUS_CONFIG[founder.status] ?? { label: founder.status, color: "#6b7280", bg: "#f3f4f6" };
  const l = profile?.logistics ?? {};
  const r = profile?.role ?? {};
  const v = profile?.venture ?? {};
  const ps = profile?.psychographics ?? {};
  const arch = profile?.archetypes ?? {};

  return (
    <div>
      {/* Back link */}
      <Link href="/builders" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, color: "var(--gray-500)", marginBottom: 18,
      }}>
        ← Back to builders
      </Link>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 24, gap: 24, flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{
            fontSize: 32, fontWeight: 600, color: "var(--black)", margin: 0,
            letterSpacing: "-0.02em",
          }}>
            {founder.full_name}
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--gray-500)" }}>
            {founder.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 11, fontWeight: 500, padding: "5px 10px", borderRadius: 6,
            color: sc.color, background: sc.bg,
          }}>
            {sc.label}
          </span>
          {arch.primary && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6,
              background: "var(--accent-light)", color: "var(--accent-dark)",
            }}>
              {arch.primary}
            </span>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* LLM summary */}
          {profile?.llm_summary && (
            <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                Summary
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6 }}>
                {profile.llm_summary}
              </p>
            </div>
          )}

          {/* Logistics + Role */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Section title="Logistics">
              <Field label="Location" value={l.location} />
              <Field label="Remote OK" value={l.remote_ok ? "Yes" : "No"} />
              <Field label="Commitment" value={l.commitment} />
              <Field label="Hours / week" value={l.hours_per_week} />
              <Field label="Runway" value={l.runway_months ? `${l.runway_months} months` : "—"} />
            </Section>

            <Section title="Role">
              <Field label="Primary skill" value={r.primary_skill} />
              <Field label="Looking for" value={(r.looking_for ?? []).join(", ")} />
              <Field label="Years experience" value={r.years_experience} />
              <Field label="Founder history" value={r.founder_history} />
            </Section>
          </div>

          {/* Venture */}
          <Section title="Venture">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              <Field label="Industries" value={(v.industry ?? []).join(", ")} />
              <Field label="Business model" value={v.business_model} />
              <Field label="Time to MVP" value={v.time_to_mvp} />
              <Field label="Funding philosophy" value={v.funding_philosophy} accent />
              <Field label="Idea stage" value={v.idea_stage} />
            </div>
          </Section>

          {/* Psychographics */}
          <Section title="Psychographics">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              <Field label="Risk tolerance" value={ps.risk_tolerance ? `${ps.risk_tolerance} / 10` : "—"} />
              <Field label="Work-life balance" value={ps.work_life_balance ? `${ps.work_life_balance} / 10` : "—"} />
              <Field label="Decision style" value={ps.decision_style} />
              <Field label="Conflict style" value={ps.conflict_style} />
              <Field label="Ultimate goal" value={ps.ultimate_goal} />
              <Field label="Social battery" value={ps.social_battery} />
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Archetypes */}
          <Section title="Archetypes">
            <Field label="Primary" value={arch.primary} accent />
            <Field label="Secondary" value={arch.secondary} />
            <Field label="Confidence" value={arch.confidence ? `${(arch.confidence * 100).toFixed(0)}%` : "—"} />
          </Section>

          {/* DRI Notes */}
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
              DRI notes
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes — not visible to founders..."
              style={{
                width: "100%", minHeight: 100, padding: 10,
                border: "1px solid var(--gray-200)", borderRadius: 8,
                fontSize: 12, fontFamily: "inherit", color: "var(--gray-700)",
                resize: "vertical", outline: "none",
              }}
            />
            <button
              onClick={saveNotes}
              disabled={savingNotes}
              style={{
                marginTop: 10, padding: "6px 14px", borderRadius: 8,
                border: "none", background: "var(--black)", color: "var(--white)",
                fontSize: 12, fontWeight: 500, cursor: "pointer", opacity: savingNotes ? 0.6 : 1,
              }}
            >
              {savingNotes ? "Saving..." : "Save notes"}
            </button>
          </div>

          {/* Match history */}
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>
              Match history ({matches.length})
            </p>
            {matches.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>No matches yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {matches.slice(0, 8).map(m => (
                  <Link
                    key={m.id}
                    href={`/builders/${m.partner_id}`}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 10px", borderRadius: 6,
                      background: "var(--gray-50)", border: "1px solid var(--gray-100)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--black)" }}>
                      {m.partner_name}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-700)" }}>{Math.round(m.score)}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: "2px 6px", borderRadius: 4,
                        background: m.status === "intro_sent" ? "var(--green-light)" :
                                   m.status === "approved" ? "var(--blue-light)" :
                                   m.status === "rejected" ? "var(--red-light)" : "var(--gray-100)",
                        color: m.status === "intro_sent" ? "var(--green)" :
                               m.status === "approved" ? "var(--blue)" :
                               m.status === "rejected" ? "var(--red)" : "var(--gray-500)",
                        textTransform: "capitalize",
                      }}>
                        {m.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 22 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, color: "var(--gray-500)",
        textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px",
      }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--gray-500)" }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 500,
        color: accent ? "var(--accent-dark)" : "var(--black)",
        textTransform: typeof value === "string" ? "capitalize" : "none",
        textAlign: "right",
      }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

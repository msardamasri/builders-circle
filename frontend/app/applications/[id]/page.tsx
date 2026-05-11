"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { acceptApplication, rejectApplication, holdApplication } from "@/lib/api";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  "pending_review": { label: "Pending review", color: "var(--blue)", bg: "var(--blue-soft)" },
  "video_pending":  { label: "Awaiting video", color: "var(--amber)", bg: "var(--amber-soft)" },
  "on_hold":        { label: "On hold",        color: "var(--text-muted)", bg: "var(--gray-100)" },
  "accepted":       { label: "Accepted",       color: "var(--green)", bg: "var(--green-soft)" },
  "rejected":       { label: "Rejected",       color: "var(--red)", bg: "var(--red-soft)" },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showHold, setShowHold] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [holdNote, setHoldNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("applications").select("*").eq("id", id).single()
      .then(({ data }) => { setApp(data); setLoading(false); });
  }, [id]);

  async function handleAccept() {
    if (!confirm(`Accept ${app.full_name}? This will create a founder profile and add them to the matching engine.`)) return;
    setSubmitting(true); setError(null);
    const res = await acceptApplication(id);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Failed"); return; }
    router.push("/applications");
  }

  async function handleReject() {
    setSubmitting(true); setError(null);
    const res = await rejectApplication(id, rejectReason);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Failed"); return; }
    router.push("/applications");
  }

  async function handleHold() {
    setSubmitting(true); setError(null);
    const res = await holdApplication(id, holdNote);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Failed"); return; }
    router.push("/applications");
  }

  if (loading) return <p style={{ color: "var(--text-faint)" }}>Loading...</p>;
  if (!app) return <p style={{ color: "var(--text-faint)" }}>Application not found.</p>;

  const meta = STATUS_META[app.status] ?? STATUS_META.pending_review;
  const f = app.founder_section ?? {};
  const i = app.idea_section ?? {};
  const p = app.personal_section ?? {};
  const isFinal = app.status === "accepted" || app.status === "rejected";

  return (
    <div>
      <Link href="/applications" style={{ fontSize: 12, color: "var(--text-muted)" }}>← Applications</Link>

      <div style={{
        marginTop: 16, marginBottom: 28,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24,
      }}>
        <div>
          <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 5,
            fontSize: 11, fontWeight: 500,
            color: meta.color, background: meta.bg,
            textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: 14,
          }}>{meta.label}</span>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 400,
            margin: 0, letterSpacing: "-0.02em", color: "var(--text)",
          }}>
            {app.full_name}
          </h1>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <a href={`mailto:${app.email}`} style={{ color: "var(--text-muted)" }}>{app.email}</a>
            {app.linkedin && (
              <a href={app.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>LinkedIn ↗</a>
            )}
            <span style={{ color: "var(--text-faint)" }}>
              Submitted {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {!isFinal && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={handleAccept} disabled={submitting} style={btnAccept}>✓ Accept</button>
            <button onClick={() => setShowHold(true)} disabled={submitting} style={btnHold}>Hold</button>
            <button onClick={() => setShowReject(true)} disabled={submitting} style={btnReject}>✕ Reject</button>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          background: "var(--red-soft)", color: "var(--red)",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 20,
        }}>{error}</div>
      )}

      {showReject && (
        <div style={modalCard}>
          <p style={modalTitle}>Reject application — {app.full_name}</p>
          <p style={modalSub}>The applicant will see the message below on their status page. Be respectful.</p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g., We had an exceptionally strong batch this round..."
            style={textarea} rows={4} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setShowReject(false)} style={btnSecondary}>Cancel</button>
            <button onClick={handleReject} disabled={submitting} style={btnReject}>
              {submitting ? "Rejecting..." : "Confirm rejection"}
            </button>
          </div>
        </div>
      )}

      {showHold && (
        <div style={modalCard}>
          <p style={modalTitle}>Put on hold — {app.full_name}</p>
          <p style={modalSub}>Internal note only. The applicant continues to see "Under review" status.</p>
          <textarea value={holdNote} onChange={e => setHoldNote(e.target.value)}
            placeholder="e.g., Strong fit but waiting to see if their commitment timeline solidifies."
            style={textarea} rows={3} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setShowHold(false)} style={btnSecondary}>Cancel</button>
            <button onClick={handleHold} disabled={submitting} style={btnHold}>
              {submitting ? "Saving..." : "Confirm hold"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Founder profile" eyebrow="Section 1">
            <Grid items={[
              ["Location",          f.location || "—"],
              ["Remote OK",         f.remote_ok ? "Yes" : "No"],
              ["Primary skill",     f.primary_skill || "—"],
              ["Years experience",  f.years_experience || "—"],
              ["Founder history",   f.founder_history?.replace("_", " ") || "—"],
              ["Commitment",        f.commitment?.replace("_", " ") || "—"],
              ["Primary archetype", f.archetype_primary || "—"],
              ["Secondary archetype", f.archetype_secondary || "—"],
            ]} />
            {f.looking_for?.length > 0 && (
              <KeyVal label="Looking for skills">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {f.looking_for.map((s: string) => <span key={s} style={pill}>{s}</span>)}
                </div>
              </KeyVal>
            )}
            {f.background && <Prose label="Background">{f.background}</Prose>}
          </Section>

          <Section title="Idea & venture direction" eyebrow="Section 2">
            <Grid items={[
              ["Idea stage",          i.idea_stage || "—"],
              ["Funding philosophy",  i.funding_philosophy?.replace("_", " ") || "—"],
              ["Business model",      i.business_model?.replace("_", " ") || "—"],
              ["Time to MVP",         i.time_to_mvp || "—"],
            ]} />
            {i.industries?.length > 0 && (
              <KeyVal label="Industries">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {i.industries.map((s: string) => <span key={s} style={pill}>{s}</span>)}
                </div>
              </KeyVal>
            )}
            {i.pitch && <Prose label="The pitch">{i.pitch}</Prose>}
            {i.why_now && <Prose label="Why now">{i.why_now}</Prose>}
          </Section>

          <Section title="The personal answers" eyebrow="Section 3 — most weighted">
            {p.motivation && <Prose label="Why now, why a company">{p.motivation}</Prose>}
            {p.proudest_project && <Prose label="Most ambitious thing built">{p.proudest_project}</Prose>}
            {p.biggest_failure && <Prose label="Failure & lessons">{p.biggest_failure}</Prose>}
            <Grid items={[
              ["Decision style",   p.decision_style?.replace("_", " ") || "—"],
              ["Conflict style",   p.conflict_style?.replace("_", " ") || "—"],
              ["Risk tolerance",   p.risk_tolerance ? `${p.risk_tolerance} / 10` : "—"],
              ["Work-life balance", p.work_life_balance ? `${p.work_life_balance} / 10` : "—"],
            ]} />
            {p.ultimate_goal && <Prose label="5-year vision">{p.ultimate_goal}</Prose>}
            {p.dealbreakers && <Prose label="Co-founder dealbreakers">{p.dealbreakers}</Prose>}
          </Section>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Intro video" eyebrow="Optional">
            {app.video_url ? (
              <video src={app.video_url} controls style={{ width: "100%", borderRadius: 8, background: "#000" }} />
            ) : (
              <div style={{
                background: "var(--bg-soft)", border: "1px dashed var(--border)", borderRadius: 8,
                padding: 24, textAlign: "center",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>No video yet</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6 }}>
                  {app.video_deadline
                    ? `Deadline: ${new Date(app.video_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                    : "—"}
                </p>
                <p style={{ margin: "10px 0 0", fontSize: 11, color: "var(--text-faint)", fontStyle: "italic" }}>
                  Application is reviewable without it.
                </p>
              </div>
            )}
          </Section>

          <Section title="Review metadata" eyebrow="Internal">
            <Grid items={[
              ["Submitted",  new Date(app.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
              ["Reviewed",   app.reviewed_at ? new Date(app.reviewed_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"],
              ["Reviewed by", app.reviewed_by || "—"],
              ["Reference", app.id.slice(0, 8).toUpperCase()],
            ]} />
            {app.dri_notes && <Prose label="DRI notes">{app.dri_notes}</Prose>}
            {app.decision_reason && <Prose label="Rejection reason sent">{app.decision_reason}</Prose>}
            {app.founder_id && (
              <KeyVal label="Linked founder">
                <Link href={`/builders/${app.founder_id}`} style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                  View profile →
                </Link>
              </KeyVal>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 4px" }}>{eyebrow}</p>
      )}
      <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, margin: "0 0 18px", color: "var(--text)", letterSpacing: "-0.01em" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}
function Grid({ items }: { items: [string, any][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{k}</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text)", textTransform: "capitalize" }}>{v}</p>
        </div>
      ))}
    </div>
  );
}
function KeyVal({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{label}</p>
      <div style={{ fontSize: 13, color: "var(--text)" }}>{children}</div>
    </div>
  );
}
function Prose({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: "0 0 6px", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{children}</p>
    </div>
  );
}

const pill: React.CSSProperties = {
  display: "inline-block", padding: "3px 8px", borderRadius: 5,
  background: "var(--bg-soft)", border: "1px solid var(--border)",
  fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize",
};
const btnAccept: React.CSSProperties = { padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--green)", color: "white", fontSize: 13, fontWeight: 500, cursor: "pointer" };
const btnReject: React.CSSProperties = { padding: "9px 18px", borderRadius: 8, border: "1px solid var(--red)", background: "var(--bg)", color: "var(--red)", fontSize: 13, fontWeight: 500, cursor: "pointer" };
const btnHold: React.CSSProperties   = { padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" };
const btnSecondary: React.CSSProperties = { padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" };
const modalCard: React.CSSProperties = { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 };
const modalTitle: React.CSSProperties = { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, margin: "0 0 6px", color: "var(--text)" };
const modalSub: React.CSSProperties = { fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px", lineHeight: 1.6 };
const textarea: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--bg)", color: "var(--text)", outline: "none", fontFamily: "inherit", minHeight: 90, resize: "vertical", lineHeight: 1.6 };

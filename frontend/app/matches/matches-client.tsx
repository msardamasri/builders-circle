"use client";
import { useState } from "react";
import Link from "next/link";
import { updateMatchStatus } from "@/lib/actions";
import { EmptyState } from "@/components/empty-state";

const REC_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  strong:   { bg: "#111111", color: "#ffffff", border: "#111111" },
  moderate: { bg: "var(--accent-light)", color: "var(--accent-dark)", border: "var(--accent-subtle)" },
  weak:     { bg: "var(--gray-50)", color: "var(--gray-500)", border: "var(--gray-200)" },
};

function FounderBlock({ id, name, email, profile }: { id: string; name: string; email: string; profile: any }) {
  const r = profile?.role ?? {};
  const v = profile?.venture ?? {};
  const l = profile?.logistics ?? {};
  const a = profile?.archetypes ?? {};
  return (
    <div style={{ flex: 1 }}>
      <Link href={`/builders/${id}`} style={{ display: "block" }}>
        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, color: "var(--black)" }}>{name}</p>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--gray-400)" }}>{email}</p>
      </Link>
      {a.primary && (
        <span style={{
          display: "inline-block", marginBottom: 8,
          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
          background: "var(--accent-light)", color: "var(--accent-dark)",
        }}>{a.primary}</span>
      )}
      {l.location && <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--gray-600)" }}>{l.location}{l.remote_ok ? " · Remote OK" : ""}</p>}
      {r.primary_skill && (
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--gray-600)" }}>
          <span style={{ color: "var(--gray-400)" }}>Skills: </span>
          <strong style={{ textTransform: "capitalize" }}>{r.primary_skill}</strong>
        </p>
      )}
      {r.looking_for?.length > 0 && (
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--gray-600)" }}>
          <span style={{ color: "var(--gray-400)" }}>Looking for: </span>
          <strong>{r.looking_for.join(", ")}</strong>
        </p>
      )}
      {v.industry?.length > 0 && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--gray-400)" }}>
          Industries: {v.industry.join(", ")}
        </p>
      )}
    </div>
  );
}

function MatchCard({ match, selected, onSelect, onResolved }: {
  match: any; selected: boolean; onSelect: (id: string) => void; onResolved: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const rec = match.recommendation ?? "moderate";
  const rs = REC_STYLE[rec] ?? REC_STYLE.moderate;

  async function handle(status: "approved" | "rejected") {
    setLoading(status);
    try {
      await updateMatchStatus(match.id, status);
      onResolved(match.id, status);
    } finally { setLoading(null); }
  }

  const score = Math.round(match.score);
  const scoreColor = score >= 75 ? "var(--black)" : score >= 60 ? "var(--accent-dark)" : "var(--gray-500)";

  return (
    <div style={{
      background: "var(--white)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--gray-200)"}`,
      borderRadius: 12, overflow: "hidden",
      transition: "border-color 0.15s, box-shadow 0.15s",
      boxShadow: selected ? "0 0 0 3px var(--accent-light)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(match.id)}
          onClick={e => e.stopPropagation()}
          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--accent)", flexShrink: 0 }} />
        <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor, minWidth: 40, letterSpacing: "-0.02em" }}>
          {score}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--black)", flex: 1 }}>
          {match.founder_a?.full_name}
          <span style={{ color: "var(--gray-400)", margin: "0 6px" }}>×</span>
          {match.founder_b?.full_name}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
          background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
          textTransform: "capitalize",
        }}>
          {rec}
        </span>
        <span style={{
          color: "var(--gray-400)", fontSize: 12,
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform 0.15s",
        }}>▼</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--gray-100)", padding: "16px 16px 16px 44px", background: "var(--gray-50)" }}>
          {match.match_thesis && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
                Why this match
              </p>
              <p style={{ fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6, margin: 0 }}>{match.match_thesis}</p>
            </div>
          )}
          {match.main_concern && (
            <div style={{
              background: "var(--amber-light)", border: "1px solid #fde68a", borderRadius: 8,
              padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8,
            }}>
              <span style={{ color: "var(--amber)", fontSize: 12 }}>⚠</span>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e" }}>{match.main_concern}</p>
            </div>
          )}
          <div style={{
            display: "flex", gap: 24, marginBottom: 16,
            background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 8, padding: 16,
          }}>
            <FounderBlock id={match.founder_a?.id} name={match.founder_a?.full_name} email={match.founder_a?.email} profile={match.profileA} />
            <div style={{ width: 1, background: "var(--gray-200)" }} />
            <FounderBlock id={match.founder_b?.id} name={match.founder_b?.full_name} email={match.founder_b?.email} profile={match.profileB} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handle("approved")} disabled={!!loading} style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: "none", background: "var(--black)", color: "var(--white)", opacity: loading ? 0.6 : 1,
            }}>
              {loading === "approved" ? "Sending..." : "Introduce"}
            </button>
            <button onClick={() => handle("rejected")} disabled={!!loading} style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: "1px solid var(--gray-200)", background: "var(--white)", color: "var(--gray-600)",
              opacity: loading ? 0.6 : 1,
            }}>
              {loading === "rejected" ? "..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchesClient({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "strong" | "moderate">("all");
  const [sending, setSending] = useState(false);

  const filtered = matches.filter(m => filter === "all" || m.recommendation === filter);
  const pending = matches.length;
  const strong = matches.filter(m => m.recommendation === "strong").length;

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function handleResolved(id: string) {
    setMatches(ms => ms.filter(m => m.id !== id));
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
  }

  async function sendSelected() {
    setSending(true);
    for (const id of selected) {
      await updateMatchStatus(id, "approved");
      setMatches(ms => ms.filter(m => m.id !== id));
    }
    setSelected(new Set());
    setSending(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
            Matches
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
            {pending} pending · <span style={{ color: "var(--black)", fontWeight: 500 }}>{strong} strong</span>
          </p>
        </div>
        {selected.size > 0 && (
          <button onClick={sendSelected} disabled={sending} style={{
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "none", background: "var(--black)", color: "var(--white)", cursor: "pointer",
          }}>
            {sending ? "Sending..." : `Introduce ${selected.size}`}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["all", "strong", "moderate"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
            border: "1px solid var(--gray-200)",
            background: filter === f ? "var(--black)" : "var(--white)",
            color: filter === f ? "var(--white)" : "var(--gray-600)",
            textTransform: "capitalize",
          }}>
            {f}
          </button>
        ))}
        {selected.size > 0 && (
          <span style={{ marginLeft: 8, fontSize: 13, color: "var(--gray-500)", alignSelf: "center" }}>
            {selected.size} selected
          </span>
        )}
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="◇"
          title="No matches to review"
          description="Once founders are profiled, the matching engine will surface qualified pairs here for the DRI to review and introduce."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(m => (
            <MatchCard key={m.id} match={m} selected={selected.has(m.id)}
              onSelect={toggleSelect} onResolved={handleResolved} />
          ))}
        </div>
      )}
    </div>
  );
}

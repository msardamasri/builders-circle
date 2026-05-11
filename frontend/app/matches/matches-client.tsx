"use client";
<<<<<<< HEAD
import { useState, useMemo } from "react";
import { updateMatchStatus } from "@/lib/actions";
import { supabase } from "@/lib/supabase";

const REC_STYLE: Record<string, { bg: string; color: string }> = {
  strong:   { bg: "#111111", color: "#ffffff" },
  moderate: { bg: "#f3f4f6", color: "#374151" },
  weak:     { bg: "#f9fafb", color: "#9ca3af" },
};

function FounderBlock({ name, email, profile }: { name: string; email: string; profile: any }) {
  const r = profile?.role ?? {};
  const v = profile?.venture ?? {};
  const l = profile?.logistics ?? {};
  return (
    <div style={{ flex: 1 }}>
      <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, color: "var(--black)" }}>{name}</p>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--gray-400)" }}>{email}</p>
=======
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
>>>>>>> origin/feat/amat
      {l.location && <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--gray-600)" }}>{l.location}{l.remote_ok ? " · Remote OK" : ""}</p>}
      {r.primary_skill && (
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--gray-600)" }}>
          <span style={{ color: "var(--gray-400)" }}>Skills: </span>
<<<<<<< HEAD
          <strong>{r.primary_skill}</strong>
=======
          <strong style={{ textTransform: "capitalize" }}>{r.primary_skill}</strong>
>>>>>>> origin/feat/amat
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
<<<<<<< HEAD
  match: any; selected: boolean; onSelect: (id: string) => void; onResolved: (id: string) => void;
=======
  match: any; selected: boolean; onSelect: (id: string) => void; onResolved: (id: string, status: string) => void;
>>>>>>> origin/feat/amat
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const rec = match.recommendation ?? "moderate";
  const rs = REC_STYLE[rec] ?? REC_STYLE.moderate;

  async function handle(status: "approved" | "rejected") {
    setLoading(status);
    try {
      await updateMatchStatus(match.id, status);
<<<<<<< HEAD
      onResolved(match.id);
    } finally { setLoading(null); }
  }

  return (
    <div style={{
      background: "var(--white)",
      border: `1px solid ${selected ? "var(--black)" : "var(--gray-200)"}`,
      borderRadius: 10, overflow: "hidden", transition: "border-color 0.1s"
=======
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
>>>>>>> origin/feat/amat
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}>
        <input type="checkbox" checked={selected} onChange={() => onSelect(match.id)}
          onClick={e => e.stopPropagation()}
<<<<<<< HEAD
          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--black)", flexShrink: 0 }} />
        <span style={{ fontSize: 20, fontWeight: 700, color: "var(--black)", minWidth: 36 }}>{Math.round(match.score)}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--black)", flex: 1 }}>
          {match.founder_a?.full_name}
          <span style={{ color: "var(--gray-400)", margin: "0 6px" }}>&</span>
          {match.founder_b?.full_name}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: rs.bg, color: rs.color, textTransform: "capitalize" }}>
          {rec}
        </span>
        <span style={{ color: "var(--gray-400)", fontSize: 12, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--gray-100)", padding: "16px 16px 16px 44px" }}>
          {match.match_thesis && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Why this match</p>
              <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.6, margin: 0 }}>{match.match_thesis}</p>
            </div>
          )}
          {match.main_concern && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8 }}>
              <span style={{ color: "#d97706", fontSize: 12 }}>!</span>
              <p style={{ margin: 0, fontSize: 12, color: "#92400e" }}>{match.main_concern}</p>
            </div>
          )}
          <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
            <FounderBlock name={match.founder_a?.full_name} email={match.founder_a?.email} profile={match.profileA} />
            <div style={{ width: 1, background: "var(--gray-100)" }} />
            <FounderBlock name={match.founder_b?.full_name} email={match.founder_b?.email} profile={match.profileB} />
=======
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
>>>>>>> origin/feat/amat
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
<<<<<<< HEAD
              border: "1px solid var(--gray-200)", background: "var(--white)", color: "var(--gray-600)", opacity: loading ? 0.6 : 1,
=======
              border: "1px solid var(--gray-200)", background: "var(--white)", color: "var(--gray-600)",
              opacity: loading ? 0.6 : 1,
>>>>>>> origin/feat/amat
            }}>
              {loading === "rejected" ? "..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

<<<<<<< HEAD
// ── By Person view ─────────────────────────────────────────────────────────

function ByPersonView({ matches, onResolved }: { matches: any[]; onResolved: (id: string) => void }) {
  const [selectedFounder, setSelectedFounder] = useState<string | null>(null);
  const [topN, setTopN] = useState(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Build founder index from all matches
  const founders = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; matchCount: number; topScore: number }>();
    matches.forEach(m => {
      const fa = m.founder_a;
      const fb = m.founder_b;
      if (!map.has(fa.id)) map.set(fa.id, { id: fa.id, name: fa.full_name, email: fa.email, matchCount: 0, topScore: 0 });
      if (!map.has(fb.id)) map.set(fb.id, { id: fb.id, name: fb.full_name, email: fb.email, matchCount: 0, topScore: 0 });
      const a = map.get(fa.id)!;
      const b = map.get(fb.id)!;
      a.matchCount++;
      b.matchCount++;
      a.topScore = Math.max(a.topScore, m.score);
      b.topScore = Math.max(b.topScore, m.score);
    });
    return Array.from(map.values()).sort((a, b) => b.topScore - a.topScore);
  }, [matches]);

  const founderMatches = useMemo(() => {
    if (!selectedFounder) return [];
    return matches
      .filter(m => m.founder_a?.id === selectedFounder || m.founder_b?.id === selectedFounder)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }, [matches, selectedFounder, topN]);

  function toggleSelect(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* Founder list */}
      <div style={{ width: 260, flexShrink: 0, background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--gray-100)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Founders</p>
        </div>
        <div style={{ maxHeight: 600, overflowY: "auto" }}>
          {founders.map(f => (
            <div key={f.id}
              onClick={() => setSelectedFounder(f.id === selectedFounder ? null : f.id)}
              style={{
                padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--gray-50)",
                background: selectedFounder === f.id ? "var(--black)" : "transparent",
                transition: "background 0.1s",
              }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: selectedFounder === f.id ? "var(--white)" : "var(--black)" }}>{f.name}</p>
              <p style={{ margin: 0, fontSize: 11, color: selectedFounder === f.id ? "rgba(255,255,255,0.6)" : "var(--gray-400)" }}>
                {f.matchCount} matches · top {Math.round(f.topScore)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Match list for selected founder */}
      <div style={{ flex: 1 }}>
        {!selectedFounder ? (
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--gray-400)", fontSize: 13, margin: 0 }}>Select a founder to see their top matches</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--gray-600)" }}>
                Top matches for <strong style={{ color: "var(--black)" }}>{founders.find(f => f.id === selectedFounder)?.name}</strong>
              </p>
              <div style={{ display: "flex", gap: 4 }}>
                {[3, 5, 10].map(n => (
                  <button key={n} onClick={() => setTopN(n)} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
                    border: "1px solid var(--gray-200)",
                    background: topN === n ? "var(--black)" : "var(--white)",
                    color: topN === n ? "var(--white)" : "var(--gray-600)",
                  }}>Top {n}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {founderMatches.map(m => (
                <MatchCard key={m.id} match={m} selected={selected.has(m.id)}
                  onSelect={toggleSelect}
                  onResolved={id => onResolved(id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function MatchesClient({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"score" | "person">("score");
  const [recFilter, setRecFilter] = useState<"all" | "strong" | "moderate">("all");
  const [sending, setSending] = useState(false);

  const filtered = matches.filter(m => recFilter === "all" || m.recommendation === recFilter);
=======
export function MatchesClient({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "strong" | "moderate">("all");
  const [sending, setSending] = useState(false);

  const filtered = matches.filter(m => filter === "all" || m.recommendation === filter);
  const pending = matches.length;
>>>>>>> origin/feat/amat
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
<<<<<<< HEAD
      handleResolved(id);
=======
      setMatches(ms => ms.filter(m => m.id !== id));
>>>>>>> origin/feat/amat
    }
    setSelected(new Set());
    setSending(false);
  }

  return (
    <div>
      {/* Header */}
<<<<<<< HEAD
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--black)", margin: 0 }}>Matches</h1>
          <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "4px 0 0" }}>
            {matches.length} pending · {strong} strong
=======
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
            Matches
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
            {pending} pending · <span style={{ color: "var(--black)", fontWeight: 500 }}>{strong} strong</span>
>>>>>>> origin/feat/amat
          </p>
        </div>
        {selected.size > 0 && (
          <button onClick={sendSelected} disabled={sending} style={{
<<<<<<< HEAD
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "none", background: "var(--black)", color: "var(--white)", cursor: "pointer",
          }}>
            {sending ? "Sending..." : `Send ${selected.size} introduction${selected.size > 1 ? "s" : ""}`}
=======
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "none", background: "var(--black)", color: "var(--white)", cursor: "pointer",
          }}>
            {sending ? "Sending..." : `Introduce ${selected.size}`}
>>>>>>> origin/feat/amat
          </button>
        )}
      </div>

<<<<<<< HEAD
      {/* View toggle + filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {/* View toggle */}
        <div style={{ display: "flex", background: "var(--gray-100)", borderRadius: 8, padding: 3, gap: 2 }}>
          {(["score", "person"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "5px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer",
              border: "none",
              background: view === v ? "var(--white)" : "transparent",
              color: view === v ? "var(--black)" : "var(--gray-400)",
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              {v === "score" ? "By Score" : "By Person"}
            </button>
          ))}
        </div>

        {/* Rec filter — only in score view */}
        {view === "score" && (
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "strong", "moderate"] as const).map(f => (
              <button key={f} onClick={() => setRecFilter(f)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: "1px solid var(--gray-200)",
                background: recFilter === f ? "var(--black)" : "var(--white)",
                color: recFilter === f ? "var(--white)" : "var(--gray-600)",
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {selected.size > 0 && view === "score" && (
          <span style={{ fontSize: 13, color: "var(--gray-400)", marginLeft: 4 }}>
=======
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
>>>>>>> origin/feat/amat
            {selected.size} selected
          </span>
        )}
      </div>

<<<<<<< HEAD
      {/* Content */}
      {view === "score" ? (
        filtered.length === 0 ? (
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 48, textAlign: "center" }}>
            <p style={{ color: "var(--gray-400)", fontSize: 13, margin: 0 }}>No pending matches.</p>
            <code style={{ display: "block", marginTop: 8, fontSize: 11, color: "var(--gray-300)", background: "var(--gray-50)", padding: "6px 12px", borderRadius: 6 }}>
              POST /api/match
            </code>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(m => (
              <MatchCard key={m.id} match={m} selected={selected.has(m.id)}
                onSelect={toggleSelect} onResolved={handleResolved} />
            ))}
          </div>
        )
      ) : (
        <ByPersonView matches={matches} onResolved={handleResolved} />
      )}
    </div>
  );
}
=======
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
>>>>>>> origin/feat/amat

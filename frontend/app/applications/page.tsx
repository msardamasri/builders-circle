"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/empty-state";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  "pending_review": { label: "Pending review", color: "var(--blue)", bg: "var(--blue-soft)" },
  "video_pending":  { label: "Awaiting video", color: "var(--amber)", bg: "var(--amber-soft)" },
  "on_hold":        { label: "On hold",        color: "var(--text-muted)", bg: "var(--gray-100)" },
  "accepted":       { label: "Accepted",       color: "var(--green)", bg: "var(--green-soft)" },
  "rejected":       { label: "Rejected",       color: "var(--red)", bg: "var(--red-soft)" },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"awaiting" | "accepted" | "rejected" | "all">("awaiting");
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("applications").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setApps(data ?? []); setLoading(false); });
  }, []);

  const filtered = apps.filter(a => {
    if (filter === "awaiting" && !["pending_review", "video_pending"].includes(a.status)) return false;
    if (filter === "accepted" && a.status !== "accepted") return false;
    if (filter === "rejected" && a.status !== "rejected") return false;
    if (search) {
      const s = search.toLowerCase();
      if (!a.full_name?.toLowerCase().includes(s) && !a.email?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const counts = {
    awaiting: apps.filter(a => ["pending_review", "video_pending"].includes(a.status)).length,
    accepted: apps.filter(a => a.status === "accepted").length,
    rejected: apps.filter(a => a.status === "rejected").length,
    all: apps.length,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
          Applications
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "6px 0 0" }}>
          Builders pending DRI confirmation. Review, then accept or reject.
        </p>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {([
            ["awaiting", "Awaiting review", counts.awaiting],
            ["accepted", "Accepted", counts.accepted],
            ["rejected", "Rejected", counts.rejected],
            ["all", "All", counts.all],
          ] as const).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: "1px solid var(--border)",
                background: filter === key ? "var(--text)" : "var(--bg)",
                color: filter === key ? "var(--accent-on)" : "var(--text-muted)",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {label}
              <span style={{
                fontSize: 11, padding: "1px 6px", borderRadius: 999,
                background: filter === key ? "rgba(255,255,255,0.2)" : "var(--gray-100)",
                color: filter === key ? "var(--accent-on)" : "var(--text-muted)",
              }}>{count}</span>
            </button>
          ))}
        </div>
        <input
          placeholder="Search applicants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: "1px solid var(--border)", borderRadius: 8, padding: "7px 14px",
            fontSize: 13, color: "var(--text)", background: "var(--bg)", width: 220, outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="✎"
          title="No applications match your filters"
          description="When applicants submit their forms via the public site, they'll appear here for review."
        />
      ) : (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                {["Applicant", "Status", "Skill / Archetype", "Idea stage", "Funding", "Submitted"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600,
                    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const meta = STATUS_META[a.status] ?? STATUS_META.pending_review;
                return (
                  <tr key={a.id} style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}>
                    <td style={{ padding: 0 }}>
                      <Link href={`/applications/${a.id}`} style={{ display: "block", padding: "12px 16px" }}>
                        <p style={{ margin: 0, fontWeight: 500, color: "var(--text)" }}>{a.full_name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-faint)" }}>{a.email}</p>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-block", fontSize: 11, fontWeight: 500,
                        padding: "3px 8px", borderRadius: 5, color: meta.color, background: meta.bg,
                      }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {a.founder_section?.primary_skill ?? "—"}
                      {a.founder_section?.archetype_primary && (
                        <span style={{ display: "block", fontSize: 11, color: "var(--text-faint)" }}>
                          {a.founder_section.archetype_primary}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {a.idea_section?.idea_stage ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                      {a.idea_section?.funding_philosophy?.replace("_", " ") ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-faint)", fontSize: 12 }}>
                      {new Date(a.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

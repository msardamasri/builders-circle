"use client";
import { useEffect, useState } from "react";
<<<<<<< HEAD
import { supabase } from "@/lib/supabase";
=======
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/empty-state";
>>>>>>> origin/feat/amat

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "profiled":            { label: "Profiled",       color: "#4b5563", bg: "#f3f4f6" },
  "Searching now":       { label: "Searching now",  color: "#15803d", bg: "#f0fdf4" },
  "received":            { label: "Received",       color: "#2563eb", bg: "#eff6ff" },
  "ingestion_failed":    { label: "Failed",         color: "#dc2626", bg: "#fef2f2" },
  "needs_manual_review": { label: "Review needed",  color: "#d97706", bg: "#fffbeb" },
};

export default function BuildersPage() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("founders")
      .select("id, full_name, email, status, created_at, founder_profiles(profile_json)")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => { setBuilders(data ?? []); setLoading(false); });
  }, []);

  const filtered = builders.filter(b => {
    const matchSearch = !search ||
      b.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", ...Array.from(new Set(builders.map(b => b.status)))];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
<<<<<<< HEAD
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--black)", margin: 0 }}>Builders</h1>
          <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "4px 0 0" }}>
            {filtered.length} of {builders.length} builders
=======
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
            Builders
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
            {loading ? "Loading..." : `${filtered.length} of ${builders.length} builders`}
>>>>>>> origin/feat/amat
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              border: "1px solid var(--gray-200)", borderRadius: 8, padding: "7px 12px",
              fontSize: 13, color: "var(--gray-600)", background: "var(--white)", cursor: "pointer",
            }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === "all" ? "All status" : (STATUS_CONFIG[s]?.label ?? s)}</option>
            ))}
          </select>
          <input
            placeholder="Search builders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "1px solid var(--gray-200)", borderRadius: 8, padding: "7px 14px",
<<<<<<< HEAD
              fontSize: 13, color: "var(--black)", background: "var(--white)", width: 220, outline: "none",
=======
              fontSize: 13, color: "var(--black)", background: "var(--white)", width: 240, outline: "none",
>>>>>>> origin/feat/amat
            }}
          />
        </div>
      </div>

      {/* Table */}
<<<<<<< HEAD
      <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
              {["Name", "Location", "Status", "Skill", "Looking for", "Joined"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: "12px 16px" }}>
                  <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 4, width: `${60 + (i * 13) % 40}%` }} />
                </td></tr>
              ))
            ) : filtered.map((b, i) => {
              const profile = b.founder_profiles?.[0]?.profile_json;
              const sc = STATUS_CONFIG[b.status] ?? { label: b.status, color: "#6b7280", bg: "#f3f4f6" };
              return (
                <tr key={b.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-100)" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ margin: 0, fontWeight: 500, color: "var(--black)" }}>{b.full_name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--gray-400)" }}>{b.email}</p>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>
                    {profile?.logistics?.location ?? "—"}
                    {profile?.logistics?.remote_ok && <span style={{ display: "block", fontSize: 11, color: "var(--gray-400)" }}>Remote OK</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 5, color: sc.color, background: sc.bg }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>
                    {profile?.role?.primary_skill ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--gray-600)", fontSize: 12 }}>
                    {(profile?.role?.looking_for ?? []).join(", ") || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--gray-400)", fontSize: 12 }}>
                    {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
=======
      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="No builders match your filters"
          description="Try clearing the search or changing the status filter."
        />
      ) : (
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
                {["Name", "Location", "Status", "Skill", "Archetype", "Looking for", "Joined"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600,
                    color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} style={{ padding: "14px 16px" }}>
                    <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 4, width: `${60 + (i * 13) % 40}%` }} />
                  </td></tr>
                ))
              ) : filtered.map((b, i) => {
                const profile = b.founder_profiles?.[0]?.profile_json;
                const sc = STATUS_CONFIG[b.status] ?? { label: b.status, color: "#6b7280", bg: "#f3f4f6" };
                return (
                  <tr key={b.id} style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--gray-100)" : "none",
                  }}>
                    <td style={{ padding: 0 }}>
                      <Link href={`/builders/${b.id}`} style={{
                        display: "block", padding: "12px 16px", textDecoration: "none",
                      }}>
                        <p style={{ margin: 0, fontWeight: 500, color: "var(--black)" }}>{b.full_name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--gray-400)" }}>{b.email}</p>
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>
                      {profile?.logistics?.location ?? "—"}
                      {profile?.logistics?.remote_ok && (
                        <span style={{ display: "block", fontSize: 11, color: "var(--gray-400)" }}>Remote OK</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-block", fontSize: 11, fontWeight: 500,
                        padding: "3px 8px", borderRadius: 5, color: sc.color, background: sc.bg,
                      }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-600)", textTransform: "capitalize" }}>
                      {profile?.role?.primary_skill ?? "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-600)" }}>
                      {profile?.archetypes?.primary ? (
                        <span style={{
                          fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 5,
                          background: "var(--accent-light)", color: "var(--accent-dark)",
                        }}>
                          {profile.archetypes.primary}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-600)", fontSize: 12 }}>
                      {(profile?.role?.looking_for ?? []).join(", ") || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-400)", fontSize: 12 }}>
                      {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
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
>>>>>>> origin/feat/amat

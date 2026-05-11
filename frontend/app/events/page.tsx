"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/empty-state";

const INDUSTRY_OPTIONS = [
  "ai", "fintech", "healthtech", "edtech", "climate",
  "b2b_saas", "marketplace", "deeptech", "cybersecurity", "logistics",
];

type Event = {
  id: string;
  name: string;
  location: string | null;
  event_date: string | null;
  description?: string | null;
  url?: string | null;
  industry_tags?: string[] | null;
};

type Builder = {
  id: string;
  full_name: string;
  email: string;
  founder_profiles: { profile_json: any }[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("founders")
        .select("id, full_name, email, founder_profiles(profile_json)")
        .limit(200),
    ]).then(([e, b]) => {
      setEvents((e.data ?? []) as Event[]);
      setBuilders((b.data ?? []) as Builder[]);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = events.filter(e => {
    if (filter === "all") return true;
    if (!e.event_date) return filter === "upcoming";
    return filter === "upcoming" ? e.event_date >= today : e.event_date < today;
  });

  function recommendBuilders(event: Event): { builder: Builder; score: number; reasons: string[] }[] {
    return builders
      .map(b => {
        const profile = b.founder_profiles?.[0]?.profile_json;
        if (!profile) return null;

        const loc = profile.logistics?.location;
        const remote = profile.logistics?.remote_ok;
        const industries: string[] = profile.venture?.industry ?? [];

        const reasons: string[] = [];
        let score = 0;

        if (event.location && loc === event.location) {
          score += 2;
          reasons.push(`Same city (${loc})`);
        } else if (remote) {
          score += 0.5;
          reasons.push("Remote-friendly");
        }

        const tagOverlap = (event.industry_tags ?? []).filter(t => industries.includes(t));
        if (tagOverlap.length > 0) {
          score += tagOverlap.length;
          reasons.push(`Industry: ${tagOverlap.join(", ")}`);
        }

        return score > 0 ? { builder: b, score, reasons } : null;
      })
      .filter((x): x is { builder: Builder; score: number; reasons: string[] } => x !== null)
      .sort((a, b) => b.score - a.score);
  }

  async function handleCreate(form: Omit<Event, "id">) {
    const { data, error } = await supabase
      .from("events")
      .insert(form)
      .select()
      .single();
    if (error) {
      alert("Failed to create event: " + error.message);
      return;
    }
    if (data) {
      setEvents(prev => [...prev, data as Event].sort((a, b) =>
        (a.event_date ?? "").localeCompare(b.event_date ?? "")
      ));
    }
    setShowModal(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
            Events
          </h1>
          <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
            Surface relevant events to founders. Recommendations match by location and industry.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "none", background: "var(--accent)", color: "var(--white)", cursor: "pointer",
          }}
        >
          + Add event
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["upcoming", "past", "all"] as const).map(f => (
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
      </div>

      {/* Events list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "var(--gray-400)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="✦"
          title={filter === "upcoming" ? "No upcoming events" : "No events yet"}
          description="Add your first event so the matching engine can suggest which founders might be interested."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(e => {
            const recs = recommendBuilders(e);
            const expanded = expandedId === e.id;
            return (
              <EventCard
                key={e.id}
                event={e}
                recs={recs}
                expanded={expanded}
                onToggle={() => setExpandedId(expanded ? null : e.id)}
              />
            );
          })}
        </div>
      )}

      {showModal && (
        <AddEventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function EventCard({ event, recs, expanded, onToggle }: {
  event: Event;
  recs: { builder: Builder; score: number; reasons: string[] }[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function notifySelected() {
    setNotifying(true);
    // Stub: in production this would write to event_notifications table and trigger emails.
    await new Promise(r => setTimeout(r, 600));
    console.log("Would notify:", Array.from(selected), "for event", event.id);
    setNotified(true);
    setNotifying(false);
    setTimeout(() => { setNotified(false); setSelected(new Set()); }, 2500);
  }

  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "TBD";

  return (
    <div style={{
      background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden",
    }}>
      <div onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", cursor: "pointer",
      }}>
        {/* Date block */}
        <div style={{
          width: 56, flexShrink: 0, textAlign: "center",
          padding: "6px 0", borderRadius: 8,
          background: "var(--accent-light)",
        }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 600, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {event.event_date ? new Date(event.event_date).toLocaleDateString("en-US", { month: "short" }) : "—"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "var(--accent-dark)", lineHeight: 1 }}>
            {event.event_date ? new Date(event.event_date).getDate() : "?"}
          </p>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{event.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--gray-500)" }}>
            {event.location ?? "Location TBD"} · {dateStr}
          </p>
          {event.industry_tags && event.industry_tags.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {event.industry_tags.map(t => (
                <span key={t} style={{
                  fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                  background: "var(--gray-100)", color: "var(--gray-600)",
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        <span style={{
          fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 12,
          background: recs.length > 0 ? "var(--accent-light)" : "var(--gray-100)",
          color: recs.length > 0 ? "var(--accent-dark)" : "var(--gray-500)",
        }}>
          {recs.length} recommended
        </span>
        <span style={{
          color: "var(--gray-400)", fontSize: 12,
          transform: expanded ? "rotate(180deg)" : "none",
          transition: "transform 0.15s",
        }}>▼</span>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--gray-100)", padding: 18, background: "var(--gray-50)" }}>
          {event.description && (
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--gray-700)", lineHeight: 1.6 }}>
              {event.description}
            </p>
          )}
          {event.url && (
            <a href={event.url} target="_blank" rel="noreferrer" style={{
              display: "inline-block", marginBottom: 14,
              fontSize: 12, color: "var(--accent-dark)", textDecoration: "underline",
            }}>
              {event.url} ↗
            </a>
          )}

          <p style={{
            fontSize: 11, fontWeight: 600, color: "var(--gray-500)",
            textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 8px",
          }}>
            Recommended builders ({recs.length})
          </p>

          {recs.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--gray-400)", margin: 0 }}>
              No builders match this event's location or industry tags.
            </p>
          ) : (
            <>
              <div style={{
                background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 8,
                maxHeight: 320, overflowY: "auto",
              }}>
                {recs.map((r, i) => (
                  <label key={r.builder.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    borderBottom: i < recs.length - 1 ? "1px solid var(--gray-100)" : "none",
                    cursor: "pointer",
                  }}>
                    <input
                      type="checkbox"
                      checked={selected.has(r.builder.id)}
                      onChange={() => toggle(r.builder.id)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/builders/${r.builder.id}`} style={{
                        fontSize: 13, fontWeight: 500, color: "var(--black)",
                      }}>
                        {r.builder.full_name}
                      </Link>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--gray-500)" }}>
                        {r.reasons.join(" · ")}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: "var(--accent-dark)",
                      background: "var(--accent-light)", padding: "2px 8px", borderRadius: 4,
                    }}>
                      {r.score.toFixed(1)}
                    </span>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "var(--gray-500)" }}>
                  {selected.size} selected
                </span>
                <button
                  disabled={selected.size === 0 || notifying || notified}
                  onClick={notifySelected}
                  style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: "none", cursor: selected.size === 0 ? "not-allowed" : "pointer",
                    background: notified ? "var(--green)" : "var(--black)",
                    color: "var(--white)",
                    opacity: selected.size === 0 ? 0.4 : 1,
                  }}
                >
                  {notified ? "✓ Notification logged" : notifying ? "Sending..." : `Notify ${selected.size || ""}`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AddEventModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (form: Omit<Event, "id">) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmit({
      name: name.trim(),
      event_date: date || null,
      location: location.trim() || null,
      url: url.trim() || null,
      description: description.trim() || null,
      industry_tags: Array.from(tags),
    });
    setSubmitting(false);
  }

  function toggleTag(t: string) {
    setTags(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(17,17,17,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }} onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit} style={{
        background: "var(--white)", borderRadius: 14, padding: 28, width: 480, maxWidth: "92vw",
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
      }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "var(--black)" }}>
          Add event
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: 12, color: "var(--gray-500)" }}>
          Recommendations are based on location and industry tags.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Name *" value={name} onChange={setName} placeholder="TechBBQ 2026" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date" type="date" value={date} onChange={setDate} />
            <Input label="Location" value={location} onChange={setLocation} placeholder="Barcelona" />
          </div>
          <Input label="URL" value={url} onChange={setUrl} placeholder="https://..." />
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%", padding: "8px 10px", border: "1px solid var(--gray-200)",
                borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none",
                resize: "vertical",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Industry tags
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {INDUSTRY_OPTIONS.map(t => {
                const active = tags.has(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleTag(t)}
                    style={{
                      padding: "4px 10px", borderRadius: 14, fontSize: 11, fontWeight: 500,
                      border: `1px solid ${active ? "var(--accent)" : "var(--gray-200)"}`,
                      background: active ? "var(--accent-light)" : "var(--white)",
                      color: active ? "var(--accent-dark)" : "var(--gray-600)",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 22, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "1px solid var(--gray-200)", background: "var(--white)", color: "var(--gray-600)",
            cursor: "pointer",
          }}>Cancel</button>
          <button type="submit" disabled={submitting || !name.trim()} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            border: "none", background: "var(--black)", color: "var(--white)",
            cursor: "pointer", opacity: submitting || !name.trim() ? 0.5 : 1,
          }}>
            {submitting ? "Creating..." : "Create event"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 600, color: "var(--gray-500)",
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 10px",
          border: "1px solid var(--gray-200)", borderRadius: 8,
          fontSize: 13, color: "var(--black)", background: "var(--white)", outline: "none",
        }}
      />
    </div>
  );
}

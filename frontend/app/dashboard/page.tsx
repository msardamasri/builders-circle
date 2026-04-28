import { getDashboardMetrics, getBuilders, getPendingMatches } from "@/lib/queries";

export default async function DashboardPage() {
  const [metrics, builders, matches] = await Promise.all([
    getDashboardMetrics(),
    getBuilders(),
    getPendingMatches(),
  ]);

  const activeBuilders = builders.filter((b: any) => b.status === "Searching now").length;

  const funnelSteps = [
    { label: "Total in pipeline", value: builders.length },
    { label: "Actively searching", value: activeBuilders },
    { label: "Got matches (60+)", value: Math.round(activeBuilders * 0.7) },
    { label: "Introduced", value: metrics.introsSent },
  ];
  const maxVal = funnelSteps[0].value || 1;

  const statCards = [
    { label: "Total builders", value: metrics.totalFounders },
    { label: "Actively searching", value: activeBuilders },
    { label: "Intros sent", value: metrics.introsSent },
    { label: "Pending matches", value: metrics.pendingMatches },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--black)", margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "var(--gray-400)", margin: "4px 0 0" }}>Overview of the Builders Circle network</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {statCards.map(c => (
          <div key={c.label} style={{
            background: "var(--white)", border: "1px solid var(--gray-200)",
            borderRadius: 10, padding: "20px 24px",
          }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>{c.label}</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: "var(--black)", margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Pipeline funnel */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>Pipeline funnel</p>
          <p style={{ fontSize: 12, color: "var(--gray-400)", margin: "0 0 20px" }}>From total pipeline to introductions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelSteps.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--gray-600)", width: 140, flexShrink: 0 }}>{s.label}</span>
                <div style={{ flex: 1, background: "var(--gray-100)", borderRadius: 4, height: 24, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${(s.value / maxVal) * 100}%`,
                    background: i === 0 ? "var(--black)" : `rgba(17,17,17,${0.75 - i * 0.18})`,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--white)" }}>{s.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline steps */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>Pipeline</p>
          <p style={{ fontSize: 12, color: "var(--gray-400)", margin: "0 0 20px" }}>How Builders Circle works</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Form submission", "Founders apply via form → POST /api/ingest"],
              ["LLM ingestion", "llama3.2:3b extracts signals → mistral:7b synthesizes profile"],
              ["Matching", "Rules hard filter → soft scoring → LLM match thesis"],
              ["DRI review", "Approve or reject each match before any email is sent"],
              ["Introduction", "Resend API sends double opt-in email to both founders"],
            ].map(([step, desc], i, arr) => (
              <div key={step} style={{
                display: "flex", gap: 16, padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--gray-100)" : "none",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--black)", width: 120, flexShrink: 0 }}>{step}</span>
                <span style={{ fontSize: 12, color: "var(--gray-400)", lineHeight: 1.5 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
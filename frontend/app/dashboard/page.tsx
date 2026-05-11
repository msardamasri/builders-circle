import { getDashboardMetrics, getBuilders, getPendingMatches } from "@/lib/queries";
import { HorizontalBarChart, SupplyDemandChart, DonutBreakdown } from "@/components/charts";

export default async function DashboardPage() {
  const [metrics, builders, matches] = await Promise.all([
    getDashboardMetrics(),
    getBuilders(),
    getPendingMatches(),
  ]);

  const profiles = builders
    .map((b: any) => b.founder_profiles?.[0]?.profile_json)
    .filter(Boolean);

  const activeBuilders = builders.filter((b: any) => b.status === "Searching now").length;

  // Archetype distribution
  const archetypeCounts: Record<string, number> = {};
  profiles.forEach((p: any) => {
    const a = p?.archetypes?.primary;
    if (a) archetypeCounts[a] = (archetypeCounts[a] || 0) + 1;
  });
  const archetypeBars = Object.entries(archetypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  // Supply vs demand by skill
  const SKILLS = ["tech", "sales", "ops", "product", "design", "finance"];
  const supplyDemand = SKILLS.map(skill => {
    const supply = profiles.filter((p: any) => p?.role?.primary_skill === skill).length;
    const demand = profiles.filter((p: any) => (p?.role?.looking_for ?? []).includes(skill)).length;
    return { skill, supply, demand };
  });

  // Location breakdown
  const locationCounts: Record<string, number> = {};
  profiles.forEach((p: any) => {
    const loc = p?.logistics?.location;
    if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));

  // Funding philosophy donut
  const fundingCounts: Record<string, number> = { vc_track: 0, bootstrapping: 0, open: 0 };
  profiles.forEach((p: any) => {
    const f = p?.venture?.funding_philosophy;
    if (f && fundingCounts[f] !== undefined) fundingCounts[f]++;
  });
  const fundingItems = [
    { label: "VC track", value: fundingCounts.vc_track, color: "var(--black)" },
    { label: "Bootstrapping", value: fundingCounts.bootstrapping, color: "var(--accent)" },
    { label: "Open", value: fundingCounts.open, color: "var(--gray-300)" },
  ];

  const statCards = [
    { label: "Total builders", value: metrics.totalFounders },
    { label: "Actively searching", value: activeBuilders, accent: true },
    { label: "Intros sent", value: metrics.introsSent },
    { label: "Pending matches", value: metrics.pendingMatches },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
          Network health and supply-demand overview
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {statCards.map(c => (
          <div key={c.label} style={{
            background: "var(--white)", border: "1px solid var(--gray-200)",
            borderRadius: 12, padding: "20px 22px",
            position: "relative", overflow: "hidden",
          }}>
            {c.accent && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "var(--accent)",
              }} />
            )}
            <p style={{
              fontSize: 11, fontWeight: 600, color: "var(--gray-400)",
              textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px",
            }}>{c.label}</p>
            <p style={{
              fontSize: 32, fontWeight: 600, color: "var(--black)", margin: 0,
              letterSpacing: "-0.02em",
            }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Archetype distribution */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>
            Archetype distribution
          </p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "0 0 18px" }}>
            How founders break down across the 12 archetypes
          </p>
          {archetypeBars.length > 0 ? (
            <HorizontalBarChart items={archetypeBars} />
          ) : (
            <p style={{ fontSize: 12, color: "var(--gray-400)" }}>No data yet.</p>
          )}
        </div>

        {/* Funding philosophy */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>
            Funding philosophy
          </p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "0 0 22px" }}>
            VC vs bootstrapping clashes are a hard veto
          </p>
          <DonutBreakdown items={fundingItems} total={profiles.length || 1} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Supply vs demand */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>
            Supply vs demand by skill
          </p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "0 0 18px" }}>
            Black = supply (primary skill). Orange = demand (looking for).
          </p>
          <SupplyDemandChart items={supplyDemand} />
        </div>

        {/* Top locations */}
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--black)", margin: "0 0 4px" }}>
            Top locations
          </p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", margin: "0 0 18px" }}>
            Geographic concentration
          </p>
          {topLocations.length > 0 ? (
            <HorizontalBarChart items={topLocations} />
          ) : (
            <p style={{ fontSize: 12, color: "var(--gray-400)" }}>No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

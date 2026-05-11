// Distribution chart components — pure CSS bars, no chart library needed.

type BarItem = { label: string; value: number; color?: string };

export function HorizontalBarChart({ items, max }: { items: BarItem[]; max?: number }) {
  const peak = max ?? Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 12, color: "var(--gray-600)", width: 110, flexShrink: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{item.label}</span>
          <div style={{
            flex: 1, background: "var(--gray-100)", borderRadius: 4,
            height: 18, overflow: "hidden", position: "relative",
          }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${(item.value / peak) * 100}%`,
              background: item.color ?? "var(--black)",
              transition: "width 0.3s",
            }} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, color: "var(--black)",
            width: 28, textAlign: "right", flexShrink: 0,
          }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// Supply vs demand: shows supply (primary skills), demand (looking_for), and gap
type SupplyDemand = { skill: string; supply: number; demand: number };

export function SupplyDemandChart({ items }: { items: SupplyDemand[] }) {
  const peak = Math.max(...items.flatMap(i => [i.supply, i.demand]), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map(item => {
        const gap = item.supply - item.demand;
        const status = gap > 1 ? "surplus" : gap < -1 ? "shortage" : "balanced";
        const statusColor = status === "shortage" ? "var(--red)" : status === "surplus" ? "var(--amber)" : "var(--green)";
        const statusBg = status === "shortage" ? "var(--red-light)" : status === "surplus" ? "var(--amber-light)" : "var(--green-light)";

        return (
          <div key={item.skill}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--black)", textTransform: "capitalize" }}>
                {item.skill}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                color: statusColor, background: statusBg, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {status === "shortage" ? `Need ${-gap} more` : status === "surplus" ? `${gap} extra` : "Balanced"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "var(--gray-400)", width: 50 }}>Supply</span>
                <div style={{ flex: 1, height: 12, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(item.supply / peak) * 100}%`, height: "100%", background: "var(--black)" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--black)", width: 24, textAlign: "right" }}>{item.supply}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "var(--gray-400)", width: 50 }}>Demand</span>
                <div style={{ flex: 1, height: 12, background: "var(--gray-100)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(item.demand / peak) * 100}%`, height: "100%", background: "var(--accent)" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-dark)", width: 24, textAlign: "right" }}>{item.demand}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Donut-style chart for binary or categorical splits
export function DonutBreakdown({ items, total }: { items: BarItem[]; total: number }) {
  let cumulative = 0;
  const radius = 36;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const colors = ["var(--black)", "var(--accent)", "var(--gray-400)", "var(--gray-200)"];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--gray-100)" strokeWidth={strokeWidth} />
        {items.map((item, i) => {
          const fraction = item.value / total;
          const dash = fraction * circumference;
          const offset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={item.label}
              cx="50" cy="50" r={radius} fill="none"
              stroke={item.color ?? colors[i % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 2,
              background: item.color ?? colors[i % colors.length], flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: "var(--gray-600)", flex: 1, textTransform: "capitalize" }}>{item.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--black)" }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getIntroductions } from "@/lib/queries";
import { EmptyState } from "@/components/empty-state";

export default async function IntroductionsPage() {
  const intros = await getIntroductions();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--black)", margin: 0, letterSpacing: "-0.02em" }}>
          Introductions
        </h1>
        <p style={{ fontSize: 13, color: "var(--gray-500)", margin: "6px 0 0" }}>
          {intros.length} co-founder intros sent by the DRI
        </p>
      </div>

      {intros.length === 0 ? (
        <EmptyState
          icon="→"
          title="No introductions sent yet"
          description="Approved matches will appear here once the DRI sends out the introduction email."
        />
      ) : (
        <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--gray-200)", background: "var(--gray-50)" }}>
                {["Founder A", "Founder B", "Score", "Sent"].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 600,
                    color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {intros.map((i: any, idx: number) => {
                const score = i.match?.score;
                const rec = i.match?.recommendation;
                const recColor = rec === "strong" ? "var(--black)" : rec === "moderate" ? "var(--accent-dark)" : "var(--gray-500)";
                const recBg = rec === "strong" ? "var(--gray-100)" : rec === "moderate" ? "var(--accent-light)" : "var(--gray-50)";

                return (
                  <tr key={i.id} style={{
                    borderBottom: idx < intros.length - 1 ? "1px solid var(--gray-100)" : "none",
                  }}>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 500, color: "var(--black)" }}>{i.founder_a?.full_name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--gray-400)" }}>{i.founder_a?.email}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 500, color: "var(--black)" }}>{i.founder_b?.full_name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--gray-400)" }}>{i.founder_b?.email}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {score != null && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>
                            {Math.round(score)}
                          </span>
                          {rec && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                              color: recColor, background: recBg, textTransform: "capitalize",
                            }}>
                              {rec}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--gray-400)", fontSize: 12 }}>
                      {new Date(i.sent_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
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

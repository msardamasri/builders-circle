import { Suspense } from "react";
import { getIntroductions } from "@/lib/queries";
import { TableSkeleton } from "@/components/skeletons";
import { ScoreBadge } from "@/components/score-badge";

async function IntroductionsTable() {
  const intros = await getIntroductions();

  if (intros.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
        <p className="text-gray-400 text-sm">No introductions sent yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {["Founder A", "Founder B", "Score", "Sent"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {intros.map((i: any) => (
            <tr key={i.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{i.founder_a?.full_name}</p>
                <p className="text-xs text-gray-400">{i.founder_a?.email}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{i.founder_b?.full_name}</p>
                <p className="text-xs text-gray-400">{i.founder_b?.email}</p>
              </td>
              <td className="px-4 py-3">
                {i.match && (
                  <ScoreBadge score={i.match.score} recommendation={i.match.recommendation} />
                )}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {new Date(i.sent_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function IntroductionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Introductions</h2>
        <p className="text-sm text-gray-500">Co-founder intros sent by the DRI</p>
      </div>
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <IntroductionsTable />
      </Suspense>
    </div>
  );
}
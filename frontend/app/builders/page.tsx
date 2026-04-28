import { Suspense } from "react";
import { getBuilders } from "@/lib/queries";
import { TableSkeleton } from "@/components/skeletons";

const STATUS_STYLE: Record<string, string> = {
  profiled:             "bg-green-50 text-green-700 border-green-100",
  received:             "bg-blue-50 text-blue-700 border-blue-100",
  "Searching now":      "bg-purple-50 text-purple-700 border-purple-100",
  ingestion_failed:     "bg-red-50 text-red-700 border-red-100",
  needs_manual_review:  "bg-amber-50 text-amber-700 border-amber-100",
};

async function BuildersTable() {
  const builders = await getBuilders();

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {["Name", "Email", "Status", "Archetype", "Skill", "Location", "Joined"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {builders.map((b: any) => {
            const profile = b.founder_profiles?.[0]?.profile_json;
            const statusStyle = STATUS_STYLE[b.status] ?? "bg-gray-50 text-gray-500 border-gray-100";
            return (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{b.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{b.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${statusStyle}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{profile?.archetypes?.primary ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{profile?.role?.primary_skill ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{profile?.logistics?.location ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BuildersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Builders</h2>
        <p className="text-sm text-gray-500">All founders in the pipeline</p>
      </div>
      <Suspense fallback={<TableSkeleton rows={10} />}>
        <BuildersTable />
      </Suspense>
    </div>
  );
}
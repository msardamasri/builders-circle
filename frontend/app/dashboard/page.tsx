import { Suspense } from "react";
import { getDashboardMetrics } from "@/lib/queries";
import { MetricSkeleton } from "@/components/skeletons";

async function Metrics() {
  const m = await getDashboardMetrics();

  const cards = [
    { label: "Total founders",   value: m.totalFounders,  },
    { label: "Pending matches",  value: m.pendingMatches, },
    { label: "Strong matches",   value: m.strongMatches,  },
    { label: "Intros sent",      value: m.introsSent,     },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-gray-100 rounded-xl p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{c.label}</p>
          <p className="text-3xl font-semibold text-gray-900">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Overview</h2>
        <p className="text-sm text-gray-500">Builders Circle pipeline status</p>
      </div>
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)}
        </div>
      }>
        <Metrics />
      </Suspense>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Pipeline</h3>
        <div className="space-y-3 text-sm">
          {[
            ["Form submission", "Typeform / native form → POST /api/ingest"],
            ["LLM ingestion",   "llama3.2:3b extracts signals → mistral:7b synthesizes profile"],
            ["Matching",        "Rules hard filter → soft scoring → match thesis"],
            ["DRI review",      "Approve or reject each match before any email is sent"],
            ["Introduction",    "Resend API sends double opt-in email to both founders"],
          ].map(([step, desc]) => (
            <div key={step} className="flex gap-4">
              <span className="text-gray-900 font-medium w-36 shrink-0">{step}</span>
              <span className="text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
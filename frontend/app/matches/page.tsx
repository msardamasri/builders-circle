import { Suspense } from "react";
import { getPendingMatches } from "@/lib/queries";
import { MatchesList } from "./matches-list";
import { MatchCardSkeleton } from "@/components/skeletons";

async function MatchesData() {
  const matches = await getPendingMatches();
  return <MatchesList initialMatches={matches as any} />;
}

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Pending matches</h2>
        <p className="text-sm text-gray-500">Review and approve co-founder introductions</p>
      </div>
      <Suspense fallback={
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <MatchCardSkeleton key={i} />)}
        </div>
      }>
        <MatchesData />
      </Suspense>
    </div>
  );
}
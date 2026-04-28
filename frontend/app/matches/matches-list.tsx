"use client";

import { useState } from "react";
import { MatchCard } from "@/components/match-card";

export function MatchesList({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);

  function handleResolved(id: string) {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  if (matches.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
        <p className="text-gray-400 text-sm">No pending matches. Run the matching engine to generate new pairs.</p>
        <code className="block mt-3 text-xs text-gray-300 bg-gray-50 rounded px-3 py-2">
          POST /api/match
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">{matches.length} matches pending review</p>
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} onResolved={handleResolved} />
      ))}
    </div>
  );
}
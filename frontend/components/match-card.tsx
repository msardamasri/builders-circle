"use client";

import { useState } from "react";
import { ScoreBadge } from "./score-badge";
import { updateMatchStatus } from "@/lib/actions";

type Founder = { id: string; full_name: string; email: string };

type Match = {
  id: string;
  score: number;
  recommendation: string | null;
  match_thesis: string | null;
  main_concern: string | null;
  founder_a: Founder;
  founder_b: Founder;
};

export function MatchCard({ match, onResolved }: { match: Match; onResolved: (id: string) => void }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handle(action: "approved" | "rejected") {
    setLoading(action === "approved" ? "approve" : "reject");
    try {
      await updateMatchStatus(match.id, action);
      onResolved(match.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {match.founder_a.full_name}
            <span className="text-gray-400 mx-2">×</span>
            {match.founder_b.full_name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {match.founder_a.email} · {match.founder_b.email}
          </p>
        </div>
        <ScoreBadge score={match.score} recommendation={match.recommendation} />
      </div>

      {/* Thesis */}
      {match.match_thesis && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {match.match_thesis}
        </p>
      )}

      {/* Concern */}
      {match.main_concern && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          <span className="text-amber-500 text-xs mt-0.5">⚠</span>
          <p className="text-xs text-amber-700">{match.main_concern}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => handle("approved")}
          disabled={!!loading}
          className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading === "approve" ? "Sending..." : "Approve & introduce"}
        </button>
        <button
          onClick={() => handle("rejected")}
          disabled={!!loading}
          className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading === "reject" ? "..." : "Reject"}
        </button>
      </div>
    </div>
  );
}
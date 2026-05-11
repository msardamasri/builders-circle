import { getPendingMatches } from "@/lib/queries";
import { MatchesClient } from "./matches-client";

export default async function MatchesPage() {
  const matches = await getPendingMatches();
  return <MatchesClient initialMatches={matches as any[]} />;
}

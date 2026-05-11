type Props = { score: number; recommendation?: string | null };

const config = {
  strong:   { label: "Strong",      bg: "bg-blue-50",   text: "text-blue-700",  border: "border-blue-200" },
  moderate: { label: "Moderate",    bg: "bg-yellow-50", text: "text-yellow-700",border: "border-yellow-200" },
  weak:     { label: "Weak",        bg: "bg-gray-50",   text: "text-gray-500",  border: "border-gray-200" },
  default:  { label: "",            bg: "bg-gray-50",   text: "text-gray-600",  border: "border-gray-200" },
};

export function ScoreBadge({ score, recommendation }: Props) {
  const key = (recommendation ?? "default") as keyof typeof config;
  const c = config[key] ?? config.default;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${c.bg} ${c.text} ${c.border}`}>
      <span className="text-lg font-semibold">{score.toFixed(1)}</span>
      {c.label && <span className="opacity-70">{c.label}</span>}
    </div>
  );
}
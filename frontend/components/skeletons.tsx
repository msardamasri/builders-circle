export function MetricSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
      <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
      <div className="h-8 w-16 bg-gray-200 rounded" />
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-5 w-48 bg-gray-100 rounded" />
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-3/4 bg-gray-100 rounded" />
      <div className="flex gap-3 pt-2">
        <div className="h-9 w-24 bg-gray-100 rounded-lg" />
        <div className="h-9 w-24 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-50 rounded-lg" />
      ))}
    </div>
  );
}
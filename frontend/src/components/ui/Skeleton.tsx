import { cn } from "@/lib/cn";

/** Matches the shape of what's loading, so nothing jumps when it arrives. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("skeleton block", className)} aria-hidden />;
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0">
      <Skeleton className="h-5 w-6 rounded-1" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

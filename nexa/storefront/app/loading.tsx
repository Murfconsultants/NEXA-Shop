import { Skeleton } from "@/components/Skeleton";

// Section 37: "Skeletons should match the final layout." This mirrors the
// product grid shape since that's the most common destination — Next.js
// shows this automatically during route/data loading, no wiring needed.
export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Skeleton className="mb-8 h-8 w-[192px]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </main>
  );
}

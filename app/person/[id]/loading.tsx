import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Skeleton className="h-5 w-32" />
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="mx-auto aspect-square w-32 rounded-full sm:mx-0 sm:w-48" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={`credit-skeleton-${i}`} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
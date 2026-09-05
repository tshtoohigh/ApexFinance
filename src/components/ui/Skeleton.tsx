import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

/** Shimmer loading placeholder. Uses the .skeleton utility from index.css */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

/** A row of skeletons mimicking a list item. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

import { cn } from "@/lib/utils";

export function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-100", className)} />;
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={cn("h-3 animate-pulse rounded bg-slate-100", className)} />;
}

export function SkeletonCircle({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-slate-100", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-base p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <SkeletonCircle className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="h-4 w-1/2" />
          <SkeletonText className="w-1/3" />
        </div>
      </div>
      <SkeletonText className="w-full" />
      <SkeletonText className="w-5/6" />
      <SkeletonText className="w-2/3" />
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-base p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <SkeletonText className="h-3 w-24" />
        <SkeletonCircle className="h-8 w-8" />
      </div>
      <SkeletonBox className="h-8 w-20" />
      <SkeletonText className="w-2/3" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <SkeletonCircle className="h-9 w-9" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-3.5 w-1/3" />
        <SkeletonText className="w-1/2" />
      </div>
      <SkeletonBox className="h-8 w-20" />
    </div>
  );
}

export function SkeletonList({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("card-base divide-y divide-slate-100 px-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  className,
  cardClassName,
}: {
  count?: number;
  className?: string;
  cardClassName?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={cardClassName} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("card-base p-5 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-20" />
      </div>
      <SkeletonBox className="h-56 w-full" />
    </div>
  );
}

export function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <SkeletonBox className="h-6 w-48" />
      <SkeletonText className="w-72" />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4">
              <SkeletonText className="w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonForm({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText className="w-24" />
          <SkeletonBox className="h-10 w-full" />
        </div>
      ))}
      <SkeletonBox className="h-10 w-32" />
    </div>
  );
}

export function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      <SkeletonGrid count={6} />
    </div>
  );
}
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Loading state for the product detail page.
 * Shows a skeleton layout matching the two-column gallery + info grid.
 */
export default function ProductDetailLoading() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Background grid */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Two-column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left — gallery skeleton */}
          <div className="lg:col-span-7">
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right — info skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

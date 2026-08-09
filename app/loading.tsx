import { Skeleton } from '@/components/ui/Skeleton';
import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <Container>
        {/* Hero skeleton */}
        <div className="space-y-8 py-12">
          <Skeleton variant="text" className="h-6 w-48" />
          <Skeleton variant="text" className="h-16 w-3/4" />
          <Skeleton variant="text" className="h-4 w-1/2" />
          <div className="flex gap-4 pt-4">
            <Skeleton variant="rectangular" className="h-12 w-40" />
            <Skeleton variant="rectangular" className="h-12 w-40" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </Container>
    </div>
  );
}

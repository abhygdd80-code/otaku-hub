import { CollectionSkeleton } from '@/components/collections/CollectionSkeleton';

/**
 * Loading state for the collection category page.
 * Uses the existing CollectionSkeleton component.
 */
export default function CollectionCategoryLoading() {
  return <CollectionSkeleton count={8} />;
}

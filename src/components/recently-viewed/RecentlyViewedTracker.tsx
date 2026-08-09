'use client';

import { useEffect } from 'react';
import { useRecentlyViewedStore } from '@/store';

export interface RecentlyViewedTrackerProps {
  /** Product handle to record as viewed */
  handle: string;
}

/**
 * Records a product page view into the Recently Viewed store.
 *
 * Renders nothing — mounted once on the product detail page so the
 * "Keep exploring" rail can follow the user. (Quick View records its
 * own views directly.)
 */
export function RecentlyViewedTracker({ handle }: RecentlyViewedTrackerProps) {
  const recordView = useRecentlyViewedStore(s => s.recordView);

  useEffect(() => {
    if (handle) recordView(handle);
  }, [handle, recordView]);

  return null;
}

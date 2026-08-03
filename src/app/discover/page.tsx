import React, { Suspense } from 'react';
import DiscoverContent from './discover-content';
import { FeedPageSkeleton } from '@/app/components/loading-skeletons';

export default function DiscoverPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={2} showHero={true} />}>
      <DiscoverContent />
    </Suspense>
  );
}

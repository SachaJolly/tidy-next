import React, { Suspense } from 'react';
import LatestContent from './latest-content';
import { FeedPageSkeleton } from '@/app/components/loading-skeletons';

export default function LatestPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={1} showHero={true} />}>
      <LatestContent />
    </Suspense>
  );
}

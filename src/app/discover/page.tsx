import React, { Suspense } from 'react';
import DiscoverContent from './DiscoverContent';
import { FeedPageSkeleton } from '@/components/LoadingSkeletons';

export default function DiscoverPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={2} showHero={true} />}>
      <DiscoverContent />
    </Suspense>
  );
}

import React, { Suspense } from 'react';
import DiscoverContent from './DiscoverContent';
import { FeedPageSkeleton } from '@/layouts/PageLayout/FeedPage.skeleton';

export default function DiscoverPage() {
  return (
    <Suspense fallback={<FeedPageSkeleton sections={2} showHero={true} />}>
      <DiscoverContent />
    </Suspense>
  );
}
